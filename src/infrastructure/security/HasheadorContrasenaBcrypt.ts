import bcrypt from 'bcryptjs';
import { HasheadorContrasena } from '../../domain/ports/services/HasheadorContrasena';

export class HasheadorContrasenaBcrypt implements HasheadorContrasena {
  async hashear(contrasena: string): Promise<string> {
    return bcrypt.hash(contrasena, 12);
  }

  async comparar(contrasena: string, contrasenaHasheada: string): Promise<boolean> {
    return bcrypt.compare(contrasena, contrasenaHasheada);
  }
}
