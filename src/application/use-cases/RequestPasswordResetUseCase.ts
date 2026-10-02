import crypto from 'crypto';
import { UserRepository } from '../../domain/ports/repositories/UserRepository';
import { TokenRepository } from '../../domain/ports/repositories/TokenRepository';
import { RecoveryToken } from '../../domain/entities/RecoveryToken';
import { EmailSender } from '../../domain/ports/services/EmailSender';

export class RequestPasswordResetUseCase {
  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository,
    private emailSender: EmailSender,
  ) {}

  async execute(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(cleanEmail);

    // Respuesta genérica para no filtrar qué correos existen
    if (!user || user.id === null) {
      return;
    }

    await this.tokenRepository.invalidateAllForUser(user.id);

    const code = crypto.randomInt(100000, 1000000).toString();
    const ticket = new RecoveryToken(
      null,
      user.id,
      code,
      new Date(Date.now() + 60 * 60 * 1000) // 1 hora
    );

    await this.tokenRepository.save(ticket);
    await this.emailSender.sendPasswordRecoveryEmail(user.email, code);
  }
}
