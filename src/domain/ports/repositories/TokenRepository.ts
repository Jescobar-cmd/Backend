import { RecoveryToken } from '../../entities/RecoveryToken';

export interface TokenRepository {
  save(token: RecoveryToken): Promise<RecoveryToken>;
  findByToken(token: string): Promise<RecoveryToken | null>;
  findValidByUserAndToken(usuarioId: number, token: string): Promise<RecoveryToken | null>;
  invalidateAllForUser(usuarioId: number): Promise<void>;
  update(token: RecoveryToken): Promise<RecoveryToken | null>;
}