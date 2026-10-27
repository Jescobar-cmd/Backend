export class ErrorAplicacion extends Error {
  public readonly codigoEstado: number;
  public readonly esOperacional: boolean;
  public readonly detalles?: unknown;

  constructor(message: string, codigoEstado: number = 400, detalles?: unknown) {
    super(message);
    this.codigoEstado = codigoEstado;
    this.esOperacional = true;
    this.detalles = detalles;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ErrorSolicitudInvalida extends ErrorAplicacion {
  constructor(message: string = 'Solicitud inválida', detalles?: unknown) {
    super(message, 400, detalles);
  }
}

export class ErrorNoAutorizado extends ErrorAplicacion {
  constructor(message: string = 'No autorizado', detalles?: unknown) {
    super(message, 401, detalles);
  }
}

export class ErrorProhibido extends ErrorAplicacion {
  constructor(message: string = 'Acceso denegado', detalles?: unknown) {
    super(message, 403, detalles);
  }
}

export class ErrorNoEncontrado extends ErrorAplicacion {
  constructor(message: string = 'Recurso no encontrado', detalles?: unknown) {
    super(message, 404, detalles);
  }
}

export class ErrorConflicto extends ErrorAplicacion {
  constructor(message: string = 'El recurso ya existe o genera conflicto', detalles?: unknown) {
    super(message, 409, detalles);
  }
}

export class ErrorValidacion extends ErrorAplicacion {
  constructor(message: string = 'Error de validación de datos', detalles?: unknown) {
    super(message, 422, detalles);
  }
}

export class ErrorInternoServidor extends ErrorAplicacion {
  constructor(message: string = 'Error interno del servidor') {
    super(message, 500);
  }
}
