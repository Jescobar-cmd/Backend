import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../../../shared/errors/AppError';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const issues = (parsed.error as ZodError).issues;
      const details = issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      const detailMsg = issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' | ');
      return next(new ValidationError(`Datos inválidos: ${detailMsg}`, details));
    }
    req.body = parsed.data;
    next();
  };
}
