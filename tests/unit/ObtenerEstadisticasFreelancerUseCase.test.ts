import { describe, expect, it, vi } from 'vitest';
import { ObtenerEstadisticasFreelancerUseCase } from '../../src/application/use-cases/ObtenerEstadisticasFreelancerUseCase';
import { EstadisticaFreelancer } from '../../src/domain/entities/EstadisticaFreelancer';
import { EstadisticaFreelancerRepository } from '../../src/domain/ports/repositories/EstadisticaFreelancerRepository';

const dias: EstadisticaFreelancer[] = [
  { id: 1, freelancerId: 7, fecha: new Date('2026-01-01'), visitasPerfil: 3, visualizacionesPropuesta: 1 },
  { id: 2, freelancerId: 7, fecha: new Date('2026-01-02'), visitasPerfil: 5, visualizacionesPropuesta: 2 },
];

describe('ObtenerEstadisticasFreelancerUseCase', () => {
  it('suma visitas y visualizaciones del rango', async () => {
    const repo: EstadisticaFreelancerRepository = {
      registrarVisitaPerfil: vi.fn(),
      registrarVisualizacionPropuesta: vi.fn(),
      listarPorFreelancer: vi.fn().mockResolvedValue(dias),
    };
    const caso = new ObtenerEstadisticasFreelancerUseCase(repo);

    const resultado = await caso.ejecutar(7, new Date('2026-01-01'), new Date('2026-01-02'));

    expect(resultado.totalVisitasPerfil).toBe(8);
    expect(resultado.totalVisualizacionesPropuesta).toBe(3);
    expect(resultado.dias).toHaveLength(2);
  });
});
