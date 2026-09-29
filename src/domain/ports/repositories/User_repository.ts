import { User } from '../../entities/user';

export interface UserRepository {
  // Guarda un usuario nuevo (cuando se registra)
  save(user: User): Promise<User>;

  // Busca un usuario por su correo (para el login o para ver si el correo ya está en uso)
  findByEmail(email: string): Promise<User | null>;

  // Busca un usuario por su ID de Google (si usó el botón "Continuar con Google")
  findByGoogleId(googleId: string): Promise<User | null>;

  // Actualiza los datos (cuando activa la cuenta o completa la cédula y teléfono)
  update(user: User): Promise<User | null>;
}