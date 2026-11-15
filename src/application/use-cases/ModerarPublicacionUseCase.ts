import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { ModeracionPublicacionRepository } from '../../domain/ports/repositories/ModeracionPublicacionRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import { PagoRepository } from '../../domain/ports/repositories/PagoRepository';
import { ProyectoRepository } from '../../domain/ports/repositories/ProyectoRepository';
import { ServicioRepository } from '../../domain/ports/repositories/ServicioRepository';
import {
  PublicacionModerada,
  TipoPublicacion,
  publicacionModeradaDesdeProyecto,
  publicacionModeradaDesdeServicio,
} from '../../domain/entities/ModeracionPublicacion';
import { EstadoServicio } from '../../domain/entities/Servicio';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
} from '../../shared/errors/ErrorAplicacion';

export interface ResultadoModeracion {
  mensaje: string;
  publicacion: PublicacionModerada;
}

/**
 * Caso de uso: retira o reactiva una publicación (servicio o proyecto)
 * por decisión de moderación, con historial y efectos sobre contratos.
 *
 * Reglas de negocio:
 * - Retirar un servicio lo marca como 'eliminado', cancela sus contratos
 *   pendientes/activos y reembolsa los pagos retenidos en escrow.
 * - Retirar un proyecto lo marca como 'cancelado' sin tocar contratos
 *   ni pagos (la entrega de dinero se gestiona desde disputas).
 * - Reactivar restaura el estado anterior y limpia los campos de moderación.
 */
export class ModerarPublicacionUseCase {
  constructor(
    private servicioRepository: ServicioRepository,
    private proyectoRepository: ProyectoRepository,
    private contratoRepository: ContratoRepository,
    private pagoRepository: PagoRepository,
    private moderacionPublicacionRepository: ModeracionPublicacionRepository,
    private notificacionRepository: NotificacionRepository
  ) {}

  async retirar(
    publicacionId: number,
    tipo: TipoPublicacion,
    motivo: string,
    moderadorId: number
  ): Promise<ResultadoModeracion> {
    return tipo === 'servicio'
      ? this.retirarServicio(publicacionId, motivo, moderadorId)
      : this.retirarProyecto(publicacionId, motivo, moderadorId);
  }

  async reactivar(
    publicacionId: number,
    tipo: TipoPublicacion,
    moderadorId: number
  ): Promise<ResultadoModeracion> {
    return tipo === 'servicio'
      ? this.reactivarServicio(publicacionId, moderadorId)
      : this.reactivarProyecto(publicacionId, moderadorId);
  }

  /* ---------- Servicios ---------- */

  private async retirarServicio(
    servicioId: number,
    motivo: string,
    moderadorId: number
  ): Promise<ResultadoModeracion> {
    const servicio = await this.servicioRepository.obtenerPorId(servicioId);
    if (!servicio) {
      throw new ErrorNoEncontrado('Servicio no encontrado');
    }
    if (servicio.estado === 'eliminado') {
      throw new ErrorConflicto('El servicio ya fue eliminado');
    }

    const estadoAnterior = servicio.estado;
    await this.servicioRepository.cambiarEstado(servicioId, 'eliminado');
    await this.servicioRepository.actualizarModeracion(servicioId, {
      moderacionRetirada: true,
      moderacionEstadoAnterior: estadoAnterior,
      moderacionMotivo: motivo,
    });
    await this.registrar('servicio', servicioId, moderadorId, 'retirar', motivo, estadoAnterior, 'eliminado');

    const contratos = await this.contratoRepository.listarPorPublicacion(
      'servicio',
      servicioId,
      ['activo', 'pendiente_pago']
    );
    for (const contrato of contratos) {
      const pago = await this.pagoRepository.obtenerPorContrato(contrato.id);
      if (pago?.estado === 'retenido') {
        await this.pagoRepository.reembolsar(contrato.id);
      }
      await this.contratoRepository.cambiarEstado(contrato.id, 'cancelado');
    }

    await this.notificarAutor(
      servicio.freelancer.id,
      'publicacion_retirada',
      'Publicación retirada',
      `Tu servicio "${servicio.titulo}" fue retirado por moderación. Motivo: ${motivo}`,
      contratos.length
    );

    const publicacion = await this.publicacionServicio(servicioId);
    return {
      mensaje: `Servicio retirado correctamente. Se cancelaron ${contratos.length} contrato(s).`,
      publicacion,
    };
  }

  private async reactivarServicio(
    servicioId: number,
    moderadorId: number
  ): Promise<ResultadoModeracion> {
    const servicio = await this.servicioRepository.obtenerPorId(servicioId);
    if (!servicio) {
      throw new ErrorNoEncontrado('Servicio no encontrado');
    }
    if (!servicio.moderacionRetirada) {
      throw new ErrorConflicto('El servicio no está retirado por moderación');
    }

    const estadoNuevo = (servicio.moderacionEstadoAnterior || 'activo') as EstadoServicio;
    await this.servicioRepository.actualizarModeracion(servicioId, {
      moderacionRetirada: false,
      moderacionEstadoAnterior: null,
      moderacionMotivo: null,
    });
    await this.servicioRepository.cambiarEstado(servicioId, estadoNuevo);
    await this.registrar(
      'servicio',
      servicioId,
      moderadorId,
      'reactivar',
      null,
      servicio.estado,
      estadoNuevo
    );

    await this.notificarAutor(
      servicio.freelancer.id,
      'publicacion_reactivada',
      'Publicación reactivada',
      `Tu servicio "${servicio.titulo}" vuelve a estar disponible.`,
      0
    );

    const publicacion = await this.publicacionServicio(servicioId);
    return { mensaje: 'Servicio reactivado correctamente.', publicacion };
  }

