import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { ErrorNoEncontrado, ErrorNoAutorizado } from '../../../shared/errors/ErrorAplicacion';

export class ControladorAutenticacion {
  static async registrar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuario = await contenedor.registrar.ejecutar(req.body);
      res.status(201).json({
        mensaje: 'Te enviamos un código de 6 dígitos a tu correo para confirmar tu cuenta',
        id: usuario.id,
        email: usuario.email,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verificarCodigo(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      await contenedor.confirmarCodigo.ejecutar(req.body);
      res.json({
        mensaje: 'Cuenta confirmada exitosamente, ya puedes iniciar sesión',
      });
    } catch (error) {
      next(error);
    }
  }

  static async reenviarCodigo(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      await contenedor.reenviarCodigo.ejecutar(req.body.email);
      res.json({
        mensaje: 'Si la cuenta existe y está pendiente de activación, te enviamos un código nuevo',
      });
    } catch (error) {
      next(error);
    }
  }

  static async iniciarSesion(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuario = await contenedor.iniciarSesion.ejecutar(req.body);
      const token = contenedor.jwt.generarToken({
        id: usuario.id as number,
        email: usuario.email,
        rol: usuario.rolId,
      });
      res.json({
        token,
        rol: usuario.rolId,
        nombre: usuario.nombre,
        id: usuario.id,
        email: usuario.email,
      });
    } catch (error) {
      next(error);
    }
  }

  static async solicitarRecuperacion(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      await contenedor.solicitarRecuperacion.ejecutar(req.body.email);
      res.json({
        mensaje: 'Si el correo está registrado, te enviamos las instrucciones de recuperación',
      });
    } catch (error) {
      next(error);
    }
  }

  static async restablecerContrasena(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      await contenedor.restablecerContrasena.ejecutar(req.body);
      res.json({
        mensaje: 'Contraseña actualizada correctamente, ya puedes iniciar sesión',
      });
    } catch (error) {
      next(error);
    }
  }

  static async yo(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        throw new ErrorNoAutorizado('No autorizado');
      }

      const usuario = await contenedor.usuarios.buscarPorId(usuarioId);
      if (!usuario) {
        throw new ErrorNoEncontrado('Usuario no encontrado');
      }

      res.json({
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rolId,
        telefono: usuario.telefono,
        cedula: usuario.cedula,
        estado: usuario.estado,
      });
    } catch (error) {
      next(error);
    }
  }

  static async iniciarSesionGoogle(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await contenedor.iniciarSesionGoogle.ejecutar(req.body);
      if (resultado.estado === 'requiere_registro') {
        res.status(202).json({
          needsOnboarding: true,
          email: resultado.usuario.email,
          mensaje: 'Completa tu rol y cédula para activar tu cuenta',
        });
        return;
      }
      const token = contenedor.jwt.generarToken({
        id: resultado.usuario.id as number,
        email: resultado.usuario.email,
        rol: resultado.usuario.rolId,
      });
      res.json({
        token,
        rol: resultado.usuario.rolId,
        nombre: resultado.usuario.nombre,
      });
    } catch (error) {
      next(error);
    }
  }

  static async completarPerfilGoogle(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuario = await contenedor.completarPerfilGoogle.ejecutar(req.body);
      const token = contenedor.jwt.generarToken({
        id: usuario.id as number,
        email: usuario.email,
        rol: usuario.rolId,
      });
      res.json({
        token,
        rol: usuario.rolId,
        nombre: usuario.nombre,
      });
    } catch (error) {
      next(error);
    }
  }

  static async cambiarContrasena(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        throw new ErrorNoAutorizado('No autorizado');
      }
      await contenedor.cambiarContrasena.ejecutar({
        usuarioId,
        contrasenaActual: req.body.currentPassword,
        contrasenaNueva: req.body.newPassword,
      });
      res.json({ mensaje: 'Contraseña actualizada correctamente' });
    } catch (error) {
      next(error);
    }
  }
}
