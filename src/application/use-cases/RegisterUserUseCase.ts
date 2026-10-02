import crypto from 'crypto';
import { User } from '../../domain/entities/User';
import { RecoveryToken } from '../../domain/entities/RecoveryToken';
import { UserRepository } from '../../domain/ports/repositories/UserRepository';
import { TokenRepository } from '../../domain/ports/repositories/TokenRepository';
import { PasswordHasher } from '../../domain/ports/services/PasswordHasher';
import { EmailSender } from '../../domain/ports/services/EmailSender';
import { BadRequestError, ConflictError } from '../../shared/errors/AppError';

export interface RegisterUserDTO {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rolId?: number; // 2: Freelancer, 3: Cliente
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
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('El correo electrónico ya está registrado');
    }

    const rolId = dto.rolId === 2 ? 2 : 3;
    const cedula = dto.cedula?.trim() ? dto.cedula.trim() : null;
    const telefono = dto.telefono?.trim() ? dto.telefono.trim() : null;

    if (rolId === 2 && !cedula) {
      throw new BadRequestError('La cédula es obligatoria para freelancers');
    }

    if (cedula) {
      const existingCedula = await this.userRepository.findByCedula(cedula);
      if (existingCedula) {
        throw new ConflictError('La cédula ya se encuentra registrada con otra cuenta');
      }
    }

    const hashedPassword = await this.passwordHasher.hash(dto.password);

    const fullName = `${dto.nombre.trim()} ${dto.apellido.trim()}`.trim();
    const newUser = new User(
      null,
      fullName,
      email,
      hashedPassword,
      rolId,
      telefono,
      cedula,
      true,
      'inactivo',
      null
    );

    const savedUser = await this.userRepository.save(newUser);

    // Invalida tokens previos e inserta el nuevo código de 6 dígitos
    if (savedUser.id !== null) {
      await this.tokenRepository.invalidateAllForUser(savedUser.id);
      const code = crypto.randomInt(100000, 1000000).toString();
      const ticket = new RecoveryToken(
        null,
        savedUser.id,
        code,
        new Date(Date.now() + 15 * 60 * 1000)
      );
      await this.tokenRepository.save(ticket);
      await this.emailSender.sendVerificationEmail(savedUser.email, code);
    }

    return savedUser;
  }
}
