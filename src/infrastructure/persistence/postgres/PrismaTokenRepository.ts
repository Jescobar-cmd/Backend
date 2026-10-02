import { PrismaClient, RecoveryToken as PrismaToken } from '@prisma/client';
import { RecoveryToken } from '../../../domain/entities/RecoveryToken';
import { TokenRepository } from '../../../domain/ports/repositories/TokenRepository';

function toEntity(r: PrismaToken): RecoveryToken {
  return new RecoveryToken(r.id, r.usuarioId, r.token, r.fechaExpiracion, r.usado);
}

export class PrismaTokenRepository implements TokenRepository {
  constructor(private db: PrismaClient) {}

  async save(token: RecoveryToken): Promise<RecoveryToken> {
    const created = await this.db.recoveryToken.create({
      data: {
        usuarioId: token.usuarioId,
        token: token.token,
        fechaExpiracion: token.fechaExpiracion,
        usado: token.usado,
      },
    });
    return toEntity(created);
  }

  async findByToken(token: string): Promise<RecoveryToken | null> {
    const found = await this.db.recoveryToken.findUnique({ where: { token } });
    return found ? toEntity(found) : null;
  }

  async findValidByUserAndToken(usuarioId: number, token: string): Promise<RecoveryToken | null> {
    const found = await this.db.recoveryToken.findFirst({
      where: {
        usuarioId,
        token,
        usado: false,
        fechaExpiracion: { gt: new Date() },
      },
      orderBy: { id: 'desc' },
    });
    return found ? toEntity(found) : null;
  }

  async invalidateAllForUser(usuarioId: number): Promise<void> {
    await this.db.recoveryToken.updateMany({
      where: {
        usuarioId,
        usado: false,
      },
      data: {
        usado: true,
      },
    });
  }

  async update(token: RecoveryToken): Promise<RecoveryToken | null> {
    if (token.id === null) return null;
    const updated = await this.db.recoveryToken.update({
      where: { id: token.id },
      data: {
        usado: token.usado,
        fechaExpiracion: token.fechaExpiracion,
      },
    });
    return toEntity(updated);
  }
}
