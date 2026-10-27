import { TokenRecuperacion } from '../../entities/TokenRecuperacion';

export interface RepositorioToken {
  guardar(token: TokenRecuperacion): Promise<TokenRecuperacion>;
  buscarPorToken(token: string): Promise<TokenRecuperacion | null>;
  buscarValidoPorUsuarioYToken(usuarioId: number, token: string): Promise<TokenRecuperacion | null>;
  invalidarTodosPorUsuario(usuarioId: number): Promise<void>;
  actualizar(token: TokenRecuperacion): Promise<TokenRecuperacion | null>;
}
