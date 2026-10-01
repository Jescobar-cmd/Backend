import crypto from 'crypto';
import { User } from '../../domain/entities/user';
import { RecoveryToken } from '../../domain/entities/RecoveryToken';
import { UserRepository } from '../../domain/ports/repositories/User_repository';
import { TokenRepository } from '../../domain/ports/repositories/TokenRepository';
import { PasswordHasher } from '../../domain/ports/services/PasswordHasher';
import { EmailSender } from '../../domain/ports/services/EmailSender';

export interface RegisterUserDTO {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rolId?: number; // 2: Freelancer, 3: Cliente (viene del toggle del frontend)
  telefono?: string | null;
  cedula?: string | null;
}

export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository,
    private passwordHasher: PasswordHasher,
    private emailSender: EmailSender,
  ) {}

  async execute(dto: RegisterUserDTO): Promise<User> {
    // 1. Verificar si el correo ya existe
    const existingUser = await this.userRepository.findByEmail(dto.email.trim().toLowerCase());
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado');
    }

    // 2. Encriptar la contraseña
    const hashedPassword = await this.passwordHasher.hash(dto.password);

    // 2b. Freelancer exige cédula (viene del formulario extra de tu pantalla)
    const rolId = dto.rolId === 2 ? 2 : 3;
    if (rolId === 2 && !dto.cedula) {
      throw new Error('La cédula es obligatoria para freelancers');
    }

    // 3. Crear la entidad de usuario (constructor posicional: 5-10 argumentos).
    // El id es null porque lo genera la BD (SERIAL).
    const newUser = new User(
      null,
      `${dto.nombre.trim()} ${dto.apellido.trim()}`.trim(),
      dto.email.trim().toLowerCase(),
      hashedPassword,
      rolId,
      dto.telefono ?? null,
      dto.cedula ?? null,
      true,
      'inactivo',
      null,
    );

    // 4. Guardar en el repositorio
    const savedUser = await this.userRepository.save(newUser);

    // 5. Generar código de 6 dígitos, GUARDARLO (vence en 15 min) y enviarlo.
    // Sin este guardado no habría cómo validarlo después.
    const code = crypto.randomInt(100000, 1000000).toString();
    const ticket = new RecoveryToken(
      null,
      savedUser.id as number,
      code,
      new Date(Date.now() + 15 * 60 * 1000),
    );
    await this.tokenRepository.save(ticket);
    await this.emailSender.sendVerificationEmail(savedUser.email, code);

    return savedUser;
  }
}
