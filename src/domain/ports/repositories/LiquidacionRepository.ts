import {
  Liquidacion,
  NuevaLiquidacion,
  ResumenLiquidaciones,
  ResultadoSolicitudRetiro,
} from '../../entities/Liquidacion';

export interface FiltrosLiquidacion {
  estado?: Liquidacion['estado'];
  page: number;
  limit: number;
}

export interface LiquidacionRepository {
  crearParaContrato(datos: NuevaLiquidacion): Promise<Liquidacion>;

  listarPorFreelancer(freelancerId: number): Promise<Liquidacion[]>;

  resumen(freelancerId: number): Promise<ResumenLiquidaciones>;

  solicitarRetiro(freelancerId: number): Promise<ResultadoSolicitudRetiro>;

  listar(filtros: FiltrosLiquidacion): Promise<Liquidacion[]>;

  obtenerPorId(id: number): Promise<Liquidacion | null>;

  aprobarRetiro(
    id: number,
    adminId: number,
    estado: Liquidacion['estado'],
    referencia: string | null
  ): Promise<Liquidacion>;
}
