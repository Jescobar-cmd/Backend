import { PropuestaResumen } from '../../domain/entities/Propuesta';
import { PropuestaRepository } from '../../domain/ports/repositories/PropuestaRepository';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: el freelancer retira una propuesta que sigue pendiente. */
export class RetirarPropuestaUseCase {
  constructor(private propuestaRepository: PropuestaRepository) {}

  async ejecutar(freelancerId: number, propuestaId: number): Promise<PropuestaResumen> {
    const propuesta = await this.propuestaRepository.obtenerDetalle(propuestaId);
    if (!propuesta) {
      throw new ErrorNoEncontrado('Propuesta no encontrada');
    }
    if (propuesta.freelancerId !== freelancerId) {
      throw new ErrorProhibido('No puedes retirar una propuesta que no es tuya');
    }
    if (propuesta.estado !== 'pendiente') {
      throw new ErrorConflicto(
        `Solo puedes retirar propuestas pendientes; esta está "${propuesta.estado}"`
      );
    }
    return this.propuestaRepository.retirar(propuestaId);
  }
}
