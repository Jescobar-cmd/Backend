import bcrypt from 'bcryptjs';
import { PasswordHasher } from '../../domain/ports/services/PasswordHasher';

// Adaptador de infraestructura: implementa el puerto PasswordHasher con bcrypt.
// El dominio solo conoce la interfaz; aquí está el detalle de la librería externa.
export class BcryptPasswordHasher implements PasswordHasher {
  // 12 rounds: equilibrio entre seguridad y velocidad para el comité
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async compare(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }
}