  /* ---------- Proyectos ---------- */

  private async retirarProyecto(
    proyectoId: number,
    motivo: string,
    moderadorId: number
  ): Promise<ResultadoModeracion> {
    const proyecto = await this.proyectoRepository.obtenerPorId(proyectoId);
    if (!proyecto) {
      throw new ErrorNoEncontrado('Proyecto no encontrado');
    }
    if (proyecto.estado === 'completado' || proyecto.estado === 'cancelado') {
      throw new ErrorConflicto('No se puede retirar un proyecto completado o cancelado');
    }

    const estadoAnterior = proyecto.estado;
    await this.proyectoRepository.cambiarEstado(proyectoId, 'cancelado');
    await this.proyectoRepository.actualizarModeracion(proyectoId, {
      moderacionRetirada: true,
      moderacionEstadoAnterior: estadoAnterior,
      moderacionMotivo: motivo,
    });
    await this.registrar('proyecto', proyectoId, moderadorId, 'retirar', motivo, estadoAnterior, 'cancelado');

    // Los contratos y pagos del proyecto no se tocan: la devolución
    // de dinero se decide desde el módulo de disputas.
    await this.notificarAutor(
      proyecto.cliente?.id ?? proyecto.clienteId,
      'publicacion_retirada',
      'Publicación retirada',
      `Tu proyecto "${proyecto.titulo}" fue retirado por moderación. Motivo: ${motivo}`,
      0
    );

    const publicacion = await this.publicacionProyecto(proyectoId);
    return { mensaje: 'Proyecto retirado correctamente.', publicacion };
  }

  private async reactivarProyecto(
    proyectoId: number,
    moderadorId: number
  ): Promise<ResultadoModeracion> {
    const proyecto = await this.proyectoRepository.obtenerPorId(proyectoId);
    if (!proyecto) {
      throw new ErrorNoEncontrado('Proyecto no encontrado');
    }
    if (!proyecto.moderacionRetirada) {
      throw new ErrorConflicto('El proyecto no está retirado por moderación');
    }

    const estadoNuevo = proyecto.moderacionEstadoAnterior || 'abierto';
    await this.proyectoRepository.actualizarModeracion(proyectoId, {
      moderacionRetirada: false,
      moderacionEstadoAnterior: null,
      moderacionMotivo: null,
    });
    await this.proyectoRepository.cambiarEstado(proyectoId, estadoNuevo);
    await this.registrar(
      'proyecto',
      proyectoId,
      moderadorId,
      'reactivar',
      null,
      proyecto.estado,
      estadoNuevo
    );

    await this.notificarAutor(
      proyecto.cliente?.id ?? proyecto.clienteId,
      'publicacion_reactivada',
      'Publicación reactivada',
      `Tu proyecto "${proyecto.titulo}" vuelve a estar publicado.`,
      0
    );

    const publicacion = await this.publicacionProyecto(proyectoId);
    return { mensaje: 'Proyecto reactivado correctamente.', publicacion };
  }

  /* ---------- Ayudantes ---------- */

  private async registrar(
    tipo: TipoPublicacion,
    publicacionId: number,
    moderadorId: number,
    accion: 'retirar' | 'reactivar',
    motivo: string | null,
    estadoAnterior: string,
    estadoNuevo: string
  ): Promise<void> {
    await this.moderacionPublicacionRepository.crear({
      tipo,
      publicacionId,
      moderadorId,
      accion,
      motivo,
      estadoAnterior,
      estadoNuevo,
    });
  }

  private async notificarAutor(
    autorId: number,
    tipo: string,
    titulo: string,
    mensaje: string,
    contratosCancelados: number
  ): Promise<void> {
    await this.notificacionRepository.crear({
      usuarioId: autorId,
      tipo,
      titulo,
      mensaje: contratosCancelados > 0 ? `${mensaje} Se cancelaron ${contratosCancelados} contrato(s) asociados.` : mensaje,
      enlace: '/notificaciones',
    });
  }

  private async publicacionServicio(servicioId: number): Promise<PublicacionModerada> {
    const servicio = await this.servicioRepository.obtenerPorId(servicioId);
    if (!servicio) {
      throw new ErrorNoEncontrado('Servicio no encontrado');
    }
    const [contratos, moderaciones] = await Promise.all([
      this.contratoRepository.listarPorPublicacion('servicio', servicioId, ['activo', 'pendiente_pago']),
      this.moderacionPublicacionRepository.listarUltimas('servicio', servicioId, 1),
    ]);
    return publicacionModeradaDesdeServicio(servicio, contratos, moderaciones[0] ?? null);
  }

  private async publicacionProyecto(proyectoId: number): Promise<PublicacionModerada> {
    const proyecto = await this.proyectoRepository.obtenerPorId(proyectoId);
    if (!proyecto) {
      throw new ErrorNoEncontrado('Proyecto no encontrado');
    }
    const [contratos, moderaciones] = await Promise.all([
      this.contratoRepository.listarPorPublicacion('proyecto', proyectoId, ['activo', 'pendiente_pago']),
      this.moderacionPublicacionRepository.listarUltimas('proyecto', proyectoId, 1),
    ]);
    return publicacionModeradaDesdeProyecto(proyecto, contratos, moderaciones[0] ?? null);
  }
}
