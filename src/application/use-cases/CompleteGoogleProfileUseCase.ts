import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/ports/repositories/UserRepository';
import { GoogleAuthService } from '../../infrastructure/google/GoogleAuthService';

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
    private google: GoogleAuthService,
  ) {}

  async execute(input: CompleteGoogleProfileInput): Promise<User> {
    const profile = await this.google.verifyIdToken(input.idToken);
    const user = await this.userRepository.findByGoogleId(profile.googleId);
    if (!user) throw new Error('Cuenta de Google no encontrada');
    if (user.esActivo()) throw new Error('Tu cuenta ya está activa');

    const rolId = input.rolId === 2 ? 2 : 3;
    if (rolId === 2 && !input.cedula) {
      throw new Error('La cédula es obligatoria para freelancers');
    }
    user.rolId = rolId;
    user.telefono = input.telefono ?? null;
    user.cedula = input.cedula ?? null;
    user.activarCuenta();

    const updated = await this.userRepository.update(user);
    return updated ?? user;
  }
}
