import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/ports/repositories/UserRepository';
import { GoogleAuthService } from '../../infrastructure/google/GoogleAuthService';

export interface GoogleLoginInput {
  idToken: string; // lo entrega el botón "Continuar con Google" del frontend
  rolId?: number; // viene del toggle Soy cliente / Soy freelancer
  telefono?: string | null;
  cedula?: string | null;
}

export type GoogleLoginResult =
  | { status: 'authenticated'; user: User }
  | { status: 'needs_onboarding'; user: User };

// Entrar o registrarse con Google. Google ya verificó el correo,
// así que estas cuentas no pasan por el código de confirmación.
export class LoginWithGoogleUseCase {
  constructor(
    private userRepository: UserRepository,
    private google: GoogleAuthService,
  ) {}

  async execute(input: GoogleLoginInput): Promise<GoogleLoginResult> {
    const profile = await this.google.verifyIdToken(input.idToken);

    // 1. ¿Ya existe cuenta con este Google? Entra directo si está activa.
    const byGoogle = await this.userRepository.findByGoogleId(profile.googleId);
    if (byGoogle) {
      if (byGoogle.esActivo()) return { status: 'authenticated', user: byGoogle };
      return { status: 'needs_onboarding', user: byGoogle };
    }

    // 2. ¿Existe cuenta de formulario con ese correo? Se enlaza el Google.
    const byEmail = await this.userRepository.findByEmail(profile.email);
    if (byEmail) {
      byEmail.googleId = profile.googleId;
      const linked = await this.userRepository.update(byEmail);
      const user = linked ?? byEmail;
      if (user.esActivo()) return { status: 'authenticated', user };
      return { status: 'needs_onboarding', user };
    }

    // 3. Cuenta nueva: se crea activa porque Google ya validó el email.
    const rolId = input.rolId === 2 ? 2 : 3;
    if (rolId === 2 && !input.cedula) {
      throw new Error('La cédula es obligatoria para freelancers');
    }
    const created = await this.userRepository.save(
      new User(
        null,
        profile.nombre,
        profile.email,
        null, // sin contraseña: entra siempre con Google
        rolId,
        input.telefono ?? null,
        input.cedula ?? null,
        true,
        'activo',
        profile.googleId,
      ),
    );
    return { status: 'authenticated', user: created };
  }
}
