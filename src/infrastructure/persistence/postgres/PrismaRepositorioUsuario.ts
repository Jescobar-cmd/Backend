import { PrismaClient, Usuario as PrismaUsuario } from '@prisma/client';
import { Usuario, EstadoUsuario } from '../../../domain/entities/Usuario';
import { RepositorioUsuario } from '../../../domain/ports/repositories/RepositorioUsuario';

function aEntidad(registro: PrismaUsuario): Usuario {
  return new Usuario(
    registro.id,
    registro.nombre,
    registro.email,
    registro.passwordHash,
    registro.rolId,
    registro.telefono,
    registro.cedula,
    registro.esMayorDeEdad,
    registro.estado as EstadoUsuario,
    registro.googleId
  );
}

export class PrismaRepositorioUsuario implements RepositorioUsuario {
  constructor(private db: PrismaClient) {}

  async guardar(usuario: Usuario): Promise<Usuario> {
    const creado = await this.db.usuario.create({
      data: {
        nombre: usuario.nombre,
        email: usuario.email,
        passwordHash: usuario.passwordHash,
        rolId: usuario.rolId,
        telefono: usuario.telefono,
        cedula: usuario.cedula,
        esMayorDeEdad: usuario.esMayorDeEdad,
        estado: usuario.estado,
        googleId: usuario.googleId,
      },
    });
    return aEntidad(creado);
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const encontrado = await this.db.usuario.findUnique({ where: { email } });
    return encontrado ? aEntidad(encontrado) : null;
  }

  async buscarPorCedula(cedula: string): Promise<Usuario | null> {
    const encontrado = await this.db.usuario.findUnique({ where: { cedula } });
    return encontrado ? aEntidad(encontrado) : null;
  }

  async buscarPorGoogleId(googleId: string): Promise<Usuario | null> {
    const encontrado = await this.db.usuario.findUnique({ where: { googleId } });
    return encontrado ? aEntidad(encontrado) : null;
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    const encontrado = await this.db.usuario.findUnique({ where: { id } });
    return encontrado ? aEntidad(encontrado) : null;
  }

  async actualizar(usuario: Usuario): Promise<Usuario | null> {
    if (usuario.id === null) return null;
    const actualizado = await this.db.usuario.update({
      where: { id: usuario.id },
      data: {
        nombre: usuario.nombre,
        email: usuario.email,
        passwordHash: usuario.passwordHash,
        rolId: usuario.rolId,
        telefono: usuario.telefono,
        cedula: usuario.cedula,
        esMayorDeEdad: usuario.esMayorDeEdad,
        estado: usuario.estado,
        googleId: usuario.googleId,
      },
    });
    return aEntidad(actualizado);
  }
}
