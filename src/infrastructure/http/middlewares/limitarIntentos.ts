import { Request, Response, NextFunction } from 'express';
import { ErrorDemasiadasSolicitudes } from '../../../shared/errors/ErrorAplicacion';

interface OpcionesLimite {
  ventanaMs: number;
  maximo: number;
  mensaje?: string;
}

interface Registro {
  conteo: number;
  reiniciaEn: number;
}

/**
 * Limitador de intentos en memoria (ventana fija) para endpoints sensibles.
 * Suficiente para una sola instancia; si se escala horizontalmente, debe
 * sustituirse por un almacén compartido (p. ej. Redis).
 */
export function limitarIntentos(opciones: OpcionesLimite) {
  const registros = new Map<string, Registro>();

  return (req: Request, _res: Response, next: NextFunction): void => {
    const ahora = Date.now();
    const clave = `${req.ip ?? 'desconocido'}|${req.method}|${req.baseUrl}${req.path}`;
    const registro = registros.get(clave);

    if (!registro || registro.reiniciaEn <= ahora) {
      registros.set(clave, { conteo: 1, reiniciaEn: ahora + opciones.ventanaMs });
      return next();
    }

    registro.conteo += 1;
    if (registro.conteo > opciones.maximo) {
      return next(
        new ErrorDemasiadasSolicitudes(
          opciones.mensaje ??
            'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.'
        )
      );
    }

    return next();
  };
}
