import bcrypt from 'bcryptjs';
import { PasswordHasher } from '../../domain/ports/services/PasswordHasher';

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async compare(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }
}
