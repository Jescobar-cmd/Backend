import { User } from '../../entities/User';

export interface UserRepository {
  save(user: User): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByCedula(cedula: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  update(user: User): Promise<User | null>;
}
