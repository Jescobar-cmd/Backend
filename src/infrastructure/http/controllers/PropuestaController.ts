import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { ErrorSolicitudInvalida, ErrorNoAutorizado } from '../../../shared/errors/ErrorAplicacion';

function parsearId(valor: string, nombre: string): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorSolicitudInvalida(`El id de ${nombre} no es válido`);
  }
  return id;
}

export class PropuestaController {
  /** POST /api/ofertas/:id/propuestas */
  static async crear(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const freelancerId = req.usuario?.id;
      if (!freelancerId) throw new ErrorNoAutorizado('No autorizado');

      const propuesta = await contenedor.crearPropuesta.ejecutar(
        freelancerId,
        parsearId(req.params.id, 'la oferta'),
        req.body
      );
      res.status(201).json({ mensaje: 'Propuesta enviada correctamente', propuesta });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/freelancer/propuestas */
  static async misPropuestas(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const freelancerId = req.usuario?.id;
      if (!freelancerId) throw new ErrorNoAutorizado('No autorizado');

      const propuestas = await contenedor.listarMisPropuestas.ejecutar(freelancerId);
      res.json({ total: propuestas.length, propuestas });
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/cliente/ofertas/:id/propuestas/:propuestaId/aceptar */
  static async aceptar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const clienteId = req.usuario?.id;
      if (!clienteId) throw new ErrorNoAutorizado('No autorizado');

      const contrato = await contenedor.aceptarPropuesta.ejecutar(
        clienteId,
        parsearId(req.params.id, 'la oferta'),
        parsearId(req.params.propuestaId, 'la propuesta')
      );
      res.json({ mensaje: 'Propuesta aceptada y contrato creado', contrato });
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/cliente/ofertas/:id/propuestas/:propuestaId/rechazar */
  static async rechazar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const clienteId = req.usuario?.id;
      if (!clienteId) throw new ErrorNoAutorizado('No autorizado');

      await contenedor.rechazarPropuesta.ejecutar(
        clienteId,
        parsearId(req.params.id, 'la oferta'),
        parsearId(req.params.propuestaId, 'la propuesta')
      );
      res.json({ mensaje: 'Propuesta rechazada' });
    } catch (e) {
      next(e);
    }
  }
}
