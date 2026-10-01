export interface TokenService {
  // Firma el JWT de sesión tras un login exitoso
  generateToken(payload: { id: number; email: string; rol: number }): string;

  // Verifica el JWT de las rutas protegidas (lanza si es inválido o expiró)
  verifyToken(token: string): { id: number; email: string; rol: number };
}
