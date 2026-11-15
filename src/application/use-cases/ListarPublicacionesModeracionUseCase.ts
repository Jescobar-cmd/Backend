import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { ModeracionPublicacionRepository } from '../../domain/ports/repositories/ModeracionPublicacionRepository';
import { ProyectoRepository } from '../../domain/ports/repositories/ProyectoRepository';
import { ServicioRepository } from '../../domain/ports/repositories/ServicioRepository';
import { ContratoDetalle } from '../../domain/entities/Contrato';
import {
  PublicacionModerada,
  TipoPublicacion,
  publicacionModeradaDesdeProyecto,
  publicacionModeradaDesdeServicio,
} from '../../domain/entities/ModeracionPublicacion';
import { Proyecto } from '../../domain/entities/Proyecto';
import { Servicio } from '../../domain/entities/Servicio';
import { ErrorSolicitudInvalida } from '../../shared/errors/ErrorAplicacion';

export interface FiltrosPublicacionesModeracion {
  tipo: TipoPublicacion;
  estado?: string;
  texto?: string;
  page: number;
  limit: number;
}

export interface PublicacionesModeracionPaginadas {
  page: number;
  limit: number;
  total: number;
  items: PublicacionModerada[];
}

/** Contratos que el panel muestra como "activos" sobre una publicación. */
const ESTADOS_CONTRATO_VISIBLE = ['activo', 'pendiente_pago'];

/**
 * Caso de uso: lista servicios o proyectos con su estado de moderación,
 * autor, categoría y contratos asociados.
 */
export class ListarPublicacionesModeracionUseCase {
  constructor(
    private servicioRepository: ServicioRepository,
    private proyectoRepository: ProyectoRepository,
    private contratoRepository: ContratoRepository,
    private moderacionPublicacionRepository: ModeracionPublicacionRepository
  ) {}

  async ejecutar(
    filtros: FiltrosPublicacionesModeracion
  ): Promise<PublicacionesModeracionPaginadas> {
    const { tipo, estado, texto, page, limit } = filtros;
    const base = {
      ...(estado ? { estado } : {}),
      ...(texto ? { texto } : {}),
      page,
      limit,
    };

    if (tipo === 'servicio') {
      const paginado = await this.servicioRepository.listarParaModeracion(base);
      const items = await Promise.all(
        paginado.items.map((servicio) => this.armarServicio(servicio))
      );
      return { page, limit, total: paginado.total, items };
    }

    if (tipo === 'proyecto') {
      const paginado = await this.proyectoRepository.listar(base);
      const items = await Promise.all(
        paginado.items.map((proyecto) => this.armarProyecto(proyecto))
      );
      return { page, limit, total: paginado.total, items };
    }

    throw new ErrorSolicitudInvalida('El tipo de publicación debe ser servicio o proyecto');
  }

  private contratosDe(
    tipo: TipoPublicacion,
    publicacionId: number
  ): Promise<ContratoDetalle[]> {
    return this.contratoRepository.listarPorPublicacion(
      tipo,
      publicacionId,
      ESTADOS_CONTRATO_VISIBLE
    );
  }

  private async armarServicio(servicio: Servicio): Promise<PublicacionModerada> {
    const [contratos, moderaciones] = await Promise.all([
      this.contratosDe('servicio', servicio.id),
      this.moderacionPublicacionRepository.listarUltimas('servicio', servicio.id, 1),
    ]);
    return publicacionModeradaDesdeServicio(servicio, contratos, moderaciones[0] ?? null);
  }

  private async armarProyecto(proyecto: Proyecto): Promise<PublicacionModerada> {
    const [contratos, moderaciones] = await Promise.all([
      this.contratosDe('proyecto', proyecto.id),
      this.moderacionPublicacionRepository.listarUltimas('proyecto', proyecto.id, 1),
    ]);
    return publicacionModeradaDesdeProyecto(proyecto, contratos, moderaciones[0] ?? null);
  }
}
