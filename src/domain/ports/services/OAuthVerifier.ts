export interface OAuthUserProfile {
  googleId: string;
  email: string;
  nombre: string;
}

export interface OAuthVerifier {
  verifyIdToken(idToken: string): Promise<OAuthUserProfile>;
}
