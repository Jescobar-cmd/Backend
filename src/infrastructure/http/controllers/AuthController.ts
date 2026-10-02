import { Response, NextFunction } from 'express';
import { container } from '../container';
import { AuthRequest } from '../middlewares/authMiddleware';
import { NotFoundError, UnauthorizedError } from '../../../shared/errors/AppError';

export class AuthController {
  static async register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await container.register.execute(req.body);
      res.status(201).json({
        mensaje: 'Te enviamos un código de 6 dígitos a tu correo para confirmar tu cuenta',
        id: user.id,
        email: user.email,
      });
    } catch (e) {
      next(e);
    }
  }

  static async verifyCode(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await container.confirmCode.execute(req.body);
      res.json({
        mensaje: 'Cuenta confirmada exitosamente, ya puedes iniciar sesión',
      });
    } catch (e) {
      next(e);
    }
  }

  static async resendCode(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await container.resendCode.execute(req.body.email);
      res.json({
        mensaje: 'Si la cuenta existe y está pendiente de activación, te enviamos un código nuevo',
      });
    } catch (e) {
      next(e);
    }
  }

  static async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await container.login.execute(req.body);
      const token = container.jwt.generateToken({
        id: user.id as number,
        email: user.email,
        rol: user.rolId,
      });
      res.json({
        token,
        rol: user.rolId,
        nombre: user.nombre,
        id: user.id,
        email: user.email,
      });
    } catch (e) {
      next(e);
    }
  }

  static async forgotPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await container.requestReset.execute(req.body.email);
      res.json({
        mensaje: 'Si el correo está registrado, te enviamos las instrucciones de recuperación',
      });
    } catch (e) {
      next(e);
    }
  }

  static async resetPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await container.resetPassword.execute(req.body);
      res.json({
        mensaje: 'Contraseña actualizada correctamente, ya puedes iniciar sesión',
      });
    } catch (e) {
      next(e);
    }
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError('No autorizado');
      }

      const user = await container.users.findById(userId);
      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }

      res.json({
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rolId,
        telefono: user.telefono,
        cedula: user.cedula,
        estado: user.estado,
      });
    } catch (e) {
      next(e);
    }
  }

  static async google(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await container.loginWithGoogle.execute(req.body);
      if (result.status === 'needs_onboarding') {
        res.status(202).json({
          needsOnboarding: true,
          email: result.user.email,
          mensaje: 'Completa tu rol y cédula para activar tu cuenta',
        });
        return;
      }
      const token = container.jwt.generateToken({
        id: result.user.id as number,
        email: result.user.email,
        rol: result.user.rolId,
      });
      res.json({
        token,
        rol: result.user.rolId,
        nombre: result.user.nombre,
      });
    } catch (e) {
      next(e);
    }
  }

  static async completeGoogleProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await container.completeGoogleProfile.execute(req.body);
      const token = container.jwt.generateToken({
        id: user.id as number,
        email: user.email,
        rol: user.rolId,
      });
      res.json({
        token,
        rol: user.rolId,
        nombre: user.nombre,
      });
    } catch (e) {
      next(e);
    }
  }

  static async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError('No autorizado');
      }
      await container.changePassword.execute({
        userId,
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
      });
      res.json({ mensaje: 'Contraseña actualizada correctamente' });
    } catch (e) {
      next(e);
    }
  }
}
