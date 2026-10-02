import { prisma } from '../../config/dbconnection';
import { PrismaUserRepository } from '../persistence/postgres/PrismaUserRepository';
import { PrismaTokenRepository } from '../persistence/postgres/PrismaTokenRepository';
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher';
import { JwtService } from '../security/JwtService';
import { NodemailerEmailSender } from '../email/NodemailerEmailSender';
import { BrevoEmailSender } from '../email/BrevoEmailSender';
import { GoogleAuthService } from '../google/GoogleAuthService';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUserUseCase';
import { ConfirmCodeUseCase } from '../../application/use-cases/ConfirmCodeUseCase';
import { ResendCodeUseCase } from '../../application/use-cases/ResendCodeUseCase';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { LoginWithGoogleUseCase } from '../../application/use-cases/LoginWithGoogleUseCase';
import { CompleteGoogleProfileUseCase } from '../../application/use-cases/CompleteGoogleProfileUseCase';
import { ChangePasswordUseCase } from '../../application/use-cases/ChangePasswordUseCase';
import { RequestPasswordResetUseCase } from '../../application/use-cases/RequestPasswordResetUseCase';
import { ResetPasswordUseCase } from '../../application/use-cases/ResetPasswordUseCase';

// Composition root: conecta puertos e infraestructura con casos de uso
const users = new PrismaUserRepository(prisma);
const tokens = new PrismaTokenRepository(prisma);
const hasher = new BcryptPasswordHasher();
// En Render (BREVO_API_KEY presente) se envía por API HTTPS;
// en local sin esa variable se usa Gmail SMTP, que ahí sí funciona.
const mail = process.env.BREVO_API_KEY ? new BrevoEmailSender() : new NodemailerEmailSender();
const jwt = new JwtService();
const google = new GoogleAuthService();

export const container = {
  users,
  tokens,
  hasher,
  mail,
  jwt,
  register: new RegisterUserUseCase(users, tokens, hasher, mail),
  confirmCode: new ConfirmCodeUseCase(users, tokens),
  resendCode: new ResendCodeUseCase(users, tokens, mail),
  login: new LoginUseCase(users, hasher),
  loginWithGoogle: new LoginWithGoogleUseCase(users, google),
  completeGoogleProfile: new CompleteGoogleProfileUseCase(users, google),
  changePassword: new ChangePasswordUseCase(users, hasher),
  requestReset: new RequestPasswordResetUseCase(users, tokens, mail),
  resetPassword: new ResetPasswordUseCase(users, tokens, hasher),
};
