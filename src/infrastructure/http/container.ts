import { prisma } from '../../config/dbconnection';
import { PrismaUserRepository } from '../persistence/postgres/PrismaUserRepository';
import { PrismaTokenRepository } from '../persistence/postgres/PrismaTokenRepository';
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher';
import { JwtService } from '../security/JwtService';
import { NodemailerEmailSender } from '../email/NodemailerEmailSender';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUserUseCase';
import { ConfirmCodeUseCase } from '../../application/use-cases/ConfirmCodeUseCase';
import { ResendCodeUseCase } from '../../application/use-cases/ResendCodeUseCase';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { RequestPasswordResetUseCase } from '../../application/use-cases/RequestPasswordResetUseCase';
import { ResetPasswordUseCase } from '../../application/use-cases/ResetPasswordUseCase';

// Composition root: aquí se conectan puertos (dominio) con adaptadores (infraestructura).
const users = new PrismaUserRepository(prisma);
const tokens = new PrismaTokenRepository(prisma);
const hasher = new BcryptPasswordHasher();
const mail = new NodemailerEmailSender();
const jwt = new JwtService();

export const container = {
  users,
  jwt,
  register: new RegisterUserUseCase(users, tokens, hasher, mail),
  confirmCode: new ConfirmCodeUseCase(users, tokens),
  resendCode: new ResendCodeUseCase(users, tokens, mail),
  login: new LoginUseCase(users, hasher),
  requestReset: new RequestPasswordResetUseCase(users, tokens, mail),
  resetPassword: new ResetPasswordUseCase(users, tokens, hasher),
};
