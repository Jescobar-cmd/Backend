import {
  DatosServicio,
  EstadoServicio,
  FiltrosServicio,
  NuevoServicio,
  Servicio,
  ServicioPaginado,
} from '../../entities/Servicio';

/**
 * Puerto del repositorio de servicios (Freelancer -> Servicio).
 * El adaptador asegura la fila `Freelancer` antes de crear (upsert),
 * igual que OfertaRepository asegura `Cliente`.
 */
export interface ServicioRepository {
  crear(freelancerId: number, datos: NuevoServicio): Promise<Servicio>;

  /** Catálogo público: solo servicios con estado 'activo'. */
  listar(filtros: FiltrosServicio): Promise<ServicioPaginado>;

  /** Panel del freelancer: todos sus servicios (cualquier estado). */
  listarPorFreelancer(freelancerId: number, filtros: FiltrosServicio): Promise<ServicioPaginado>;

  /**
   * Listado para moderación: incluye servicios en cualquier estado
   * (a diferencia de `listar`, que solo devuelve los activos).
   */
  listarParaModeracion(filtros: FiltrosServicio): Promise<ServicioPaginado>;

  obtenerPorId(servicioId: number): Promise<Servicio | null>;

  actualizar(servicioId: number, datos: DatosServicio): Promise<Servicio>;

  cambiarEstado(servicioId: number, estado: EstadoServicio): Promise<Servicio>;

  /** Marca o limpia los campos de moderación sin tocar el estado público. */
  actualizarModeracion(
    servicioId: number,
    datos: {
      moderacionRetirada: boolean;
      moderacionEstadoAnterior: string | null;
      moderacionMotivo: string | null;
    }
  ): Promise<Servicio>;

  categoriaExiste(categoriaId: number): Promise<boolean>;
}
