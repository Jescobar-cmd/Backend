/** Calificación que una de las partes deja a la otra al cerrar un contrato. */
export interface Calificacion {
  id: number;
  contratoId: number;
  puntuacion: number;
  comentario: string | null;
  fecha: Date;
  calificador: {
    id: number;
    nombre: string;
    fotoPerfil: string | null;
  };
  calificado: {
    id: number;
    nombre: string;
    fotoPerfil: string | null;
  };
}

export interface NuevaCalificacion {
  contratoId: number;
  calificadorId: number;
  calificadoId: number;
  puntuacion: number;
  comentario?: string | null;
}
