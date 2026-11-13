import { describe, expect, it, vi } from 'vitest';
import { RechazarEntregaUseCase } from '../../src/application/use-cases/RechazarEntregaUseCase';
import { ActualizarEntregaContratoUseCase } from '../../src/application/use-cases/ActualizarEntregaContratoUseCase';
import { ListarPagosFreelancerUseCase } from '../../src/application/use-cases/ListarPagosFreelancerUseCase';
import { ObtenerFacturaPagoFreelancerUseCase } from '../../src/application/use-cases/ObtenerFacturaPagoFreelancerUseCase';
import { ObtenerLiquidacionesFreelancerUseCase } from '../../src/application/use-cases/ObtenerLiquidacionesFreelancerUseCase';
import { SolicitarRetiroUseCase } from '../../src/application/use-cases/SolicitarRetiroUseCase';
import { ContratoRepository } from '../../src/domain/ports/repositories/ContratoRepository';
import { EntregaContratoRepository } from '../../src/domain/ports/repositories/EntregaContratoRepository';
import { NotificacionRepository } from '../../src/domain/ports/repositories/NotificacionRepository';
import { PagoRepository } from '../../src/domain/ports/repositories/PagoRepository';
import { LiquidacionRepository } from '../../src/domain/ports/repositories/LiquidacionRepository';
import { ContratoDetalle } from '../../src/domain/entities/Contrato';
import { EntregaContrato } from '../../src/domain/entities/EntregaContrato';
import { Liquidacion } from '../../src/domain/entities/Liquidacion';
import { PagoFreelancer } from '../../src/domain/entities/Pago';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../src/shared/errors/ErrorAplicacion';

const contrato: ContratoDetalle = {
  id: 1,
  propuestaId: null,
  proyectoId: null,
  servicioId: 5,
  ofertaChatId: null,
  montoAcordado: 1000,
  fechaInicio: new Date('2026-01-01T00:00:00.000Z'),
  fechaFin: null,
  estado: 'activo',
  contexto: { tipo: 'servicio', id: 5, titulo: 'Landing page' },
  cliente: { id: 10, nombre: 'Cliente', fotoPerfil: null },
  freelancer: { id: 20, nombre: 'Freelancer', fotoPerfil: null },
};

const entrega: EntregaContrato = {
  id: 3,
  contratoId: 1,
  autorId: 20,
  mensaje: 'Entrega lista',
  archivoUrl: 'https://res.cloudinary.com/entrega.zip',
  enlaceUrl: null,
  estado: 'enviada',
  observacionRevision: null,
  fechaEntrega: new Date('2026-01-02T00:00:00.000Z'),
  fechaRevision: null,
  revisadoPorId: null,
};

const pago: PagoFreelancer = {
  id: 1,
  contratoId: 1,
  monto: 1000,
  metodoPago: 'mercado_pago',
  estado: 'pagado',
  referenciaPasarela: 'MP-123',
  fechaPago: new Date('2026-01-03T00:00:00.000Z'),
  contrato: { id: 1, titulo: 'Landing page', estado: 'completado' },
  cliente: { id: 10, nombre: 'Cliente', fotoPerfil: null },
  factura: null,
};

const liquidacion: Liquidacion = {
  id: 1,
  freelancerId: 20,
  contratoId: 1,
  montoBruto: 1000,
  comision: 100,
  montoNeto: 900,
  estado: 'pendiente',
  referencia: null,
  fechaCreacion: new Date('2026-01-03T00:00:00.000Z'),
  fechaSolicitud: null,
  fechaPago: null,
};

function contratoRepo(overrides: Partial<ContratoRepository> = {}): ContratoRepository {
  return {
    listar: vi.fn(),
    obtener: vi.fn().mockResolvedValue(contrato),
    crearCompraDirecta: vi.fn(),
    existeActivoPorServicio: vi.fn(),
    cambiarEstado: vi.fn(),
    ...overrides,
  } as ContratoRepository;
}

function notificacionRepo(): NotificacionRepository {
  return {
    crear: vi.fn().mockResolvedValue({
      id: 1,
      usuarioId: 20,
      tipo: 'test',
      titulo: 'Test',
      mensaje: 'Test',
      enlace: null,
      leida: false,
      fechaCreacion: new Date(),
    }),
  } as unknown as NotificacionRepository;
}

