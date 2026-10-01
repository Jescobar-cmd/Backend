export interface EmailSender {
  sendVerificationEmail(to: string, token: string): Promise<void>;
  sendPasswordRecoveryEmail(to: string, token: string): Promise<void>;
}
