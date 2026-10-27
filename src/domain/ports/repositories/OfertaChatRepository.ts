import { ContratoDetalle } from '../../entities/Contrato';
import { Mensaje } from '../../entities/Conversacion';
import { NuevaOfertaChat, OfertaChatDetalle } from '../../entities/OfertaChat';

export interface OfertaChatRepository {
  /** Crea el Mensaje (tipo 'oferta') + la OfertaChat pendiente. */
  crear(conversacionId: number, emisorId: number, datos: NuevaOfertaChat): Promise<Mensaje>;

  obtenerDetalle(ofertaId: number): Promise<OfertaChatDetalle | null>;

  /** Acepta en transacción: oferta, otras pendientes, proyecto (si aplica) y contrato. */
  aceptar(ofertaId: number): Promise<ContratoDetalle>;

  rechazar(ofertaId: number): Promise<void>;

  marcarExpirada(ofertaId: number): Promise<void>;

  /** Marca la padre como 'contraofertada' y crea la hija + su mensaje. */
  contraofertar(
    ofertaPadreId: number,
    emisorId: number,
    datos: NuevaOfertaChat
  ): Promise<Mensaje>;
}
