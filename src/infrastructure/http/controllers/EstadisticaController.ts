import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { ErrorNoAutorizado, ErrorSolicitudInvalida } from '../../../shared/errors/ErrorAplicacion';

function parsearFecha(valor: unknown, nombre: string): Date | undefined {
  if (typeof valor !== 'string' || !valor) return undefined;
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) {
    throw new ErrorSolicitudInvalida(`El ${nombre} no es una fecha válida`);
  }
  return fecha;
}

export class EstadisticaController {
  /** GET /api/freelancer/estadisticas?desde=&hasta= */
  static async misEstadisticas(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = req.usuario?.id;
      if (!freelancerId) throw new ErrorNoAutorizado('No autorizado');

      const desde = parsearFecha(req.query.desde, 'desde');
      const hasta = parsearFecha(req.query.hasta, 'hasta');
      if (desde && hasta && desde > hasta) {
        throw new ErrorSolicitudInvalida('"desde" no puede ser posterior a "hasta"');
      }

      const resumen = await contenedor.obtenerEstadisticasFreelancer.ejecutar(
        freelancerId,
        desde,
        hasta
      );
      res.json(resumen);
    } catch (e) {
      next(e);
    }
  }
}
