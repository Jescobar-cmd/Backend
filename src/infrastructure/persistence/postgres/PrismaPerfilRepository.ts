import { Prisma, PrismaClient } from '@prisma/client';
import {
  DatosPerfilCliente,
  DatosPerfilFreelancer,
  PerfilCliente,
  PerfilFreelancer,
  PerfilPublico,
} from '../../../domain/entities/Perfil';
import { HabilidadAsignada } from '../../../domain/entities/Habilidad';
import { PerfilRepository } from '../../../domain/ports/repositories/PerfilRepository';
import { ROLES } from '../../../shared/constants/roles';

// Relaciones necesarias para armar el perfil (rol + datos por tipo de usuario).
const perfilInclude = {
  Rol: true,
  Cliente: true,
  Freelancer: {
    include: {
      FreelancerHabilidad: {
        include: { Habilidad: true },
      },
    },
  },
} satisfies Prisma.UsuarioInclude;

type UsuarioPerfil = Prisma.UsuarioGetPayload<{ include: typeof perfilInclude }>;

function aHabilidades(freelancer: UsuarioPerfil['Freelancer']): HabilidadAsignada[] {
  if (!freelancer) return [];
  return freelancer.FreelancerHabilidad
    .map((asignada) => ({
      id: asignada.Habilidad.id,
      nombre: asignada.Habilidad.nombre,
      nivel: asignada.nivel,
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

function aFreelancerPerfil(usuario: UsuarioPerfil) {
  const freelancer = usuario.Freelancer;
  return {
    tituloProfesional: freelancer?.tituloProfesional ?? null,
    biografia: freelancer?.biografia ?? null,
    calificacionPromedio: freelancer ? Number(freelancer.calificacionPromedio) : 0,
    habilidades: aHabilidades(freelancer),
  };
}

function toPerfilCliente(usuario: UsuarioPerfil): PerfilCliente {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    telefono: usuario.telefono,
    fotoPerfil: usuario.fotoPerfil,
    rolId: usuario.rolId,
    rolNombre: usuario.Rol.nombre,
    estado: usuario.estado,
    fechaRegistro: usuario.fechaRegistro,
    cliente: {
      nombreEmpresa: usuario.Cliente?.nombreEmpresa ?? null,
      tipoCliente: usuario.Cliente?.tipoCliente ?? 'natural',
      descripcion: usuario.Cliente?.descripcion ?? null,
    },
  };
}

function toPerfilFreelancer(usuario: UsuarioPerfil): PerfilFreelancer {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    telefono: usuario.telefono,
    fotoPerfil: usuario.fotoPerfil,
    rolId: usuario.rolId,
    rolNombre: usuario.Rol.nombre,
    estado: usuario.estado,
    fechaRegistro: usuario.fechaRegistro,
    freelancer: aFreelancerPerfil(usuario),
  };
}

function toPerfilPublico(usuario: UsuarioPerfil): PerfilPublico {
  // Shape estable según el rol: Cliente (3) siempre trae bloque cliente, Freelancer (2) el suyo.
  const esCliente = usuario.rolId === ROLES.CLIENTE;
  const esFreelancer = usuario.rolId === ROLES.FREELANCER;
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    fotoPerfil: usuario.fotoPerfil,
    rolId: usuario.rolId,
    rolNombre: usuario.Rol.nombre,
    fechaRegistro: usuario.fechaRegistro,
    cliente: esCliente
      ? {
          nombreEmpresa: usuario.Cliente?.nombreEmpresa ?? null,
          tipoCliente: usuario.Cliente?.tipoCliente ?? 'natural',
          descripcion: usuario.Cliente?.descripcion ?? null,
        }
      : null,
    freelancer: esFreelancer ? aFreelancerPerfil(usuario) : null,
  };
}

/** Adaptador Prisma del puerto PerfilRepository. */
export class PrismaPerfilRepository implements PerfilRepository {
  constructor(private db: PrismaClient) {}

  async obtenerPerfilCliente(usuarioId: number): Promise<PerfilCliente | null> {
    const usuario = await this.db.usuario.findUnique({
      where: { id: usuarioId },
      include: perfilInclude,
    });
    return usuario ? toPerfilCliente(usuario) : null;
  }

  async actualizarPerfilCliente(
    usuarioId: number,
    datos: DatosPerfilCliente
  ): Promise<PerfilCliente | null> {
    const existe = await this.db.usuario.findUnique({ where: { id: usuarioId }, select: { id: true } });
    if (!existe) {
      return null;
    }

    // Separamos los campos que viven en Usuario de los que viven en Cliente.
    const datosUsuario: Prisma.UsuarioUpdateInput = {};
    if (datos.nombre !== undefined) datosUsuario.nombre = datos.nombre;
    if (datos.telefono !== undefined) datosUsuario.telefono = datos.telefono;
    if (datos.fotoPerfil !== undefined) datosUsuario.fotoPerfil = datos.fotoPerfil;

    const datosCliente: Prisma.ClienteUpdateInput = {};
    if (datos.descripcion !== undefined) datosCliente.descripcion = datos.descripcion;
    if (datos.nombreEmpresa !== undefined) datosCliente.nombreEmpresa = datos.nombreEmpresa;
    if (datos.tipoCliente !== undefined) datosCliente.tipoCliente = datos.tipoCliente;

    // Transacción: o se guardan ambos, o ninguno (atomicidad).
    await this.db.$transaction(async (tx) => {
      if (Object.keys(datosUsuario).length > 0) {
        await tx.usuario.update({ where: { id: usuarioId }, data: datosUsuario });
      }
      if (Object.keys(datosCliente).length > 0) {
        const crearCliente: Prisma.ClienteUncheckedCreateInput = {
          id: usuarioId,
          descripcion: datos.descripcion,
          nombreEmpresa: datos.nombreEmpresa,
          tipoCliente: datos.tipoCliente,
        };
        await tx.cliente.upsert({
          where: { id: usuarioId },
          create: crearCliente,
          update: datosCliente,
        });
      }
    });

    return this.obtenerPerfilCliente(usuarioId);
  }

  async obtenerPerfilFreelancer(usuarioId: number): Promise<PerfilFreelancer | null> {
    const usuario = await this.db.usuario.findUnique({
      where: { id: usuarioId },
      include: perfilInclude,
    });
    if (!usuario || usuario.rolId !== ROLES.FREELANCER) {
      return null;
    }
    return toPerfilFreelancer(usuario);
  }

  async actualizarPerfilFreelancer(
    usuarioId: number,
    datos: DatosPerfilFreelancer
  ): Promise<PerfilFreelancer | null> {
    const existe = await this.db.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true, rolId: true },
    });
    if (!existe || existe.rolId !== ROLES.FREELANCER) {
      return null;
    }

    const datosUsuario: Prisma.UsuarioUpdateInput = {};
    if (datos.nombre !== undefined) datosUsuario.nombre = datos.nombre;
    if (datos.telefono !== undefined) datosUsuario.telefono = datos.telefono;
    if (datos.fotoPerfil !== undefined) datosUsuario.fotoPerfil = datos.fotoPerfil;

    const datosFreelancer: Prisma.FreelancerUpdateInput = {};
    if (datos.tituloProfesional !== undefined) {
      datosFreelancer.tituloProfesional = datos.tituloProfesional;
    }
    if (datos.biografia !== undefined) {
      datosFreelancer.biografia = datos.biografia;
    }

    const tocaFreelancer =
      Object.keys(datosFreelancer).length > 0 || datos.habilidadIds !== undefined;

    await this.db.$transaction(async (tx) => {
      if (Object.keys(datosUsuario).length > 0) {
        await tx.usuario.update({ where: { id: usuarioId }, data: datosUsuario });
      }

      if (tocaFreelancer) {
        const crearFreelancer: Prisma.FreelancerUncheckedCreateInput = {
          id: usuarioId,
          tituloProfesional: datos.tituloProfesional ?? null,
          biografia: datos.biografia ?? null,
        };
        await tx.freelancer.upsert({
          where: { id: usuarioId },
          create: crearFreelancer,
          update: datosFreelancer,
        });
      }

      if (datos.habilidadIds !== undefined) {
        await tx.freelancerHabilidad.deleteMany({ where: { freelancerId: usuarioId } });
        if (datos.habilidadIds.length > 0) {
          await tx.freelancerHabilidad.createMany({
            data: datos.habilidadIds.map((habilidadId) => ({
              freelancerId: usuarioId,
              habilidadId,
            })),
            skipDuplicates: true,
          });
        }
      }
    });

    return this.obtenerPerfilFreelancer(usuarioId);
  }

  async obtenerPerfilPublico(usuarioId: number): Promise<PerfilPublico | null> {
    const usuario = await this.db.usuario.findUnique({
      where: { id: usuarioId },
      include: perfilInclude,
    });
    return usuario ? toPerfilPublico(usuario) : null;
  }
}
