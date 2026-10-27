import {
  ConversacionDetalle,
  ConversacionResumen,
  Mensaje,
} from '../../entities/Conversacion';

export interface ContextoConversacion {
  proyectoId?: number | null;
  servicioId?: number | null;
}

/**
 * Puerto del repositorio de chat.
 * No conoce reglas de autorización: los casos de uso validan la participación.
 */
export interface ConversacionRepository {
  /** Idempotente: devuelve la conversación existente o la crea. */
  crearOEncontrar(
    clienteId: number,
    freelancerId: number,
    contexto: ContextoConversacion
  ): Promise<ConversacionDetalle>;

  listar(usuarioId: number): Promise<ConversacionResumen[]>;

  obtener(conversacionId: number): Promise<ConversacionDetalle | null>;

  /** Mensajes nuevos para polling: id > afterId, orden ascendente. */
  listarMensajes(
    conversacionId: number,
    afterId: number | undefined,
    limit: number
  ): Promise<Mensaje[]>;

  crearMensaje(conversacionId: number, emisorId: number, contenido: string): Promise<Mensaje>;

  /** Marca como leídos los mensajes del otro participante. Devuelve cuántos cambió. */
  marcarLeidos(conversacionId: number, usuarioId: number): Promise<number>;
}
