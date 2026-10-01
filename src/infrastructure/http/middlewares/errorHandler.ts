import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  const msg = err.message;
  const status = /no autorizado|sesión|confirma|verificada/i.test(msg) ? 401 : 400;
  res.status(status).json({ error: msg });
}
