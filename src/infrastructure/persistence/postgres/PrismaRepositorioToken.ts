import { PrismaClient, TokenRecuperacion as PrismaTokenRecuperacion } from '@prisma/client';
import { TokenRecuperacion } from '../../../domain/entities/TokenRecuperacion';
import { RepositorioToken } from '../../../domain/ports/repositories/RepositorioToken';

function aEntidad(registro: PrismaTokenRecuperacion): TokenRecuperacion {
  return new TokenRecuperacion(registro.id, registro.usuarioId, registro.token, registro.fechaExpiracion, registro.usado);
}

export class PrismaRepositorioToken implements RepositorioToken {
  constructor(private db: PrismaClient) {}

  async guardar(token: TokenRecuperacion): Promise<TokenRecuperacion> {
    const creado = await this.db.tokenRecuperacion.create({
      data: {
        usuarioId: token.usuarioId,
        token: token.token,
        fechaExpiracion: token.fechaExpiracion,
        usado: token.usado,
      },
    });
    return aEntidad(creado);
  }

  async buscarPorToken(token: string): Promise<TokenRecuperacion | null> {
    const encontrado = await this.db.tokenRecuperacion.findUnique({ where: { token } });
    return encontrado ? aEntidad(encontrado) : null;
  }

  async buscarValidoPorUsuarioYToken(usuarioId: number, token: string): Promise<TokenRecuperacion | null> {
    const encontrado = await this.db.tokenRecuperacion.findFirst({
      where: {
        usuarioId,
        token,
        usado: false,
        fechaExpiracion: { gt: new Date() },
      },
      orderBy: { id: 'desc' },
    });
    return encontrado ? aEntidad(encontrado) : null;
  }

  async invalidarTodosPorUsuario(usuarioId: number): Promise<void> {
    await this.db.tokenRecuperacion.updateMany({
      where: {
        usuarioId,
        usado: false,
      },
      data: {
        usado: true,
      },
    });
  }

  async actualizar(token: TokenRecuperacion): Promise<TokenRecuperacion | null> {
    if (token.id === null) return null;
    const actualizado = await this.db.tokenRecuperacion.update({
      where: { id: token.id },
      data: {
        usado: token.usado,
        fechaExpiracion: token.fechaExpiracion,
      },
    });
    return aEntidad(actualizado);
  }
}
