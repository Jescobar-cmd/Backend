import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/ports/repositories/UserRepository';
import { TokenRepository } from '../../domain/ports/repositories/TokenRepository';
import { BadRequestError } from '../../shared/errors/AppError';

export interface ConfirmCodeDTO {
  email: string;
  code: string;
}

export class ConfirmCodeUseCase {
  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository,
  ) {}

  async execute(dto: ConfirmCodeDTO): Promise<User> {
    const email = dto.email.trim().toLowerCase();
    const code = dto.code.trim();

    const user = await this.userRepository.findByEmail(email);
    if (!user || user.id === null) {
      throw new BadRequestError('Código inválido o vencido, solicita uno nuevo');
    }

    if (user.esActivo()) {
      return user;
    }

    const ticket = await this.tokenRepository.findValidByUserAndToken(user.id, code);
    if (!ticket || !ticket.esValido()) {
      throw new BadRequestError('Código inválido o vencido, solicita uno nuevo');
    }

    user.activarCuenta();
    ticket.marcarComoUsado();
    await this.tokenRepository.update(ticket);
    await this.tokenRepository.invalidateAllForUser(user.id);

    const updated = await this.userRepository.update(user);
    return updated ?? user;
  }
}
