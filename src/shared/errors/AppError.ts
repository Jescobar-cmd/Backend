export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number = 400, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Solicitud inválida', details?: unknown) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autorizado', details?: unknown) {
    super(message, 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso denegado', details?: unknown) {
    super(message, 403, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado', details?: unknown) {
    super(message, 404, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'El recurso ya existe o genera conflicto', details?: unknown) {
    super(message, 409, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Error de validación de datos', details?: unknown) {
    super(message, 422, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Error interno del servidor') {
    super(message, 500);
  }
}
