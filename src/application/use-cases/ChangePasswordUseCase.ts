import { UserRepository } from '../../domain/ports/repositories/UserRepository';
import { PasswordHasher } from '../../domain/ports/services/PasswordHasher';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../shared/errors/AppError';

// Cambiar la clave con sesión iniciada (perfil -> cambiar contraseña).
export class ChangePasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher,
  ) {}

  async execute(input: { userId: number; currentPassword: string; newPassword: string }): Promise<void> {
    if (input.newPassword.length < 8) {
      throw new BadRequestError('La nueva contraseña debe tener mínimo 8 caracteres');
    }

    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    if (!user.passwordHash) {
      throw new BadRequestError('Tu cuenta fue creada con Google, no tiene contraseña que cambiar');
    }

    const isMatch = await this.passwordHasher.compare(input.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('La contraseña actual es incorrecta');
    }

    user.passwordHash = await this.passwordHasher.hash(input.newPassword);
    await this.userRepository.update(user);
  }
}
