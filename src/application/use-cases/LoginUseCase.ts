import { User } from '../../domain/entities/user';
import { UserRepository } from '../../domain/ports/repositories/User_repository';
import { PasswordHasher } from '../../domain/ports/services/PasswordHasher';

export interface LoginDTO {
  email: string;
  password: string;
}

export class LoginUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher,
  ) {}

  async execute(dto: LoginDTO): Promise<User> {
    // 1. Buscar por correo
    const user = await this.userRepository.findByEmail(dto.email.trim().toLowerCase());
    if (!user || !user.passwordHash) {
      throw new Error('Correo o contraseña incorrectos');
    }

    // 2. Comparar la contraseña contra el hash
    const ok = await this.passwordHasher.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new Error('Correo o contraseña incorrectos');
    }

    // 3. Bloquear si aún no confirmó la cuenta
    if (!user.esActivo()) {
      throw new Error('Confirma tu cuenta, revisa tu correo');
    }

    return user;
  }
}
