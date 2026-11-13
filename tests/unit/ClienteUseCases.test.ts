import { describe, expect, it, vi } from 'vitest';
import { ObtenerDashboardClienteUseCase } from '../../src/application/use-cases/ObtenerDashboardClienteUseCase';
import { ContratarServicioUseCase } from '../../src/application/use-cases/ContratarServicioUseCase';
import { AprobarEntregaUseCase } from '../../src/application/use-cases/AprobarEntregaUseCase';
import { AbrirDisputaUseCase } from '../../src/application/use-cases/AbrirDisputaUseCase';
import { ListarPagosClienteUseCase } from '../../src/application/use-cases/ListarPagosClienteUseCase';
import { ObtenerFacturaPagoUseCase } from '../../src/application/use-cases/ObtenerFacturaPagoUseCase';
import { MarcarNotificacionLeidaUseCase } from '../../src/application/use-cases/MarcarNotificacionLeidaUseCase';
import { MarcarTodasNotificacionesLeidasUseCase } from '../../src/application/use-cases/MarcarTodasNotificacionesLeidasUseCase';
import { RegistrarEntregaContratoUseCase } from '../../src/application/use-cases/RegistrarEntregaContratoUseCase';
import { ListarEntregasContratoUseCase } from '../../src/application/use-cases/ListarEntregasContratoUseCase';
import { ListarDisputasContratoUseCase } from '../../src/application/use-cases/ListarDisputasContratoUseCase';
import { ListarNotificacionesUseCase } from '../../src/application/use-cases/ListarNotificacionesUseCase';
import { DashboardClienteRepository } from '../../src/domain/ports/repositories/DashboardClienteRepository';
import { ContratoRepository } from '../../src/domain/ports/repositories/ContratoRepository';
import { ServicioRepository } from '../../src/domain/ports/repositories/ServicioRepository';
import { NotificacionRepository } from '../../src/domain/ports/repositories/NotificacionRepository';
import { EntregaContratoRepository } from '../../src/domain/ports/repositories/EntregaContratoRepository';
import { DisputaRepository } from '../../src/domain/ports/repositories/DisputaRepository';
import { PagoRepository } from '../../src/domain/ports/repositories/PagoRepository';
import { ContratoDetalle } from '../../src/domain/entities/Contrato';
import { Servicio } from '../../src/domain/entities/Servicio';
import { EntregaContrato } from '../../src/domain/entities/EntregaContrato';
import { Disputa } from '../../src/domain/entities/Disputa';
import { Notificacion } from '../../src/domain/entities/Notificacion';
import { PagoCliente } from '../../src/domain/entities/Pago';
import { ErrorConflicto, ErrorNoEncontrado, ErrorProhibido } from '../../src/shared/errors/ErrorAplicacion';

const contratoBase: ContratoDetalle = {
  id: 1,
  propuestaId: null,
  proyectoId: null,
  servicioId: 5,
  ofertaChatId: null,
  montoAcordado: 100,
  fechaInicio: new Date('2026-01-01T00:00:00.000Z'),
  fechaFin: null,
  estado: 'activo',
  contexto: { tipo: 'servicio', id: 5, titulo: 'Landing page' },
  cliente: { id: 10, nombre: 'Cliente', fotoPerfil: null },
  freelancer: { id: 20, nombre: 'Freelancer', fotoPerfil: null },
};

const contratoCompletado: ContratoDetalle = {
  ...contratoBase,
  estado: 'completado',
  fechaFin: new Date('2026-01-02T00:00:00.000Z'),
};

const servicio: Servicio = {
  id: 5,
  titulo: 'Landing page',
  descripcion: 'Una landing page completa',
  precio: 100,
  imagenUrl: null,
  estado: 'activo',
  fechaCreacion: new Date('2026-01-01T00:00:00.000Z'),
  categoria: null,
  freelancer: {
    id: 20,
    nombre: 'Freelancer',
    fotoPerfil: null,
    tituloProfesional: null,
    calificacionPromedio: 5,
  },
};

