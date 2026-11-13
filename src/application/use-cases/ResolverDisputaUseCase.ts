import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { DisputaRepository } from '../../domain/ports/repositories/DisputaRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import { Disputa, EstadoDisputa } from '../../domain/entities/Disputa';
import { ErrorConflicto, ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

export interface DatosResolverDisputa {
  adminId: number;
  estado: EstadoDisputa;
  resolucion: string;
}

export class ResolverDisputaUseCase {
  constructor(
    private contratoRepository: ContratoRepository,
    private disputaRepository: DisputaRepository,
    private notificacionRepository: NotificacionRepository
  ) {}

  async ejecutar(
    disputaId: number,
    adminId: number,
    estado: EstadoDisputa,
    resolucion: string
  ): Promise<Disputa> {
    const disputa = await this.disputaRepository.obtenerPorId(disputaId);
    if (!disputa) {
      throw new ErrorNoEncontrado('Disputa no encontrada');
    }
    if (disputa.estado !== 'abierta' && disputa.estado !== 'en_revision') {
      throw new ErrorConflicto('La disputa ya no está abierta para resolución');
    }

    const actualizada = await this.disputaRepository.resolver(
      disputaId,
      adminId,
      estado,
      resolucion
    );

    const contrato = await this.contratoRepository.obtener(disputa.contratoId);

    if (contrato) {
      await this.notificacionRepository.crear({
        usuarioId: contrato.cliente.id,
        tipo: 'disputa_resuelta',
        titulo: 'Disputa resuelta',
        mensaje: `La disputa fue resuelta por la plataforma: ${resolucion}`,
        enlace: `/contratos/${disputa.contratoId}`,
      });
      await this.notificacionRepository.crear({
        usuarioId: contrato.freelancer.id,
        tipo: 'disputa_resuelta',
        titulo: 'Disputa resuelta',
        mensaje: `La disputa fue resuelta por la plataforma: ${resolucion}`,
        enlace: `/contratos/${disputa.contratoId}`,
      });
    }

    return actualizada;
  }
}
