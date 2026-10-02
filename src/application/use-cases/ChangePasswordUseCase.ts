import { UserRepository } from '../../domain/ports/repositories/UserRepository';
import { PasswordHasher } from '../../domain/ports/services/PasswordHasher';

// Cambiar la clave con sesión iniciada (perfil -> cambiar contraseña).
export class ChangePasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher,
  ) {}

  async execute(input: { userId: number; currentPassword: string; newPassword: string }): Promise<void> {
    if (input.newPassword.length < 8) {
      throw new Error('La nueva contraseña debe tener mínimo 8 caracteres');
    }
    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new Error('Usuario no encontrado');
    if (!user.passwordHash) {
      throw new Error('Tu cuenta es de Google, no tiene contraseña que cambiar');
    }
    const ok = await this.passwordHasher.compare(input.currentPassword, user.passwordHash);
    if (!ok) throw new Error('La contraseña actual es incorrecta');

    user.passwordHash = await this.passwordHasher.hash(input.newPassword);
    await this.userRepository.update(user);
  }
}