const entregaBase: EntregaContrato = {
  id: 3,
  contratoId: 1,
  autorId: 20,
  mensaje: 'Entrega lista',
  archivoUrl: 'https://res.cloudinary.com/entrega.zip',
  enlaceUrl: null,
  estado: 'enviada',
  fechaEntrega: new Date('2026-01-02T00:00:00.000Z'),
  fechaRevision: null,
  revisadoPorId: null,
};

const notificacionBase: Notificacion = {
  id: 1,
  usuarioId: 20,
  tipo: 'contrato_creado',
  titulo: 'Nuevo contrato',
  mensaje: 'Tienes un contrato',
  enlace: '/contratos/1',
  leida: false,
  fechaCreacion: new Date('2026-01-01T00:00:00.000Z'),
};

const disputaBase: Disputa = {
  id: 1,
  contratoId: 1,
  abiertaPorId: 10,
  motivo: 'Entrega incompleta',
  descripcion: 'Faltan dos pantallas',
  evidenciaUrl: null,
  estado: 'abierta',
  resolucion: null,
  resueltaPorId: null,
  fechaApertura: new Date('2026-01-02T00:00:00.000Z'),
  fechaResolucion: null,
};

const pagoBase: PagoCliente = {
  id: 1,
  contratoId: 1,
  monto: 100,
  metodoPago: 'mercado_pago',
  estado: 'pendiente',
  referenciaPasarela: null,
  fechaPago: new Date('2026-01-01T00:00:00.000Z'),
  contrato: { id: 1, titulo: 'Landing page', estado: 'activo' },
  factura: null,
};

function contratoRepo(overrides: Partial<ContratoRepository> = {}): ContratoRepository {
  return {
    listar: vi.fn(),
    obtener: vi.fn(),
    crearCompraDirecta: vi.fn(),
    existeActivoPorServicio: vi.fn(),
    cambiarEstado: vi.fn(),
    ...overrides,
  } as ContratoRepository;
}

