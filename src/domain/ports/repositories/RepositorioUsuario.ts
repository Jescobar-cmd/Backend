import { Usuario } from '../../entities/Usuario';

export interface RepositorioUsuario {
  guardar(usuario: Usuario): Promise<Usuario>;
  buscarPorId(id: number): Promise<Usuario | null>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorCedula(cedula: string): Promise<Usuario | null>;
  buscarPorGoogleId(googleId: string): Promise<Usuario | null>;
  actualizar(usuario: Usuario): Promise<Usuario | null>;
}
