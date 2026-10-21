import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/ports/repositories/UserRepository';
import { OAuthVerifier } from '../../domain/ports/services/OAuthVerifier';
import { BadRequestError, ConflictError, NotFoundError } from '../../shared/errors/AppError';

export interface CompleteGoogleProfileInput {
  idToken: string; // se vuelve a pedir para comprobar que es el dueño de la cuenta
  rolId: number; // 2: Freelancer, 3: Cliente
  telefono?: string | null;
  cedula?: string | null;
}

// Pantallita intermedia: el usuario de Google que quedó pendiente
// completa rol + cédula + teléfono y su cuenta se activa.
export class CompleteGoogleProfileUseCase {
  constructor(
    private userRepository: UserRepository,
    private oauthVerifier: OAuthVerifier,
  ) {}

  async execute(input: CompleteGoogleProfileInput): Promise<User> {
    const profile = await this.oauthVerifier.verifyIdToken(input.idToken);
    const user = await this.userRepository.findByGoogleId(profile.googleId);
    if (!user) {
      throw new NotFoundError('Cuenta de Google no encontrada');
    }
    if (user.esActivo()) {
      throw new BadRequestError('Tu cuenta ya está activa');
    }

    const rolId = input.rolId === 2 ? 2 : 3;
    const cedula = input.cedula?.trim() ? input.cedula.trim() : null;
    const telefono = input.telefono?.trim() ? input.telefono.trim() : null;

    if (rolId === 2 && !cedula) {
      throw new BadRequestError('La cédula es obligatoria para freelancers');
    }

    if (cedula) {
      const existingCedula = await this.userRepository.findByCedula(cedula);
      if (existingCedula && existingCedula.id !== user.id) {
        throw new ConflictError('La cédula ya se encuentra registrada con otra cuenta');
      }
    }

    user.rolId = rolId;
    user.telefono = telefono;
    user.cedula = cedula;
    user.activarCuenta();

    const updated = await this.userRepository.update(user);
    return updated ?? user;
  }
}
