import { OfertaPublica } from './Oferta';
import { Publicacion } from './Publicacion';
import { Servicio } from './Servicio';

/**
 * Feed de inicio. Se arma según el rol del usuario:
 * - Cliente (3): publicaciones + servicios (ofertas = []).
 * - Freelancer (2): publicaciones + ofertas abiertas + servicios.
 */
export interface Feed {
  rol: number;
  publicaciones: Publicacion[];
  ofertas: OfertaPublica[];
  servicios: Servicio[];
}
