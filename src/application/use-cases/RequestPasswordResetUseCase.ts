import crypto from 'crypto';
import { UserRepository } from '../../domain/ports/repositories/User_repository';
import { TokenRepository } from '../../domain/ports/repositories/TokenRepository';
import { RecoveryToken } from '../../domain/entities/RecoveryToken';
import { EmailSender } from '../../domain/ports/services/EmailSender';

// Paso 1 de "Olvidé mi contraseña": genera código de 6 dígitos (1 hora) y lo envía.
export class RequestPasswordResetUseCase {
  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository,
    private emailSender: EmailSender,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email.trim().toLowerCase());
    // Respuesta genérica para no filtrar qué correos existen
    if (!user) return;

    const code = crypto.randomInt(100000, 1000000).toString();
    const ticket = new RecoveryToken(
      null,
      user.id as number,
      code,
      new Date(Date.now() + 60 * 60 * 1000),
    );
    await this.tokenRepository.save(ticket);
    await this.emailSender.sendPasswordRecoveryEmail(user.email, code);
  }
}
