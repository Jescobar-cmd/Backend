import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { ErrorSolicitudInvalida } from '../../../shared/errors/ErrorAplicacion';

function parsearEnteroPositivo(valor: unknown, nombre: string): number | undefined {
  if (typeof valor !== 'string' || !valor) return undefined;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ErrorSolicitudInvalida(`El ${nombre} no es válido`);
  }
  return numero;
}

function parsearTexto(valor: unknown): string | undefined {
  return typeof valor === 'string' && valor.trim() ? valor.trim() : undefined;
}

export class DirectorioFreelancerController {
  /** GET /api/freelancers?page=&limit=&q=&habilidadId=&categoriaId= */
  static async listar(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));

      const resultado = await contenedor.buscarFreelancers.ejecutar({
        page,
        limit,
        texto: parsearTexto(req.query.q),
        habilidadId: parsearEnteroPositivo(req.query.habilidadId, 'habilidadId'),
        categoriaId: parsearEnteroPositivo(req.query.categoriaId, 'categoriaId'),
      });
      res.json(resultado);
    } catch (e) {
      next(e);
    }
  }
}
