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
}
