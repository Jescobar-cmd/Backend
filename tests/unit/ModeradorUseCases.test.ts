import { describe, expect, it, vi } from 'vitest';
import { ObtenerDashboardModeradorUseCase } from '../../src/application/use-cases/ObtenerDashboardModeradorUseCase';
import { ListarReportesAdminUseCase } from '../../src/application/use-cases/ListarReportesAdminUseCase';
import { ResolverReporteUseCase } from '../../src/application/use-cases/ResolverReporteUseCase';
import { CrearReporteUseCase } from '../../src/application/use-cases/CrearReporteUseCase';
import { ListarDisputasAdminUseCase } from '../../src/application/use-cases/ListarDisputasAdminUseCase';
import { ObtenerDisputaAdminUseCase } from '../../src/application/use-cases/ObtenerDisputaAdminUseCase';
import { ResolverDisputaUseCase } from '../../src/application/use-cases/ResolverDisputaUseCase';
import { ListarLiquidacionesAdminUseCase } from '../../src/application/use-cases/ListarLiquidacionesAdminUseCase';
import { AprobarRetiroUseCase } from '../../src/application/use-cases/AprobarRetiroUseCase';
import { ReporteRepository } from '../../src/domain/ports/repositories/ReporteRepository';
import { DisputaRepository } from '../../src/domain/ports/repositories/DisputaRepository';
import { LiquidacionRepository } from '../../src/domain/ports/repositories/LiquidacionRepository';
import { NotificacionRepository } from '../../src/domain/ports/repositories/NotificacionRepository';
import { ContratoRepository } from '../../src/domain/ports/repositories/ContratoRepository';
import { RepositorioUsuario } from '../../src/domain/ports/repositories/RepositorioUsuario';
import { PagoRepository } from '../../src/domain/ports/repositories/PagoRepository';
import { PasarelaPago } from '../../src/domain/ports/services/PasarelaPago';
import { Reporte } from '../../src/domain/entities/Reporte';
import { Disputa } from '../../src/domain/entities/Disputa';
import { Liquidacion } from '../../src/domain/entities/Liquidacion';
import { ContratoDetalle } from '../../src/domain/entities/Contrato';
import {
  ErrorConflicto,
  ErrorValidacion,
} from '../../src/shared/errors/ErrorAplicacion';

const reporteBase: Reporte = {
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
  fecha: new Date('2026-01-01T00:00:00.000Z'),
};

const disputaBase: Disputa = {
  id: 10,
  contratoId: 3,
  abiertaPorId: 2,
  motivo: 'Entrega incompleta',
  descripcion: 'Falta la mitad del trabajo',
  evidenciaUrl: null,
  estado: 'abierta',
  resolucion: null,
  resueltaPorId: null,
  fechaApertura: new Date('2026-01-01T00:00:00.000Z'),
  fechaResolucion: null,
};

const liquidacionBase: Liquidacion = {
  id: 100,
  freelancerId: 7,
  contratoId: 3,
  montoBruto: 100,
  comision: 12,
  montoNeto: 88,
  estado: 'solicitada',
  referencia: null,
  motivoRechazo: null,
  fechaCreacion: new Date('2026-01-01T00:00:00.000Z'),
  fechaSolicitud: new Date('2026-01-02T00:00:00.000Z'),
  fechaPago: null,
};

const contratoBase: ContratoDetalle = {
  id: 3,
  propuestaId: null,
  proyectoId: null,
  servicioId: 5,
  ofertaChatId: null,
  montoAcordado: 100,
  fechaInicio: new Date('2026-01-01T00:00:00.000Z'),
  fechaFin: null,
  estado: 'activo',
  contexto: { tipo: 'servicio', id: 5, titulo: 'Landing page' },
  cliente: { id: 2, nombre: 'Cliente', fotoPerfil: null },
  freelancer: { id: 7, nombre: 'Freelancer', fotoPerfil: null },
};

