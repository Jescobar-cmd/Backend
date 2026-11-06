import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ErrorValidacion } from '../../../shared/errors/ErrorAplicacion';

export type OrigenValidacion = 'body' | 'query' | 'params';

export function validar(schema: ZodSchema, origen: OrigenValidacion = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req[origen]);
    if (!parsed.success) {
      const issues = (parsed.error as ZodError).issues;
      const details = issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      const detailMsg = issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' | ');
      return next(new ErrorValidacion(`Datos inválidos: ${detailMsg}`, details));
    }
    req[origen] = parsed.data;
    next();
  };
}

export const validarBody = (schema: ZodSchema) => validar(schema, 'body');
export const validarQuery = (schema: ZodSchema) => validar(schema, 'query');
export const validarParams = (schema: ZodSchema) => validar(schema, 'params');
