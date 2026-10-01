import { UserRepository } from '../../domain/ports/repositories/User_repository';
import { TokenRepository } from '../../domain/ports/repositories/TokenRepository';
import { PasswordHasher } from '../../domain/ports/services/PasswordHasher';

// Paso 2 de "Olvidé mi contraseña": valida el código y fija la nueva clave.
export class ResetPasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository,
    private passwordHasher: PasswordHasher,
  ) {}

  async execute(input: { email: string; code: string; password: string }): Promise<void> {
    const user = await this.userRepository.findByEmail(input.email.trim().toLowerCase());
    const ticket = await this.tokenRepository.findByToken(input.code.trim());
    if (!user || !ticket || ticket.usuarioId !== user.id || !ticket.esValido()) {
      throw new Error('Código inválido o vencido, pide uno nuevo');
    }

    user.passwordHash = await this.passwordHasher.hash(input.password);
    ticket.marcarComoUsado();
    await this.tokenRepository.update(ticket);
    await this.userRepository.update(user);
  }
}
