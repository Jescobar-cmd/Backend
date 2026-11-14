import {
  aConversacionVista,
  ConversacionVista,
} from '../../domain/entities/Conversacion';
import { ConversacionRepository } from '../../domain/ports/repositories/ConversacionRepository';
import { OfertaRepository } from '../../domain/ports/repositories/OfertaRepository';
import { ServicioRepository } from '../../domain/ports/repositories/ServicioRepository';
import { RepositorioUsuario } from '../../domain/ports/repositories/RepositorioUsuario';
import { ROLES } from '../../shared/constants/roles';
import {
  ErrorProhibido,
  ErrorNoEncontrado,
  ErrorValidacion,
} from '../../shared/errors/ErrorAplicacion';

export interface NuevaConversacionDTO {
  servicioId?: number;
  proyectoId?: number;
  freelancerId?: number;
}

interface ContextoConversacion {
  clienteId: number;
  freelancerId: number;
  proyectoId: number | null;
  servicioId: number | null;
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
    private repositorioUsuario: RepositorioUsuario
  ) {}

  async ejecutar(
    usuarioId: number,
    rol: number,
    datos: NuevaConversacionDTO
  ): Promise<ConversacionVista> {
    const contexto =
      rol === ROLES.CLIENTE
        ? await this.resolverContextoCliente(usuarioId, datos)
        : rol === ROLES.FREELANCER
        ? await this.resolverContextoFreelancer(usuarioId, datos)
        : null;

    if (!contexto) {
      throw new ErrorProhibido('Solo clientes y freelancers pueden iniciar conversaciones');
    }

    const freelancer = await this.repositorioUsuario.buscarPorId(contexto.freelancerId);
    if (!freelancer || freelancer.rolId !== ROLES.FREELANCER) {
      throw new ErrorNoEncontrado('Freelancer no encontrado');
    }

    const conversacion = await this.conversacionRepository.crearOEncontrar(
      contexto.clienteId,
      contexto.freelancerId,
      { proyectoId: contexto.proyectoId, servicioId: contexto.servicioId }
    );
    return aConversacionVista(conversacion, usuarioId);
  }

  private async resolverContextoCliente(
    clienteId: number,
    datos: NuevaConversacionDTO
  ): Promise<ContextoConversacion> {
    if (datos.servicioId) {
      const servicio = await this.servicioRepository.obtenerPorId(datos.servicioId);
      if (!servicio) {
        throw new ErrorNoEncontrado('Servicio no encontrado');
      }
      if (servicio.estado !== 'activo') {
        throw new ErrorValidacion('El servicio no está disponible para iniciar un chat');
      }
      return {
        clienteId,
        freelancerId: servicio.freelancer.id,
        servicioId: servicio.id,
        proyectoId: null,
      };
    }

    if (datos.proyectoId && datos.freelancerId) {
      const proyecto = await this.ofertaRepository.obtenerBasica(datos.proyectoId);
      if (!proyecto) {
        throw new ErrorNoEncontrado('Oferta no encontrada');
      }
      if (proyecto.clienteId !== clienteId) {
        throw new ErrorProhibido('La oferta no te pertenece');
      }
      return {
        clienteId,
        freelancerId: datos.freelancerId,
        servicioId: null,
        proyectoId: proyecto.id,
      };
    }

    throw new ErrorValidacion('Debes indicar un servicio o una oferta con el freelancer');
  }

  private async resolverContextoFreelancer(
    freelancerId: number,
    datos: NuevaConversacionDTO
  ): Promise<ContextoConversacion> {
    if (!datos.proyectoId) {
      throw new ErrorValidacion('Debes indicar la oferta (proyectoId)');
    }
    const proyecto = await this.ofertaRepository.obtenerBasica(datos.proyectoId);
    if (!proyecto) {
      throw new ErrorNoEncontrado('Oferta no encontrada');
    }
    return {
      clienteId: proyecto.clienteId,
      freelancerId,
      servicioId: null,
      proyectoId: proyecto.id,
    };
  }
}
