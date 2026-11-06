import { describe, expect, it, vi } from 'vitest';
import { ObtenerPerfilPublicoUseCase } from '../../src/application/use-cases/ObtenerPerfilPublicoUseCase';
import { PerfilRepository } from '../../src/domain/ports/repositories/PerfilRepository';
import { EstadisticaFreelancerRepository } from '../../src/domain/ports/repositories/EstadisticaFreelancerRepository';
import { PerfilPublico } from '../../src/domain/entities/Perfil';
import { ErrorNoEncontrado } from '../../src/shared/errors/ErrorAplicacion';

const perfilFreelancerBase: PerfilPublico = {
  id: 10,
  nombre: 'Alex Dev',
  fotoPerfil: null,
  ciudad: 'Medellín',
  departamento: 'Antioquia',
  freelancer: {
    tituloProfesional: 'Fullstack TS',
    descripcion: 'Senior Dev',
    tarifaHora: 40000,
    calificacionPromedio: 4.8,
    trabajosCompletados: 12,
    habilidades: [],
  },
};

const perfilClienteBase: PerfilPublico = {
  id: 20,
  nombre: 'Empresa XYZ',
  fotoPerfil: null,
  ciudad: 'Bogotá',
  departamento: 'Cundinamarca',
  freelancer: null,
};

describe('ObtenerPerfilPublicoUseCase', () => {
  it('obtiene el perfil público correctamente', async () => {
    const perfilRepo: PerfilRepository = {
      obtenerCliente: vi.fn(),
      actualizarCliente: vi.fn(),
      obtenerFreelancer: vi.fn(),
      actualizarFreelancer: vi.fn(),
      obtenerPerfilPublico: vi.fn().mockResolvedValue(perfilFreelancerBase),
    };
    const caso = new ObtenerPerfilPublicoUseCase(perfilRepo);
    const resultado = await caso.ejecutar(10);

    expect(resultado).toEqual(perfilFreelancerBase);
  });

  it('lanza ErrorNoEncontrado si el usuario no existe', async () => {
    const perfilRepo: PerfilRepository = {
      obtenerCliente: vi.fn(),
      actualizarCliente: vi.fn(),
      obtenerFreelancer: vi.fn(),
      actualizarFreelancer: vi.fn(),
      obtenerPerfilPublico: vi.fn().mockResolvedValue(null),
    };
    const caso = new ObtenerPerfilPublicoUseCase(perfilRepo);

    await expect(caso.ejecutar(999)).rejects.toThrow(ErrorNoEncontrado);
  });

  it('registra métrica de visita si es freelancer y el visitante es diferente al dueño', async () => {
    const perfilRepo: PerfilRepository = {
      obtenerCliente: vi.fn(),
      actualizarCliente: vi.fn(),
      obtenerFreelancer: vi.fn(),
      actualizarFreelancer: vi.fn(),
      obtenerPerfilPublico: vi.fn().mockResolvedValue(perfilFreelancerBase),
    };
    const estadisticasRepo: EstadisticaFreelancerRepository = {
      registrarVisitaPerfil: vi.fn().mockResolvedValue(undefined),
      registrarVisualizacionPropuesta: vi.fn(),
      listarPorFreelancer: vi.fn(),
    };

    const caso = new ObtenerPerfilPublicoUseCase(perfilRepo, estadisticasRepo);
    await caso.ejecutar(10, 5); // visitado: 10, visitante: 5

    expect(estadisticasRepo.registrarVisitaPerfil).toHaveBeenCalledWith(10);
  });

  it('NO registra métrica si el visitante es el propio dueño del perfil', async () => {
    const perfilRepo: PerfilRepository = {
      obtenerCliente: vi.fn(),
      actualizarCliente: vi.fn(),
      obtenerFreelancer: vi.fn(),
      actualizarFreelancer: vi.fn(),
      obtenerPerfilPublico: vi.fn().mockResolvedValue(perfilFreelancerBase),
    };
    const estadisticasRepo: EstadisticaFreelancerRepository = {
      registrarVisitaPerfil: vi.fn().mockResolvedValue(undefined),
      registrarVisualizacionPropuesta: vi.fn(),
      listarPorFreelancer: vi.fn(),
    };

    const caso = new ObtenerPerfilPublicoUseCase(perfilRepo, estadisticasRepo);
    await caso.ejecutar(10, 10); // visitado: 10, visitante: 10 (mismo dueño)

    expect(estadisticasRepo.registrarVisitaPerfil).not.toHaveBeenCalled();
  });

  it('NO registra métrica si el perfil consultado no es freelancer', async () => {
    const perfilRepo: PerfilRepository = {
      obtenerCliente: vi.fn(),
      actualizarCliente: vi.fn(),
      obtenerFreelancer: vi.fn(),
      actualizarFreelancer: vi.fn(),
      obtenerPerfilPublico: vi.fn().mockResolvedValue(perfilClienteBase),
    };
    const estadisticasRepo: EstadisticaFreelancerRepository = {
      registrarVisitaPerfil: vi.fn().mockResolvedValue(undefined),
      registrarVisualizacionPropuesta: vi.fn(),
      listarPorFreelancer: vi.fn(),
    };

    const caso = new ObtenerPerfilPublicoUseCase(perfilRepo, estadisticasRepo);
    await caso.ejecutar(20, 5);

    expect(estadisticasRepo.registrarVisitaPerfil).not.toHaveBeenCalled();
  });
});
