import {
  DatosActualizacionEntrega,
  EntregaContrato,
  NuevaEntregaContrato,
} from '../../entities/EntregaContrato';

export interface EntregaContratoRepository {
  crear(datos: NuevaEntregaContrato): Promise<EntregaContrato>;

  listarPorContrato(contratoId: number): Promise<EntregaContrato[]>;

  obtenerPorId(entregaId: number): Promise<EntregaContrato | null>;

  obtenerPendiente(contratoId: number): Promise<EntregaContrato | null>;

  actualizar(
    entregaId: number,
    datos: DatosActualizacionEntrega
  ): Promise<EntregaContrato>;

  aprobar(entregaId: number, revisorId: number): Promise<EntregaContrato>;

  rechazar(
    entregaId: number,
    revisorId: number,
    observacion: string
  ): Promise<EntregaContrato>;
}
