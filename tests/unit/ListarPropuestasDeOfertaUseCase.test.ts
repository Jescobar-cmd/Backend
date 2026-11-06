import { describe, expect, it, vi } from 'vitest';
import { ListarPropuestasDeOfertaUseCase } from '../../src/application/use-cases/ListarPropuestasDeOfertaUseCase';
import { PropuestaResumen } from '../../src/domain/entities/Propuesta';
import { EstadisticaFreelancerRepository } from '../../src/domain/ports/repositories/EstadisticaFreelancerRepository';
import { OfertaRepository } from '../../src/domain/ports/repositories/OfertaRepository';

const propuestas: PropuestaResumen[] = [
  {
    id: 1,
    mensaje: null,
    montoPropuesto: 100,
    estado: 'pendiente',
    fechaEnvio: new Date(),
    freelancer: { id: 7, nombre: 'Ana', fotoPerfil: null, calificacionPromedio: 4 },
  },
  {
    id: 2,
    mensaje: null,
    montoPropuesto: 200,
    estado: 'pendiente',
    fechaEnvio: new Date(),
    freelancer: { id: 8, nombre: 'Luis', fotoPerfil: null, calificacionPromedio: 5 },
  },
];

function crearOfertaRepo(resultado: PropuestaResumen[] | null): OfertaRepository {
  return {
    crear: vi.fn(),
    listarPorCliente: vi.fn(),
    obtenerPorId: vi.fn(),
    actualizar: vi.fn(),
    cambiarEstado: vi.fn(),
    listarPublicas: vi.fn(),
    obtenerPublica: vi.fn(),
    listarPropuestas: vi.fn().mockResolvedValue(resultado),
    obtenerBasica: vi.fn(),
    categoriaExiste: vi.fn(),
    habilidadesValidas: vi.fn(),
  };
}

function crearEstadisticaRepo(): EstadisticaFreelancerRepository {
  return {
    registrarVisitaPerfil: vi.fn(),
    registrarVisualizacionPropuesta: vi.fn().mockResolvedValue(undefined),
    listarPorFreelancer: vi.fn(),
  };
}

describe('ListarPropuestasDeOfertaUseCase', () => {
  it('registra una visualización por cada freelancer', async () => {
    const estadistica = crearEstadisticaRepo();
    const caso = new ListarPropuestasDeOfertaUseCase(crearOfertaRepo(propuestas), estadistica);

    const resultado = await caso.ejecutar(2, 3);

    expect(resultado).toHaveLength(2);
    expect(estadistica.registrarVisualizacionPropuesta).toHaveBeenCalledWith(7);
    expect(estadistica.registrarVisualizacionPropuesta).toHaveBeenCalledWith(8);
  });

  it('no registra métricas si la oferta no existe', async () => {
    const estadistica = crearEstadisticaRepo();
    const caso = new ListarPropuestasDeOfertaUseCase(crearOfertaRepo(null), estadistica);

    await expect(caso.ejecutar(2, 3)).rejects.toMatchObject({ codigoEstado: 404 });
    expect(estadistica.registrarVisualizacionPropuesta).not.toHaveBeenCalled();
  });
});