describe('ClienteUseCases', () => {
  it('obtiene el dashboard del cliente con la contraparte correcta', async () => {
    const repo = {
      obtener: vi.fn().mockResolvedValue({
        contratosActivos: 1,
        contratosCompletados: 0,
        contratosCancelados: 0,
        entregasPendientes: 1,
        disputasAbiertas: 0,
        pagosPendientes: 1,
        totalPagado: 0,
        notificacionesSinLeer: 2,
        contratosRecientes: [contratoBase],
      }),
    } as unknown as DashboardClienteRepository;

    const resultado = await new ObtenerDashboardClienteUseCase(repo).ejecutar(10);

    expect(resultado.contratosActivos).toBe(1);
    expect(resultado.contratosRecientes[0].contraparte).toEqual({
      id: 20,
      nombre: 'Freelancer',
      fotoPerfil: null,
      rol: 2,
    });
  });

  it('contrata un servicio y notifica al freelancer', async () => {
    const servicioRepo = {
      obtenerPorId: vi.fn().mockResolvedValue(servicio),
    } as unknown as ServicioRepository;
    const contratos = contratoRepo({
      existeActivoPorServicio: vi.fn().mockResolvedValue(false),
      crearCompraDirecta: vi.fn().mockResolvedValue(contratoBase),
    });
    const notificaciones = {
      crear: vi.fn().mockResolvedValue(notificacionBase),
    } as unknown as NotificacionRepository;

    const resultado = await new ContratarServicioUseCase(
      servicioRepo,
      contratos,
      notificaciones
    ).ejecutar(10, 5);

    expect(resultado.id).toBe(1);
    expect(notificaciones.crear).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: 20, tipo: 'contrato_creado' })
    );
  });

  it('rechaza contratar el propio servicio', async () => {
    const servicioRepo = {
      obtenerPorId: vi.fn().mockResolvedValue({
        ...servicio,
        freelancer: { ...servicio.freelancer, id: 10 },
      }),
    } as unknown as ServicioRepository;
    const contratos = contratoRepo();
    const notificaciones = { crear: vi.fn() } as unknown as NotificacionRepository;

    await expect(
      new ContratarServicioUseCase(servicioRepo, contratos, notificaciones).ejecutar(
        10,
        5
      )
    ).rejects.toThrow(ErrorConflicto);
  });

  it('aprueba la entrega y completa el contrato', async () => {
    const contratos = contratoRepo({
      obtener: vi.fn().mockResolvedValue(contratoBase),
      cambiarEstado: vi.fn().mockResolvedValue(contratoCompletado),
    });
    const entregas = {
      obtenerPendiente: vi.fn().mockResolvedValue(entregaBase),
      aprobar: vi.fn().mockResolvedValue({
        ...entregaBase,
        estado: 'aprobada',
        revisadoPorId: 10,
      }),
    } as unknown as EntregaContratoRepository;
    const notificaciones = {
      crear: vi.fn().mockResolvedValue(notificacionBase),
    } as unknown as NotificacionRepository;

    const resultado = await new AprobarEntregaUseCase(
      contratos,
      entregas,
      notificaciones
    ).ejecutar(1, 10);

    expect(resultado.contrato.estado).toBe('completado');
    expect(resultado.entrega.estado).toBe('aprobada');
    expect(contratos.cambiarEstado).toHaveBeenCalledWith(1, 'completado');
  });

  it('rechaza aprobar si no hay entrega pendiente', async () => {
    const contratos = contratoRepo({
      obtener: vi.fn().mockResolvedValue(contratoBase),
    });
    const entregas = {
      obtenerPendiente: vi.fn().mockResolvedValue(null),
    } as unknown as EntregaContratoRepository;
    const notificaciones = { crear: vi.fn() } as unknown as NotificacionRepository;

    await expect(
      new AprobarEntregaUseCase(contratos, entregas, notificaciones).ejecutar(1, 10)
    ).rejects.toThrow(ErrorConflicto);
  });

  it('rechaza aprobar si el usuario no es el cliente', async () => {
    const contratos = contratoRepo({
      obtener: vi.fn().mockResolvedValue(contratoBase),
    });
    const entregas = {} as unknown as EntregaContratoRepository;
    const notificaciones = { crear: vi.fn() } as unknown as NotificacionRepository;

    await expect(
      new AprobarEntregaUseCase(contratos, entregas, notificaciones).ejecutar(1, 99)
    ).rejects.toThrow(ErrorProhibido);
  });

  it('abre una disputa y notifica a la contraparte', async () => {
    const contratos = contratoRepo({
      obtener: vi.fn().mockResolvedValue(contratoBase),
    });
    const disputas = {
      existeAbierta: vi.fn().mockResolvedValue(false),
      crear: vi.fn().mockResolvedValue(disputaBase),
    } as unknown as DisputaRepository;
    const notificaciones = {
      crear: vi.fn().mockResolvedValue(notificacionBase),
    } as unknown as NotificacionRepository;

    const resultado = await new AbrirDisputaUseCase(
      contratos,
      disputas,
      notificaciones
    ).ejecutar(1, 10, {
      motivo: 'Entrega incompleta',
      descripcion: 'Faltan dos pantallas',
    });

    expect(resultado.id).toBe(1);
    expect(notificaciones.crear).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: 20, tipo: 'disputa_abierta' })
    );
  });

  it('rechaza abrir una segunda disputa abierta', async () => {
    const contratos = contratoRepo({
      obtener: vi.fn().mockResolvedValue(contratoBase),
    });
    const disputas = {
      existeAbierta: vi.fn().mockResolvedValue(true),
    } as unknown as DisputaRepository;
    const notificaciones = { crear: vi.fn() } as unknown as NotificacionRepository;

    await expect(
      new AbrirDisputaUseCase(contratos, disputas, notificaciones).ejecutar(1, 10, {
        motivo: 'Entrega incompleta',
        descripcion: 'Faltan dos pantallas',
      })
    ).rejects.toThrow(ErrorConflicto);
  });

  it('lista los pagos del cliente', async () => {
    const pagos = {
      listarPorCliente: vi.fn().mockResolvedValue([pagoBase]),
    } as unknown as PagoRepository;

    await expect(new ListarPagosClienteUseCase(pagos).ejecutar(10)).resolves.toEqual([
      pagoBase,
    ]);
  });

  it('lanza 404 si el pago no tiene factura', async () => {
    const pagos = {
      obtenerFactura: vi.fn().mockResolvedValue(null),
    } as unknown as PagoRepository;

    await expect(new ObtenerFacturaPagoUseCase(pagos).ejecutar(1, 10)).rejects.toThrow(
      ErrorNoEncontrado
    );
  });

  it('lanza 404 al marcar una notificación ajena', async () => {
    const notificaciones = {
      marcarLeida: vi.fn().mockResolvedValue(null),
    } as unknown as NotificacionRepository;

    await expect(
      new MarcarNotificacionLeidaUseCase(notificaciones).ejecutar(1, 10)
    ).rejects.toThrow(ErrorNoEncontrado);
  });

  it('registra la entrega del freelancer y notifica al cliente', async () => {
    const contratos = contratoRepo({
      obtener: vi.fn().mockResolvedValue(contratoBase),
    });
    const entregas = {
      obtenerPendiente: vi.fn().mockResolvedValue(null),
      crear: vi.fn().mockResolvedValue(entregaBase),
    } as unknown as EntregaContratoRepository;
    const notificaciones = {
      crear: vi.fn().mockResolvedValue(notificacionBase),
    } as unknown as NotificacionRepository;

    const resultado = await new RegistrarEntregaContratoUseCase(
      contratos,
      entregas,
      notificaciones
    ).ejecutar(1, 20, { mensaje: 'Entrega lista' });

    expect(resultado.id).toBe(3);
    expect(notificaciones.crear).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: 10, tipo: 'entrega_enviada' })
    );
  });

  it('lista entregas y disputas de un contrato propio', async () => {
    const contratos = contratoRepo({
      obtener: vi.fn().mockResolvedValue(contratoBase),
    });
    const entregas = {
      listarPorContrato: vi.fn().mockResolvedValue([entregaBase]),
    } as unknown as EntregaContratoRepository;
    const disputas = {
      listarPorContrato: vi.fn().mockResolvedValue([disputaBase]),
    } as unknown as DisputaRepository;

    await expect(
      new ListarEntregasContratoUseCase(contratos, entregas).ejecutar(1, 10)
    ).resolves.toEqual([entregaBase]);
    await expect(
      new ListarDisputasContratoUseCase(contratos, disputas).ejecutar(1, 10)
    ).resolves.toEqual([disputaBase]);
  });

  it('lista notificaciones y marca todas como leídas', async () => {
    const paginadas = {
      page: 1,
      limit: 20,
      total: 1,
      noLeidas: 1,
      items: [notificacionBase],
    };
    const notificaciones = {
      listar: vi.fn().mockResolvedValue(paginadas),
      marcarTodasLeidas: vi.fn().mockResolvedValue(1),
    } as unknown as NotificacionRepository;

    await expect(
      new ListarNotificacionesUseCase(notificaciones).ejecutar(20, {
        page: 1,
        limit: 20,
      })
    ).resolves.toEqual(paginadas);
    await expect(
      new MarcarTodasNotificacionesLeidasUseCase(notificaciones).ejecutar(20)
    ).resolves.toEqual({ actualizadas: 1 });
  });
});
