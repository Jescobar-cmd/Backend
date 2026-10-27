export interface PerfilUsuarioOAuth {
  googleId: string;
  email: string;
  nombre: string;
}

export interface VerificadorOAuth {
  verificarIdToken(idToken: string): Promise<PerfilUsuarioOAuth>;
}
