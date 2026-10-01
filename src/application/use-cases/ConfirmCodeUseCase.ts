import { User } from '../../domain/entities/user';
import { UserRepository } from '../../domain/ports/repositories/User_repository';
import { TokenRepository } from '../../domain/ports/repositories/TokenRepository';

export interface ConfirmCodeDTO {
  email: string;
  code: string;
}

// Valida el código de 6 dígitos de la pantallita "Verifica tu cuenta".
// Sirve para registro con formulario Y con Google: ambos pasan por aquí.
export class ConfirmCodeUseCase {
  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository,
  ) {}

  async execute(dto: ConfirmCodeDTO): Promise<User> {
    // 1. El código debe pertenecer a este usuario
    const user = await this.userRepository.findByEmail(dto.email.trim().toLowerCase());
    const ticket = await this.tokenRepository.findByToken(dto.code.trim());
    if (!user || !ticket || ticket.usuarioId !== user.id) {
      throw new Error('Código inválido');
    }

    // 2. El ticket debe estar sin usar y sin vencer (esValido lo revisa)
    if (!ticket.esValido()) {
      throw new Error('Código inválido o vencido, pide uno nuevo');
    }

    // 3. Activar la cuenta y quemar el ticket para que no se reutilice
    user.activarCuenta();
    ticket.marcarComoUsado();
    await this.tokenRepository.update(ticket);
    const updated = await this.userRepository.update(user);
    return updated ?? user;
  }
}
