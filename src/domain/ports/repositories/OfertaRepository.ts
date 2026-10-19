import {
  DatosOferta,
  EstadoOferta,
  FiltrosOferta,
  NuevaOferta,
  Oferta,
  OfertaPaginada,
} from '../../entities/Oferta';
import { PropuestaResumen } from '../../entities/Propuesta';

/**
 * Puerto del repositorio de ofertas (Proyecto) del cliente.
 * Incluye dos consultas de validación (existencia de categoría/habilidades)
 * para que los casos de uso no dependan de Prisma.
 */
export interface OfertaRepository {
  crear(clienteId: number, datos: NuevaOferta): Promise<Oferta>;

  listarPorCliente(clienteId: number, filtros: FiltrosOferta): Promise<OfertaPaginada>;

  /** Oferta del cliente (null si no existe o no es suya). */
  obtenerPorId(clienteId: number, ofertaId: number): Promise<Oferta | null>;

  actualizar(clienteId: number, ofertaId: number, datos: DatosOferta): Promise<Oferta>;

  cambiarEstado(clienteId: number, ofertaId: number, estado: EstadoOferta): Promise<Oferta>;

  /** Propuestas recibidas (null si la oferta no existe o no es del cliente). */
  listarPropuestas(clienteId: number, ofertaId: number): Promise<PropuestaResumen[] | null>;

  categoriaExiste(categoriaId: number): Promise<boolean>;

  /** ¿Todas las habilidades existen en la base de datos? */
  habilidadesValidas(habilidadIds: number[]): Promise<boolean>;
}
