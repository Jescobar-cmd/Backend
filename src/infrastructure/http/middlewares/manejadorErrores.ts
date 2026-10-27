import { Request, Response, NextFunction } from 'express';
import { ErrorAplicacion } from '../../../shared/errors/ErrorAplicacion';

interface ErrorConocidoPrisma {
  code?: string;
  meta?: { target?: string[] };
}

export function manejadorErrores(
  error: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // 1. Errores operacionales controlados (Dominio / Aplicación)
  if (error instanceof ErrorAplicacion) {
    res.status(error.codigoEstado).json({
      success: false,
      error: error.message,
      ...(error.detalles ? { details: error.detalles } : {}),
    });
    return;
  }

  // 2. Errores específicos de base de datos (Prisma)
  const errorPrisma = error as ErrorConocidoPrisma;
  if (errorPrisma && typeof errorPrisma.code === 'string') {
    if (errorPrisma.code === 'P2002') {
      const objetivo = errorPrisma.meta?.target ? ` (${errorPrisma.meta.target.join(', ')})` : '';
      res.status(409).json({
        success: false,
        error: `Ya existe un registro con los datos ingresados${objetivo}`,
      });
      return;
    }
    if (errorPrisma.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'El registro solicitado no fue encontrado',
      });
      return;
    }
  }

  // 3. Errores no controlados (500) - Se loguean internamente sin filtrar detalles al cliente
  console.error('[Error interno]:', error);
  res.status(500).json({
    success: false,
    error: 'Ocurrió un error inesperado en el servidor',
  });
}
