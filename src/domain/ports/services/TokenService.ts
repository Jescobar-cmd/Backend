export interface TokenPayload {
  id: number;
  email: string;
  rol: number;
}

export interface TokenService {
  generateToken(payload: TokenPayload): string;
  verifyToken(token: string): TokenPayload;
}
