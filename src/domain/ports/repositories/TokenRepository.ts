import { RecoveryToken } from '../../entities/RecoveryToken';

export interface TokenRepository {
  // Guarda un nuevo ticket cuando el usuario pide recuperar contraseña
  save(token: RecoveryToken): Promise<RecoveryToken>;

  // Busca el ticket en la BD usando el string (ej: "abc123xyz") cuando el usuario hace clic en el enlace
  findByToken(token: string): Promise<RecoveryToken | null>;

  // Actualiza el ticket (para guardarlo marcado como 'usado' cuando ya cambiaron la clave)
  update(token: RecoveryToken): Promise<RecoveryToken | null>;
}