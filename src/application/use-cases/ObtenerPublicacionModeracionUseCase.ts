import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { ModeracionPublicacionRepository } from '../../domain/ports/repositories/ModeracionPublicacionRepository';
import { ProyectoRepository } from '../../domain/ports/repositories/ProyectoRepository';
import { ServicioRepository } from '../../domain/ports/repositories/ServicioRepository';
import {
  PublicacionModerada,
  TipoPublicacion,
  aRegistroModeracion,
  publicacionModeradaDesdeProyecto,
  publicacionModeradaDesdeServicio,
} from '../../domain/entities/ModeracionPublicacion';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Contratos que el panel muestra como "activos" sobre una publicación. */
const ESTADOS_CONTRATO_VISIBLE = ['activo', 'pendiente_pago'];

/**
 * Caso de uso: detalle de una publicación (servicio o proyecto) con su
 * historial completo de moderación para el panel.
 */
export class ObtenerPublicacionModeracionUseCase {
  constructor(
    private servicioRepository: ServicioRepository,
    private proyectoRepository: ProyectoRepository,
    private contratoRepository: ContratoRepository,
    private moderacionPublicacionRepository: ModeracionPublicacionRepository
  ) {}

  async ejecutar(id: number, tipo: TipoPublicacion): Promise<PublicacionModerada> {
    const [contratos, moderaciones] = await Promise.all([
      this.contratoRepository.listarPorPublicacion(
        tipo,
        id,
        ESTADOS_CONTRATO_VISIBLE
      ),
      this.moderacionPublicacionRepository.listarPorPublicacion(tipo, id),
    ]);

    const base =
      tipo === 'servicio'
        ? await this.desdeServicio(id, contratos, moderaciones)
        : await this.desdeProyecto(id, contratos, moderaciones);

    return {
      ...base,
      historial: moderaciones.map((registro) => aRegistroModeracion(registro)),
    };
  }

  private async desdeServicio(
    id: number,
    contratos: Parameters<typeof publicacionModeradaDesdeServicio>[1],
    moderaciones: Awaited<
      ReturnType<ModeracionPublicacionRepository['listarPorPublicacion']>
    >
  ): Promise<PublicacionModerada> {
    const servicio = await this.servicioRepository.obtenerPorId(id);
    if (!servicio) {
      throw new ErrorNoEncontrado('Servicio no encontrado');
    }
    return publicacionModeradaDesdeServicio(
      servicio,
      contratos,
      moderaciones[0] ?? null
    );
  }

  private async desdeProyecto(
    id: number,
    contratos: Parameters<typeof publicacionModeradaDesdeProyecto>[1],
    moderaciones: Awaited<
      ReturnType<ModeracionPublicacionRepository['listarPorPublicacion']>
    >
  ): Promise<PublicacionModerada> {
    const proyecto = await this.proyectoRepository.obtenerPorId(id);
    if (!proyecto) {
      throw new ErrorNoEncontrado('Proyecto no encontrado');
    }
    return publicacionModeradaDesdeProyecto(
      proyecto,
      contratos,
      moderaciones[0] ?? null
    );
  }
}
