import { ContratoDetalle, EstadoContratoFinal } from '../../entities/Contrato';

export interface ContratoRepository {
  /** Contratos donde el usuario es cliente o freelancer. */
  listar(usuarioId: number): Promise<ContratoDetalle[]>;

  obtener(contratoId: number): Promise<ContratoDetalle | null>;

  /** Crea un contrato de compra directa y deja un pago pendiente. */
  crearCompraDirecta(
    clienteId: number,
    servicioId: number,
    montoPagoCliente: number
  ): Promise<ContratoDetalle>;

  /** Evita contratar dos veces el mismo servicio mientras el contrato siga activo. */
  existeActivoPorServicio(clienteId: number, servicioId: number): Promise<boolean>;

  /** Cierra el contrato y sincroniza el estado de la oferta asociada. */
  cambiarEstado(
    contratoId: number,
    estado: EstadoContratoFinal
  ): Promise<ContratoDetalle>;

  /** Lista contratos de una publicación (servicio o proyecto) con estados dados. */
  listarPorPublicacion(
    tipo: 'servicio' | 'proyecto',
    publicacionId: number,
    estados: string[]
  ): Promise<ContratoDetalle[]>;

  /** Obtiene el contrato activo por proyecto. */
  obtenerActivoPorProyecto(proyectoId: number): Promise<ContratoDetalle | null>;
}
