import {
  DatosOferta,
  EstadoOferta,
  FiltrosOferta,
  FiltrosOfertaPublica,
  NuevaOferta,
  Oferta,
  OfertaPaginada,
  OfertaPublica,
  OfertaPublicaPaginada,
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

  /** Marketplace: ofertas abiertas de todos los clientes. */
  listarPublicas(filtros: FiltrosOfertaPublica): Promise<OfertaPublicaPaginada>;

  /** Detalle público (null si no existe o ya no está abierta). */
  obtenerPublica(ofertaId: number): Promise<OfertaPublica | null>;

  /** Datos mínimos para validar contexto de chat (sin filtrar por cliente). */
  obtenerBasica(
    ofertaId: number
  ): Promise<{ id: number; clienteId: number; titulo: string; estado: string } | null>;

  categoriaExiste(categoriaId: number): Promise<boolean>;

  /** ¿Todas las habilidades existen en la base de datos? */
  habilidadesValidas(habilidadIds: number[]): Promise<boolean>;
}
