import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { User } from '../../../domain/entities/user';
import { UserRepository } from '../../../domain/ports/repositories/User_repository';

function toEntity(r: PrismaUser): User {
  return new User(
    r.id,
    r.nombre,
    r.email,
    r.passwordHash,
    r.rolId,
    r.telefono,
    r.cedula,
    r.esMayorDeEdad,
    r.estado as 'activo' | 'inactivo',
    r.googleId,
  );
}

// Adaptador Prisma del puerto UserRepository.
export class PrismaUserRepository implements UserRepository {
  constructor(private db: PrismaClient) {}

  async save(user: User): Promise<User> {
    const created = await this.db.user.create({
      data: {
        nombre: user.nombre,
        email: user.email,
        passwordHash: user.passwordHash,
        rolId: user.rolId,
        telefono: user.telefono,
        cedula: user.cedula,
        esMayorDeEdad: user.esMayorDeEdad,
        estado: user.estado,
        googleId: user.googleId,
      },
    });
    return toEntity(created);
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await this.db.user.findUnique({ where: { email } });
    return found ? toEntity(found) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const found = await this.db.user.findUnique({ where: { googleId } });
    return found ? toEntity(found) : null;
  }

  async update(user: User): Promise<User | null> {
    if (user.id === null) return null;
    const updated = await this.db.user.update({
      where: { id: user.id },
      data: {
        nombre: user.nombre,
        email: user.email,
        passwordHash: user.passwordHash,
        rolId: user.rolId,
        telefono: user.telefono,
        cedula: user.cedula,
        esMayorDeEdad: user.esMayorDeEdad,
        estado: user.estado,
        googleId: user.googleId,
      },
    });
    return toEntity(updated);
  }
}
