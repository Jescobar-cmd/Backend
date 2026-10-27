import { Prisma, PrismaClient } from '@prisma/client';
import { DatosPerfilCliente, PerfilCliente, PerfilPublico } from '../../../domain/entities/Perfil';
import { PerfilRepository } from '../../../domain/ports/repositories/PerfilRepository';

// Relaciones necesarias para armar el perfil (rol + datos por tipo de usuario).
const perfilInclude = {
  Rol: true,
  Cliente: true,
  Freelancer: true,
} satisfies Prisma.UsuarioInclude;

type UsuarioPerfil = Prisma.UsuarioGetPayload<{ include: typeof perfilInclude }>;

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

function toPerfilPublico(usuario: UsuarioPerfil): PerfilPublico {
  // Shape estable según el rol: Cliente (3) siempre trae bloque cliente, Freelancer (2) el suyo.
  const esCliente = usuario.rolId === 3;
  const esFreelancer = usuario.rolId === 2;
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
    freelancer: esFreelancer
      ? {
          tituloProfesional: usuario.Freelancer?.tituloProfesional ?? null,
          biografia: usuario.Freelancer?.biografia ?? null,
          calificacionPromedio: usuario.Freelancer ? Number(usuario.Freelancer.calificacionPromedio) : 0,
        }
      : null,
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

  async actualizarPerfilCliente(usuarioId: number, datos: DatosPerfilCliente): Promise<PerfilCliente | null> {
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

  async obtenerPerfilPublico(usuarioId: number): Promise<PerfilPublico | null> {
    const usuario = await this.db.usuario.findUnique({
      where: { id: usuarioId },
      include: perfilInclude,
    });
    return usuario ? toPerfilPublico(usuario) : null;
  }
}
