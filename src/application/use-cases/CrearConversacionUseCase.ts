import {
  aConversacionVista,
  ConversacionVista,
} from '../../domain/entities/Conversacion';
import { ConversacionRepository } from '../../domain/ports/repositories/ConversacionRepository';
import { OfertaRepository } from '../../domain/ports/repositories/OfertaRepository';
import { ServicioRepository } from '../../domain/ports/repositories/ServicioRepository';
import { UserRepository } from '../../domain/ports/repositories/UserRepository';
import { ROLES } from '../../shared/constants/roles';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors/AppError';

export interface NuevaConversacionDTO {
  servicioId?: number;
  proyectoId?: number;
  freelancerId?: number;
}

/**
 * Caso de uso: iniciar (o recuperar) una conversación cliente <-> freelancer.
 * - Cliente: desde un servicio o desde una oferta suya + freelancer.
 * - Freelancer: desde una oferta (proyecto).
 */
export class CrearConversacionUseCase {
  constructor(
    private conversacionRepository: ConversacionRepository,
    private ofertaRepository: OfertaRepository,
    private servicioRepository: ServicioRepository,
    private userRepository: UserRepository
  ) {}

  async execute(
    usuarioId: number,
    rol: number,
    datos: NuevaConversacionDTO
  ): Promise<ConversacionVista> {
    let clienteId: number;
    let freelancerId: number;
    let proyectoId: number | null = null;
    let servicioId: number | null = null;

    if (rol === ROLES.CLIENTE) {
      clienteId = usuarioId;
      if (datos.servicioId) {
        const servicio = await this.servicioRepository.obtenerPorId(datos.servicioId);
        if (!servicio) {
          throw new NotFoundError('Servicio no encontrado');
        }
        if (servicio.estado !== 'activo') {
          throw new ValidationError('El servicio no está disponible para iniciar un chat');
        }
        freelancerId = servicio.freelancer.id;
        servicioId = servicio.id;
      } else if (datos.proyectoId && datos.freelancerId) {
        const proyecto = await this.ofertaRepository.obtenerBasica(datos.proyectoId);
        if (!proyecto) {
          throw new NotFoundError('Oferta no encontrada');
        }
        if (proyecto.clienteId !== usuarioId) {
          throw new ForbiddenError('La oferta no te pertenece');
        }
        freelancerId = datos.freelancerId;
        proyectoId = proyecto.id;
      } else {
        throw new ValidationError('Debes indicar un servicio o una oferta con el freelancer');
      }
    } else if (rol === ROLES.FREELANCER) {
      if (!datos.proyectoId) {
        throw new ValidationError('Debes indicar la oferta (proyectoId)');
      }
      const proyecto = await this.ofertaRepository.obtenerBasica(datos.proyectoId);
      if (!proyecto) {
        throw new NotFoundError('Oferta no encontrada');
      }
      clienteId = proyecto.clienteId;
      freelancerId = usuarioId;
      proyectoId = proyecto.id;
    } else {
      throw new ForbiddenError('Solo clientes y freelancers pueden iniciar conversaciones');
    }

    const freelancer = await this.userRepository.findById(freelancerId);
    if (!freelancer || freelancer.rolId !== ROLES.FREELANCER) {
      throw new NotFoundError('Freelancer no encontrado');
    }

    const conversacion = await this.conversacionRepository.crearOEncontrar(
      clienteId,
      freelancerId,
      { proyectoId, servicioId }
    );
    return aConversacionVista(conversacion, usuarioId);
  }
}
