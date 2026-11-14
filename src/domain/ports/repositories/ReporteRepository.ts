import { EstadoReporte, NuevaReporte, Reporte, ReporteDetalle } from '../../entities/Reporte';

export interface FiltrosReporte {
  estado?: EstadoReporte;
  page: number;
  limit: number;
}

export interface ReporteRepository {
  crear(datos: NuevaReporte): Promise<Reporte>;

  listar(filtros: FiltrosReporte): Promise<Reporte[]>;

  contar(filtros: Omit<FiltrosReporte, 'page' | 'limit'>): Promise<number>;

  obtenerPorId(id: number): Promise<Reporte | null>;

  obtenerDetallePorId(id: number): Promise<ReporteDetalle | null>;

  resolver(
    id: number,
    adminId: number,
    resolucion: string,
    estado: EstadoReporte
  ): Promise<Reporte>;
}
