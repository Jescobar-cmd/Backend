import { EstadoReporte, Reporte } from '../../entities/Reporte';

export interface FiltrosReporte {
  estado?: EstadoReporte;
  page: number;
  limit: number;
}

export interface ReporteRepository {
  crear(datos: Omit<Reporte, 'id' | 'fecha' | 'fechaResolucion'>): Promise<Reporte>;

  listar(filtros: FiltrosReporte): Promise<Reporte[]>;

  obtenerPorId(id: number): Promise<Reporte | null>;

  resolver(
    id: number,
    adminId: number,
    resolucion: string,
    estado: EstadoReporte
  ): Promise<Reporte>;
}
