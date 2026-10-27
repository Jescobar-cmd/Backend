/** Resumen de una propuesta enviada por un freelancer a una oferta del cliente. */
export interface PropuestaResumen {
  id: number;
  mensaje: string | null;
  montoPropuesto: number;
  estado: string;
  fechaEnvio: Date;
  freelancer: {
    id: number;
    nombre: string;
    fotoPerfil: string | null;
    calificacionPromedio: number;
  };
  /** Presente en el panel del freelancer ("mis propuestas"). */
  proyecto?: { id: number; titulo: string; estado: string };
}

/** Datos para que un freelancer se postule a una oferta. */
export interface NuevaPropuesta {
  mensaje?: string | null;
  montoPropuesto: number;
}

/** Datos que necesita el caso de uso para validar la aceptación/rechazo. */
export interface PropuestaDetalle {
  id: number;
  proyectoId: number;
  freelancerId: number;
  /** Dueño del proyecto. */
  clienteId: number;
  estado: string;
  montoPropuesto: number;
  proyectoEstado: string;
}
