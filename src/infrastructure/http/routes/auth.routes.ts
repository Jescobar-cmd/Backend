import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middlewares/validate';
import { requireAuth } from '../middlewares/authMiddleware';
import {
  changePasswordSchema,
  completeGoogleProfileSchema,
  forgotSchema,
  googleSchema,
  loginSchema,
  registerSchema,
  resendCodeSchema,
  resetSchema,
  verifyCodeSchema,
} from '../../../application/validators/auth.schemas';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), AuthController.register);
authRouter.post('/verify-code', validate(verifyCodeSchema), AuthController.verifyCode);
authRouter.post('/resend-code', validate(resendCodeSchema), AuthController.resendCode);
authRouter.post('/login', validate(loginSchema), AuthController.login);
authRouter.post('/google', validate(googleSchema), AuthController.google);
authRouter.post('/google/complete-profile', validate(completeGoogleProfileSchema), AuthController.completeGoogleProfile);
authRouter.post('/forgot-password', validate(forgotSchema), AuthController.forgotPassword);
authRouter.post('/reset-password', validate(resetSchema), AuthController.resetPassword);
authRouter.get('/me', requireAuth, AuthController.me);
authRouter.patch('/me/password', requireAuth, validate(changePasswordSchema), AuthController.changePassword);
