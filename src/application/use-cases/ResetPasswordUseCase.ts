import { UserRepository } from '../../domain/ports/repositories/UserRepository';
import { TokenRepository } from '../../domain/ports/repositories/TokenRepository';
import { PasswordHasher } from '../../domain/ports/services/PasswordHasher';
import { BadRequestError } from '../../shared/errors/AppError';

export interface ResetPasswordDTO {
  email: string;
  code: string;
  password: string;
}

export class ResetPasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository,
    private passwordHasher: PasswordHasher,
  ) {}

  async execute(input: ResetPasswordDTO): Promise<void> {
    const cleanEmail = input.email.trim().toLowerCase();
    const cleanCode = input.code.trim();

    const user = await this.userRepository.findByEmail(cleanEmail);
    if (!user || user.id === null) {
      throw new BadRequestError('Código inválido o vencido, solicita uno nuevo');
    }

    const ticket = await this.tokenRepository.findValidByUserAndToken(user.id, cleanCode);
    if (!ticket || !ticket.esValido()) {
      throw new BadRequestError('Código inválido o vencido, solicita uno nuevo');
    }

    user.passwordHash = await this.passwordHasher.hash(input.password);
    ticket.marcarComoUsado();
    await this.tokenRepository.update(ticket);
    await this.tokenRepository.invalidateAllForUser(user.id);
    await this.userRepository.update(user);
  }
}
