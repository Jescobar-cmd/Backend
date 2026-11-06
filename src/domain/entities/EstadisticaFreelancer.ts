/** Estadística diaria del perfil de un freelancer. */
export interface EstadisticaFreelancer {
  id: number;
  freelancerId: number;
  fecha: Date;
  visitasPerfil: number;
  visualizacionesPropuesta: number;
}

/** Resumen agregado para el panel del freelancer. */
export interface ResumenEstadisticasFreelancer {
  totalVisitasPerfil: number;
  totalVisualizacionesPropuesta: number;
  dias: EstadisticaFreelancer[];
}
