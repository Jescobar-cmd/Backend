import { Router } from 'express';
import { ControladorAutenticacion } from '../controllers/ControladorAutenticacion';
import { validar } from '../middlewares/validar';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';
import { limitarIntentos } from '../middlewares/limitarIntentos';
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

const limiteRegistro = limitarIntentos({ ventanaMs: 60 * 60 * 1000, maximo: 10 });
const limiteCodigo = limitarIntentos({ ventanaMs: 15 * 60 * 1000, maximo: 10 });
const limiteReenvio = limitarIntentos({ ventanaMs: 60 * 60 * 1000, maximo: 5 });
const limiteLogin = limitarIntentos({ ventanaMs: 15 * 60 * 1000, maximo: 10 });
const limiteRecuperacion = limitarIntentos({ ventanaMs: 60 * 60 * 1000, maximo: 5 });
const limiteReset = limitarIntentos({ ventanaMs: 60 * 60 * 1000, maximo: 10 });

autenticacionRouter.post('/register', limiteRegistro, validar(registerSchema), ControladorAutenticacion.registrar);
autenticacionRouter.post('/verify-code', limiteCodigo, validar(verifyCodeSchema), ControladorAutenticacion.verificarCodigo);
autenticacionRouter.post('/resend-code', limiteReenvio, validar(resendCodeSchema), ControladorAutenticacion.reenviarCodigo);
autenticacionRouter.post('/login', limiteLogin, validar(loginSchema), ControladorAutenticacion.iniciarSesion);
autenticacionRouter.post('/google', limiteLogin, validar(googleSchema), ControladorAutenticacion.iniciarSesionGoogle);
autenticacionRouter.post('/google/complete-profile', limiteRegistro, validar(completeGoogleProfileSchema), ControladorAutenticacion.completarPerfilGoogle);
autenticacionRouter.post('/forgot-password', limiteRecuperacion, validar(forgotSchema), ControladorAutenticacion.solicitarRecuperacion);
autenticacionRouter.post('/reset-password', limiteReset, validar(resetSchema), ControladorAutenticacion.restablecerContrasena);
autenticacionRouter.get('/me', requiereAutenticacion, ControladorAutenticacion.yo);
autenticacionRouter.patch('/me/password', requiereAutenticacion, validar(changePasswordSchema), ControladorAutenticacion.cambiarContrasena);
