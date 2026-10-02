import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/ports/repositories/UserRepository';
import { PasswordHasher } from '../../domain/ports/services/PasswordHasher';
import { UnauthorizedError } from '../../shared/errors/AppError';

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
    const email = dto.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError('Correo o contraseña incorrectos');
    }

    if (!user.passwordHash) {
      if (user.esRegistroGoogle()) {
        throw new UnauthorizedError('Esta cuenta fue registrada con Google. Inicia sesión con el botón de Google.');
      }
      throw new UnauthorizedError('Correo o contraseña incorrectos');
    }

    const isPasswordValid = await this.passwordHasher.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Correo o contraseña incorrectos');
    }

    if (!user.esActivo()) {
      throw new UnauthorizedError('Confirma tu cuenta antes de iniciar sesión. Revisa tu correo electrónico.');
    }

    return user;
  }
}