describe('FreelancerUseCases', () => {
  it('rechaza una entrega y notifica al freelancer', async () => {
    const entregas = {
      obtenerPendiente: vi.fn().mockResolvedValue(entrega),
      rechazar: vi.fn().mockResolvedValue({
        ...entrega,
        estado: 'rechazada',
        observacionRevision: 'Falta el footer',
      }),
    } as unknown as EntregaContratoRepository;
    const notificaciones = notificacionRepo();

    const resultado = await new RechazarEntregaUseCase(
      contratoRepo(),
      entregas,
      notificaciones
    ).ejecutar(1, 10, 'Falta el footer');

    expect(resultado.estado).toBe('rechazada');
    expect(notificaciones.crear).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: 20, tipo: 'entrega_rechazada' })
    );
  });

  it('impide que un freelancer ajeno rechace la entrega', async () => {
    const entregas = {} as unknown as EntregaContratoRepository;

    await expect(
      new RechazarEntregaUseCase(contratoRepo(), entregas, notificacionRepo()).ejecutar(
        1,
        99,
        'Falta el footer'
      )
    ).rejects.toThrow(ErrorProhibido);
  });

  it('actualiza una entrega en revisión', async () => {
    const entregas = {
      obtenerPorId: vi.fn().mockResolvedValue(entrega),
      actualizar: vi.fn().mockResolvedValue({
        ...entrega,
        mensaje: 'Entrega corregida',
      }),
    } as unknown as EntregaContratoRepository;
    const notificaciones = notificacionRepo();

    const resultado = await new ActualizarEntregaContratoUseCase(
      contratoRepo(),
      entregas,
      notificaciones
    ).ejecutar(1, 3, 20, { mensaje: 'Entrega corregida' });

    expect(resultado.mensaje).toBe('Entrega corregida');
    expect(notificaciones.crear).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: 10, tipo: 'entrega_actualizada' })
    );
  });

  it('no actualiza una entrega ya aprobada', async () => {
    const entregas = {
      obtenerPorId: vi.fn().mockResolvedValue({ ...entrega, estado: 'aprobada' }),
    } as unknown as EntregaContratoRepository;

    await expect(
      new ActualizarEntregaContratoUseCase(
        contratoRepo(),
        entregas,
        notificacionRepo()
      ).ejecutar(1, 3, 20, { mensaje: 'Cambio' })
    ).rejects.toThrow(ErrorConflicto);
  });

  it('lista pagos y factura del freelancer', async () => {
    const pagos = {
      listarPorFreelancer: vi.fn().mockResolvedValue([pago]),
      obtenerFacturaFreelancer: vi.fn().mockResolvedValue({
        id: 1,
        numeroFactura: 'F-001',
        cufe: null,
        fechaEmision: new Date(),
        estado: 'emitida',
        urlPdf: 'https://example.com/factura.pdf',
      }),
    } as unknown as PagoRepository;

    await expect(new ListarPagosFreelancerUseCase(pagos).ejecutar(20)).resolves.toEqual([
      pago,
    ]);
    await expect(
      new ObtenerFacturaPagoFreelancerUseCase(pagos).ejecutar(1, 20)
    ).resolves.toEqual(expect.objectContaining({ numeroFactura: 'F-001' }));
  });

  it('lanza 404 si la factura no pertenece al freelancer', async () => {
    const pagos = {
      obtenerFacturaFreelancer: vi.fn().mockResolvedValue(null),
    } as unknown as PagoRepository;

    await expect(
      new ObtenerFacturaPagoFreelancerUseCase(pagos).ejecutar(1, 20)
    ).rejects.toThrow(ErrorNoEncontrado);
  });

  it('obtiene resumen e historial de liquidaciones', async () => {
    const resumen = {
      saldoDisponible: 900,
      saldoEnProceso: 0,
      totalPagado: 0,
      comisionTotal: 100,
      totalLiquidaciones: 1,
    };
    const liquidaciones = {
      resumen: vi.fn().mockResolvedValue(resumen),
      listarPorFreelancer: vi.fn().mockResolvedValue([liquidacion]),
    } as unknown as LiquidacionRepository;

    await expect(
      new ObtenerLiquidacionesFreelancerUseCase(liquidaciones).ejecutar(20)
    ).resolves.toEqual({ resumen, liquidaciones: [liquidacion] });
  });

  it('solicita retiro si hay saldo disponible', async () => {
    const liquidaciones = {
      solicitarRetiro: vi.fn().mockResolvedValue({ cantidad: 1, total: 900 }),
    } as unknown as LiquidacionRepository;

    await expect(new SolicitarRetiroUseCase(liquidaciones).ejecutar(20)).resolves.toEqual(
      { cantidad: 1, total: 900 }
    );
  });

  it('rechaza el retiro si no hay saldo disponible', async () => {
    const liquidaciones = {
      solicitarRetiro: vi.fn().mockResolvedValue({ cantidad: 0, total: 0 }),
    } as unknown as LiquidacionRepository;

    await expect(new SolicitarRetiroUseCase(liquidaciones).ejecutar(20)).rejects.toThrow(
      ErrorConflicto
    );
  });
});
