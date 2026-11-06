import {
  DatosPortafolioItem,
  NuevoPortafolioItem,
  PortafolioItem,
} from '../../entities/PortafolioItem';

/** Puerto del portafolio de un freelancer. */
export interface PortafolioRepository {
  listarPorFreelancer(freelancerId: number): Promise<PortafolioItem[]>;

  obtenerPorId(itemId: number): Promise<PortafolioItem | null>;

  /** El adaptador asegura la fila Freelancer antes de crear. */
  crear(freelancerId: number, datos: NuevoPortafolioItem): Promise<PortafolioItem>;

  actualizar(itemId: number, datos: DatosPortafolioItem): Promise<PortafolioItem>;

  eliminar(itemId: number): Promise<void>;
}
