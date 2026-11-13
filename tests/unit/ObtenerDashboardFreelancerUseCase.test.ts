import { describe, expect, it, vi } from 'vitest';
import { ObtenerDashboardFreelancerUseCase } from '../../src/application/use-cases/ObtenerDashboardFreelancerUseCase';
import { DashboardFreelancerRepository } from '../../src/domain/ports/repositories/DashboardFreelancerRepository';

describe('ObtenerDashboardFreelancerUseCase', () => {
  it('devuelve el resumen del repositorio', async () => {
    const resumen = {
      contratosActivos: 2,
      contratosCompletados: 3,
      propuestasPendientes: 1,
      serviciosActivos: 4,
      entregasPendientes: 1,
      pagosPendientes: 2,
      disputasAbiertas: 0,
      notificacionesSinLeer: 3,
      calificacionPromedio: 4.5,
      visitasPerfil: 10,
      visualizacionesPropuesta: 6,
      saldoDisponible: 450,
    };
    const repo: DashboardFreelancerRepository = {
      obtener: vi.fn().mockResolvedValue(resumen),
    };
    const caso = new ObtenerDashboardFreelancerUseCase(repo);

    await expect(caso.ejecutar(7)).resolves.toEqual(resumen);
  });
});
