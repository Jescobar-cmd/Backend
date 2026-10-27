// Oferta o contraoferta de un monto dentro de una conversación (estilo Fiverr).
// estados: pendiente | aceptada | rechazada | contraofertada | expirada

export type EstadoOfertaChat = 'pendiente' | 'aceptada' | 'rechazada' | 'contraofertada' | 'expirada';

export interface NuevaOfertaChat {
  monto: number;
  descripcion?: string | null;
  fechaExpiracion?: Date | null;
}

export interface OfertaChatDetalle {
  id: number;
  conversacionId: number;
  /** Quien envió la oferta (Mensaje.emisorId). No puede aceptarla. */
  emisorId: number;
  clienteId: number;
  freelancerId: number;
  proyectoId: number | null;
  servicioId: number | null;
  monto: number;
  estado: string;
  fechaExpiracion: Date | null;
  ofertaPadreId: number | null;
}