function repoNotificaciones() {
  const repo = {
    crear: vi.fn().mockResolvedValue({ id: 1 } as any),
    listar: vi.fn(),
    marcarLeida: vi.fn(),
    marcarTodasLeidas: vi.fn(),
  };
  return repo as typeof repo & NotificacionRepository;
}

describe('Moderador Use Cases', () => {
  it('ObtenerDashboardModeradorUseCase usa conteos reales', async () => {
    const reporteRepo: Partial<ReporteRepository> = {
      contar: vi.fn().mockResolvedValue(120),
    };
    const disputaRepo: Partial<DisputaRepository> = {
      contar: vi.fn().mockResolvedValue(7),
    };
    const liquidacionRepo: Partial<LiquidacionRepository> = {
      contar: vi.fn().mockResolvedValue(3),
    };

    const casoUso = new ObtenerDashboardModeradorUseCase(
      reporteRepo as ReporteRepository,
      disputaRepo as DisputaRepository,
      liquidacionRepo as LiquidacionRepository
    );

    await expect(casoUso.ejecutar()).resolves.toEqual({
      reportesPendientes: 120,
      disputasAbiertas: 7,
      retirosPendientes: 3,
    });
    expect(reporteRepo.contar).toHaveBeenCalledWith({ estado: 'pendiente' });
  });

  it('ListarReportesAdminUseCase devuelve el total real y la página', async () => {
    const reportes = [reporteBase];
    const reporteRepo: Partial<ReporteRepository> = {
      listar: vi.fn().mockResolvedValue(reportes),
      contar: vi.fn().mockResolvedValue(41),
    };

    const casoUso = new ListarReportesAdminUseCase(reporteRepo as ReporteRepository);
    const resultado = await casoUso.ejecutar({ estado: 'pendiente', page: 2, limit: 20 });

    expect(resultado).toEqual({ total: 41, reportes });
    expect(reporteRepo.listar).toHaveBeenCalledWith({ estado: 'pendiente', page: 2, limit: 20 });
    expect(reporteRepo.contar).toHaveBeenCalledWith({ estado: 'pendiente' });
  });

  it('ResolverReporteUseCase notifica al reportado y al reportero', async () => {
    const reporteRepo: Partial<ReporteRepository> = {
      obtenerPorId: vi.fn().mockResolvedValue(reporteBase),
      resolver: vi
        .fn()
        .mockResolvedValue({ ...reporteBase, estado: 'resuelto', resolucion: 'Advertencia' }),
    };
    const notificaciones = repoNotificaciones();

    const casoUso = new ResolverReporteUseCase(
      reporteRepo as ReporteRepository,
      notificaciones
    );

    const resultado = await casoUso.ejecutar(5, 1, 'Advertencia aplicada');
    expect(resultado.estado).toBe('resuelto');
    expect(notificaciones.crear).toHaveBeenCalledTimes(2);
    expect(notificaciones.crear).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: 8, tipo: 'reporte_resuelto' })
    );
    expect(notificaciones.crear).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: 2, tipo: 'reporte_resuelto' })
    );
  });

  it('ResolverReporteUseCase permite rechazar el reporte', async () => {
    const reporteRepo: Partial<ReporteRepository> = {
      obtenerPorId: vi.fn().mockResolvedValue(reporteBase),
      resolver: vi
        .fn()
        .mockResolvedValue({ ...reporteBase, estado: 'rechazado', resolucion: 'Sin mérito' }),
    };
    const casoUso = new ResolverReporteUseCase(
      reporteRepo as ReporteRepository,
      repoNotificaciones()
    );

    const resultado = await casoUso.ejecutar(5, 1, 'Sin mérito', 'rechazado');
    expect(resultado.estado).toBe('rechazado');
    expect(reporteRepo.resolver).toHaveBeenCalledWith(5, 1, 'Sin mérito', 'rechazado');
  });

  it('ResolverReporteUseCase rechaza un reporte ya gestionado con 409', async () => {
    const reporteRepo: Partial<ReporteRepository> = {
      obtenerPorId: vi.fn().mockResolvedValue({ ...reporteBase, estado: 'resuelto' }),
    };
    const casoUso = new ResolverReporteUseCase(
      reporteRepo as ReporteRepository,
      repoNotificaciones()
    );

    await expect(casoUso.ejecutar(5, 1, 'Otra vez')).rejects.toBeInstanceOf(ErrorConflicto);
  });

  it('CrearReporteUseCase crea el reporte y notifica a moderadores', async () => {
    const reporteRepo: Partial<ReporteRepository> = {
      crear: vi.fn().mockResolvedValue(reporteBase),
    };
    const notificaciones = repoNotificaciones();
    const usuarios: Partial<RepositorioUsuario> = {
      listarIdsPorRoles: vi.fn().mockResolvedValue([1, 99]),
      buscarPorId: vi.fn().mockResolvedValue({ id: 8 }),
    };
    const casoUso = new CrearReporteUseCase(
      reporteRepo as ReporteRepository,
      notificaciones,
      usuarios as RepositorioUsuario
    );

    const resultado = await casoUso.ejecutar({
      usuarioReportaId: 2,
      usuarioReportadoId: 8,
      motivo: '  Spam  ',
      descripcion: '  Enlaces maliciosos  ',
    });

    expect(resultado).toEqual(reporteBase);
    expect(reporteRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        usuarioReportaId: 2,
        usuarioReportadoId: 8,
        motivo: 'Spam',
        descripcion: 'Enlaces maliciosos',
        estado: 'pendiente',
        adminId: null,
      })
    );
    expect(usuarios.listarIdsPorRoles).toHaveBeenCalledWith([1, 4]);
    expect(notificaciones.crear).toHaveBeenCalledTimes(2);
  });

  it('CrearReporteUseCase exige usuario o proyecto y prohíbe auto-reportarse', async () => {
    const casoUso = new CrearReporteUseCase(
      {} as ReporteRepository,
      repoNotificaciones(),
      {} as RepositorioUsuario
    );

    await expect(
      casoUso.ejecutar({ usuarioReportaId: 2, motivo: 'Spam' })
    ).rejects.toBeInstanceOf(ErrorValidacion);

    await expect(
      casoUso.ejecutar({ usuarioReportaId: 2, usuarioReportadoId: 2, motivo: 'Spam' })
    ).rejects.toBeInstanceOf(ErrorConflicto);
  });

  it('ListarDisputasAdminUseCase devuelve total y página', async () => {
    const disputaRepo: Partial<DisputaRepository> = {
      listar: vi.fn().mockResolvedValue([disputaBase]),
      contar: vi.fn().mockResolvedValue(9),
    };
    const casoUso = new ListarDisputasAdminUseCase(disputaRepo as DisputaRepository);

    await expect(casoUso.ejecutar({ estado: 'abierta', page: 1, limit: 20 })).resolves.toEqual({
      total: 9,
      disputas: [disputaBase],
    });
  });

  it('ObtenerDisputaAdminUseCase agrega el contrato al detalle', async () => {
    const disputaRepo: Partial<DisputaRepository> = {
      obtenerPorId: vi.fn().mockResolvedValue(disputaBase),
    };
    const contratoRepo: Partial<ContratoRepository> = {
      obtener: vi.fn().mockResolvedValue(contratoBase),
    };
    const casoUso = new ObtenerDisputaAdminUseCase(
      disputaRepo as DisputaRepository,
      contratoRepo as ContratoRepository
    );

    const resultado = await casoUso.ejecutar(10);
    expect(resultado.contrato).toEqual(contratoBase);
    expect(resultado).toMatchObject({ id: 10, estado: 'abierta' });
  });

  it('ResolverDisputaUseCase notifica a ambas partes', async () => {
    const disputaRepo: Partial<DisputaRepository> = {
      obtenerPorId: vi.fn().mockResolvedValue(disputaBase),
      resolver: vi
        .fn()
        .mockResolvedValue({ ...disputaBase, estado: 'resuelta', resolucion: 'Cliente prevalece' }),
    };
    const contratoRepo: Partial<ContratoRepository> = {
      obtener: vi.fn().mockResolvedValue(contratoBase),
      cambiarEstado: vi
        .fn()
        .mockResolvedValue({ ...contratoBase, estado: 'completado' }),
    };
    const notificaciones = repoNotificaciones();
    const pagos: Partial<PagoRepository> = {
      obtenerPorContrato: vi.fn().mockResolvedValue({
        id: 1,
        contratoId: 3,
        monto: 103,
        estado: 'retenido',
        metodoPago: 'mercado_pago',
        referenciaPasarela: 'MP-1',
        preferenciaId: null,
        fechaPago: new Date('2026-01-01T00:00:00.000Z'),
      }),
      liberar: vi.fn(),
    };
    const liquidaciones: Partial<LiquidacionRepository> = {
      crearParaContrato: vi.fn(),
    };
    const pasarela = {
      esSimulada: true,
    } as unknown as PasarelaPago;
    const casoUso = new ResolverDisputaUseCase(
      contratoRepo as ContratoRepository,
      disputaRepo as DisputaRepository,
      notificaciones,
      pagos as PagoRepository,
      liquidaciones as LiquidacionRepository,
      pasarela,
      12
    );

    const resultado = await casoUso.ejecutar(10, 1, {
      estado: 'resuelta',
      resultado: 'liberar_freelancer',
      resolucion: 'Cliente prevalece',
    });
    expect(resultado.estado).toBe('resuelta');
    expect(pagos.liberar).toHaveBeenCalledWith(3);
    expect(notificaciones.crear).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: contratoBase.cliente.id })
    );
    expect(notificaciones.crear).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: contratoBase.freelancer.id })
    );
  });

  it('ListarLiquidacionesAdminUseCase devuelve total y página', async () => {
    const liquidacionRepo: Partial<LiquidacionRepository> = {
      listar: vi.fn().mockResolvedValue([liquidacionBase]),
      contar: vi.fn().mockResolvedValue(4),
    };
    const casoUso = new ListarLiquidacionesAdminUseCase(
      liquidacionRepo as LiquidacionRepository
    );

    await expect(
      casoUso.ejecutar({ estado: 'solicitada', page: 1, limit: 20 })
    ).resolves.toEqual({ total: 4, liquidaciones: [liquidacionBase] });
  });

  it('AprobarRetiroUseCase paga y notifica', async () => {
    const liquidacionRepo: Partial<LiquidacionRepository> = {
      obtenerPorId: vi.fn().mockResolvedValue(liquidacionBase),
      aprobarRetiro: vi
        .fn()
        .mockResolvedValue({ ...liquidacionBase, estado: 'pagada', referencia: 'MP-1' }),
    };
    const notificaciones = repoNotificaciones();
    const casoUso = new AprobarRetiroUseCase(
      liquidacionRepo as LiquidacionRepository,
      notificaciones
    );

    const resultado = await casoUso.ejecutar(100, 1, 'pagada', 'MP-1');
    expect(resultado.estado).toBe('pagada');
    expect(notificaciones.crear).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: 7, tipo: 'retiro_aprobado' })
    );
  });

  it('AprobarRetiroUseCase rechaza una liquidación que no está solicitada con 409', async () => {
    const liquidacionRepo: Partial<LiquidacionRepository> = {
      obtenerPorId: vi.fn().mockResolvedValue({ ...liquidacionBase, estado: 'pagada' }),
    };
    const casoUso = new AprobarRetiroUseCase(
      liquidacionRepo as LiquidacionRepository,
      repoNotificaciones()
    );

    await expect(casoUso.ejecutar(100, 1, 'pagada', null)).rejects.toBeInstanceOf(
      ErrorConflicto
    );
  });
});
