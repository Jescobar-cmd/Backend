import {
  Liquidacion,
  NuevaLiquidacion,
  ResumenLiquidaciones,
  ResultadoSolicitudRetiro,
} from '../../entities/Liquidacion';

export interface LiquidacionRepository {
  crearParaContrato(datos: NuevaLiquidacion): Promise<Liquidacion>;

  listarPorFreelancer(freelancerId: number): Promise<Liquidacion[]>;

  resumen(freelancerId: number): Promise<ResumenLiquidaciones>;

  solicitarRetiro(freelancerId: number): Promise<ResultadoSolicitudRetiro>;
}
