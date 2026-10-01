import { Response } from 'express';
import { container } from '../container';
import { AuthRequest } from '../middlewares/authMiddleware';

// Controlador delgado: solo traduce HTTP <-> casos de uso, sin lógica de negocio.
export class AuthController {
  static async register(req: AuthRequest, res: Response, next: (e: unknown) => void) {
    try {
      const user = await container.register.execute(req.body);
      res.status(201).json({
        mensaje: 'Te enviamos un código de 6 dígitos a tu correo para confirmar tu cuenta',
        id: user.id,
        email: user.email,
      });
    } catch (e) { next(e); }
  }

  static async verifyCode(req: AuthRequest, res: Response, next: (e: unknown) => void) {
    try {
      await container.confirmCode.execute(req.body);
      res.json({ mensaje: 'Cuenta confirmada, ya puedes iniciar sesión' });
    } catch (e) { next(e); }
  }

  static async resendCode(req: AuthRequest, res: Response, next: (e: unknown) => void) {
    try {
      await container.resendCode.execute(req.body.email);
      res.json({ mensaje: 'Si la cuenta existe y está pendiente, te enviamos un código nuevo' });
    } catch (e) { next(e); }
  }

  static async login(req: AuthRequest, res: Response, next: (e: unknown) => void) {
    try {
      const user = await container.login.execute(req.body);
      const token = container.jwt.generateToken({ id: user.id as number, email: user.email, rol: user.rolId });
      res.json({ token, rol: user.rolId, nombre: user.nombre });
    } catch (e) { next(e); }
  }

  static async forgotPassword(req: AuthRequest, res: Response, next: (e: unknown) => void) {
    try {
      await container.requestReset.execute(req.body.email);
      res.json({ mensaje: 'Si el correo existe, te enviamos un código de recuperación' });
    } catch (e) { next(e); }
  }

  static async resetPassword(req: AuthRequest, res: Response, next: (e: unknown) => void) {
    try {
      await container.resetPassword.execute(req.body);
      res.json({ mensaje: 'Contraseña actualizada, vuelve al login' });
    } catch (e) { next(e); }
  }

  static async me(req: AuthRequest, res: Response, next: (e: unknown) => void) {
    try {
      const user = await container.users.findByEmail(req.user!.email);
      res.json({ id: user?.id, nombre: user?.nombre, email: user?.email, rol: user?.rolId });
    } catch (e) { next(e); }
  }
}
