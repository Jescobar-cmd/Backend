import { describe, expect, it, vi } from 'vitest';
import { ObtenerDashboardModeradorUseCase } from '../../src/application/use-cases/ObtenerDashboardModeradorUseCase';
import { ListarReportesAdminUseCase } from '../../src/application/use-cases/ListarReportesAdminUseCase';
import { ResolverReporteUseCase } from '../../src/application/use-cases/ResolverReporteUseCase';
import { ReporteRepository } from '../../src/domain/ports/repositories/ReporteRepository';
import { DisputaRepository } from '../../src/domain/ports/repositories/DisputaRepository';
import { LiquidacionRepository } from '../../src/domain/ports/repositories/LiquidacionRepository';
import { NotificacionRepository } from '../../src/domain/ports/repositories/NotificacionRepository';
import { Reporte } from '../../src/domain/entities/Reporte';

describe('Moderador Use Cases', () => {
  it('ObtenerDashboardModeradorUseCase obtiene conteos consolidados', async () => {
    const reporteRepo: Partial<ReporteRepository> = {
      listar: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
    };
    const disputaRepo: Partial<DisputaRepository> = {
      listar: vi.fn().mockResolvedValue([{ id: 10 }]),
    };
    const liquidacionRepo: Partial<LiquidacionRepository> = {
      listar: vi.fn().mockResolvedValue([{ id: 100 }, { id: 101 }, { id: 102 }]),
    };

    const casoUso = new ObtenerDashboardModeradorUseCase(
      reporteRepo as ReporteRepository,
      disputaRepo as DisputaRepository,
      liquidacionRepo as LiquidacionRepository
    );

    const resultado = await casoUso.ejecutar();
    expect(resultado).toEqual({
      reportesPendientes: 2,
      disputasAbiertas: 1,
      retirosPendientes: 3,
    });
  });

  it('ResolverReporteUseCase resuelve el reporte y notifica al usuario reportado', async () => {
    const reporteInicial: Reporte = {
      id: 5,
      usuarioReportaId: 2,
      usuarioReportadoId: 8,
      proyectoId: null,
      adminId: null,
      motivo: 'Spam',
      descripcion: 'Envió enlaces maliciosos',
      estado: 'pendiente',
      resolucion: null,
      fechaResolucion: null,
      fecha: new Date(),
    };

    const reporteResuelto: Reporte = {
      ...reporteInicial,
      estado: 'resuelto',
      resolucion: 'Advertencia aplicada',
      adminId: 1,
      fechaResolucion: new Date(),
    };

    const reporteRepo: Partial<ReporteRepository> = {
      obtenerPorId: vi.fn().mockResolvedValue(reporteInicial),
      resolver: vi.fn().mockResolvedValue(reporteResuelto),
    };

    const notificacionRepo: Partial<NotificacionRepository> = {
      crear: vi.fn().mockResolvedValue({ id: 1 } as any),
    };

    const casoUso = new ResolverReporteUseCase(
      reporteRepo as ReporteRepository,
      notificacionRepo as NotificacionRepository
    );

    const resultado = await casoUso.ejecutar(5, 1, 'Advertencia aplicada');
    expect(resultado.estado).toBe('resuelto');
    expect(notificacionRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        usuarioId: 8,
        tipo: 'reporte_resuelto',
      })
    );
  });
});
