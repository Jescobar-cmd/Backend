import {
  EntregaContrato,
  NuevaEntregaContrato,
} from '../../entities/EntregaContrato';

export interface EntregaContratoRepository {
  crear(datos: NuevaEntregaContrato): Promise<EntregaContrato>;

  listarPorContrato(contratoId: number): Promise<EntregaContrato[]>;

  obtenerPendiente(contratoId: number): Promise<EntregaContrato | null>;

  aprobar(entregaId: number, revisorId: number): Promise<EntregaContrato>;
}
