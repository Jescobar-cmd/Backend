import { Router } from 'express';
import { ControladorAutenticacion } from '../controllers/ControladorAutenticacion';
import { validar } from '../middlewares/validar';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';
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
} from '../../../application/validators/autenticacion.schemas';

export const autenticacionRouter = Router();

autenticacionRouter.post('/register', validar(registerSchema), ControladorAutenticacion.registrar);
autenticacionRouter.post('/verify-code', validar(verifyCodeSchema), ControladorAutenticacion.verificarCodigo);
autenticacionRouter.post('/resend-code', validar(resendCodeSchema), ControladorAutenticacion.reenviarCodigo);
autenticacionRouter.post('/login', validar(loginSchema), ControladorAutenticacion.iniciarSesion);
autenticacionRouter.post('/google', validar(googleSchema), ControladorAutenticacion.iniciarSesionGoogle);
autenticacionRouter.post('/google/complete-profile', validar(completeGoogleProfileSchema), ControladorAutenticacion.completarPerfilGoogle);
autenticacionRouter.post('/forgot-password', validar(forgotSchema), ControladorAutenticacion.solicitarRecuperacion);
autenticacionRouter.post('/reset-password', validar(resetSchema), ControladorAutenticacion.restablecerContrasena);
autenticacionRouter.get('/me', requiereAutenticacion, ControladorAutenticacion.yo);
autenticacionRouter.patch('/me/password', requiereAutenticacion, validar(changePasswordSchema), ControladorAutenticacion.cambiarContrasena);
