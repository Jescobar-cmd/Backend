import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../shared/errors/AppError';

interface PrismaKnownError {
  code?: string;
  meta?: { target?: string[] };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // 1. Errores operacionales controlados (Dominio / Aplicación)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // 2. Errores específicos de base de datos (Prisma)
  const prismaErr = err as PrismaKnownError;
  if (prismaErr && typeof prismaErr.code === 'string') {
    if (prismaErr.code === 'P2002') {
      const target = prismaErr.meta?.target ? ` (${prismaErr.meta.target.join(', ')})` : '';
      res.status(409).json({
        success: false,
        error: `Ya existe un registro con los datos ingresados${target}`,
      });
      return;
    }
    if (prismaErr.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'El registro solicitado no fue encontrado',
      });
      return;
    }
  }

  // 3. Errores no controlados (500) - Se loguea internamente sin filtrar detalles al cliente
  console.error('[Internal Error]:', err);
  res.status(500).json({
    success: false,
    error: 'Ocurrió un error inesperado en el servidor',
  });
}
