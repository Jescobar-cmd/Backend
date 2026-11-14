import { describe, expect, it, vi } from 'vitest';
import { IniciarPagoUseCase } from '../../src/application/use-cases/IniciarPagoUseCase';
import { ConfirmarPagoUseCase } from '../../src/application/use-cases/ConfirmarPagoUseCase';
import { SimularPagoUseCase } from '../../src/application/use-cases/SimularPagoUseCase';
import { ContratoRepository } from '../../src/domain/ports/repositories/ContratoRepository';
import { NotificacionRepository } from '../../src/domain/ports/repositories/NotificacionRepository';
import { PagoRepository } from '../../src/domain/ports/repositories/PagoRepository';
import { RepositorioUsuario } from '../../src/domain/ports/repositories/RepositorioUsuario';
import { PasarelaPago } from '../../src/domain/ports/services/PasarelaPago';
import { ContratoDetalle } from '../../src/domain/entities/Contrato';
import { PagoEscrow } from '../../src/domain/entities/Pago';
import {
  ErrorConflicto,
  ErrorProhibido,
  ErrorServicioNoDisponible,
} from '../../src/shared/errors/ErrorAplicacion';

const contratoBase: ContratoDetalle = {
  id: 1,
  propuestaId: null,
  proyectoId: null,
  servicioId: 5,
  ofertaChatId: null,
  montoAcordado: 100,
  fechaInicio: null,
  fechaFin: null,
  estado: 'pendiente_pago',
  contexto: { tipo: 'servicio', id: 5, titulo: 'Landing page' },
  cliente: { id: 10, nombre: 'Cliente', fotoPerfil: null },
  freelancer: { id: 20, nombre: 'Freelancer', fotoPerfil: null },
};

const pagoPendiente: PagoEscrow = {
  id: 1,
  contratoId: 1,
  monto: 103,
  estado: 'pendiente',
  metodoPago: 'mercado_pago',
  referenciaPasarela: null,
  preferenciaId: null,
  fechaPago: new Date('2026-01-01T00:00:00.000Z'),
};

const pagoRetenido: PagoEscrow = {
  ...pagoPendiente,
  estado: 'retenido',
  referenciaPasarela: 'MP-1',
};

function contratoRepo(overrides: Partial<ContratoRepository> = {}): ContratoRepository {
  return {
    listar: vi.fn(),
    obtener: vi.fn().mockResolvedValue(contratoBase),
    crearCompraDirecta: vi.fn(),
    existeActivoPorServicio: vi.fn(),
    cambiarEstado: vi.fn(),
    ...overrides,
  } as ContratoRepository;
}

function pagoRepo(overrides: Partial<PagoRepository> = {}): PagoRepository {
  return {
    listarPorCliente: vi.fn(),
    listarPorFreelancer: vi.fn(),
    obtenerFactura: vi.fn(),
    obtenerFacturaFreelancer: vi.fn(),
    obtenerPorContrato: vi.fn().mockResolvedValue(pagoPendiente),
    guardarPreferencia: vi.fn(),
    confirmar: vi.fn(),
    liberar: vi.fn(),
    reembolsar: vi.fn(),
    ...overrides,
  } as PagoRepository;
}

function pasarela(esSimulada: boolean): PasarelaPago {
  return {
    esSimulada,
    crearPreferencia: vi.fn().mockResolvedValue({
      id: 'pref-1',
      initPoint: 'https://mp.example/pref-1',
    }),
    consultarPago: vi.fn(),
    reembolsar: vi.fn(),
  };
}

describe('IniciarPagoUseCase', () => {
  it('crea la preferencia y la guarda en el pago pendiente', async () => {
    const contratos = contratoRepo();
    const pagos = pagoRepo();
    const usuarios = {
      buscarPorId: vi.fn().mockResolvedValue({ id: 10, email: 'cliente@test.com' }),
    } as unknown as RepositorioUsuario;
    const gateway = pasarela(true);

    const resultado = await new IniciarPagoUseCase(
      contratos,
      pagos,
      usuarios,
      gateway,
      {
        frontendUrl: 'http://localhost:5173',
        backendUrl: 'http://localhost:4000',
        entornoProduccion: false,
      }
    ).ejecutar(1, 10);

    expect(resultado.preferenciaId).toBe('pref-1');
    expect(resultado.simulado).toBe(true);
    expect(pagos.guardarPreferencia).toHaveBeenCalledWith(1, 'pref-1');
  });

  it('rechaza iniciar el pago si el contrato ya está activo', async () => {
    const contratos = contratoRepo({
      obtener: vi.fn().mockResolvedValue({ ...contratoBase, estado: 'activo' }),
    });

    await expect(
      new IniciarPagoUseCase(
        contratos,
        pagoRepo(),
        {} as RepositorioUsuario,
        pasarela(true),
        {
          frontendUrl: 'http://localhost:5173',
          backendUrl: 'http://localhost:4000',
          entornoProduccion: false,
        }
      ).ejecutar(1, 10)
    ).rejects.toBeInstanceOf(ErrorConflicto);
  });

  it('bloquea la pasarela simulada en producción', async () => {
    await expect(
      new IniciarPagoUseCase(
        contratoRepo(),
        pagoRepo(),
        {} as RepositorioUsuario,
        pasarela(true),
        {
          frontendUrl: 'http://localhost:5173',
          backendUrl: 'http://localhost:4000',
          entornoProduccion: true,
        }
      ).ejecutar(1, 10)
    ).rejects.toBeInstanceOf(ErrorServicioNoDisponible);
  });
});

describe('ConfirmarPagoUseCase', () => {
  it('retiene el pago aprobado y notifica a ambas partes', async () => {
    const contratos = contratoRepo();
    const pagos = pagoRepo({
      confirmar: vi.fn().mockResolvedValue(pagoRetenido),
    });
    const notificaciones = {
      crear: vi.fn(),
    } as unknown as NotificacionRepository;
    const gateway = pasarela(false);
    (gateway.consultarPago as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'MP-1',
      estado: 'approved',
      monto: 103,
      referenciaExterna: '1',
    });

    const resultado = await new ConfirmarPagoUseCase(
      contratos,
      pagos,
      notificaciones,
      gateway
    ).ejecutar('MP-1');

    expect(resultado).toEqual({ confirmado: true, pago: pagoRetenido });
    expect(pagos.confirmar).toHaveBeenCalledWith(1, 'MP-1', 'mercado_pago');
    expect(notificaciones.crear).toHaveBeenCalledTimes(2);
  });

  it('no vuelve a notificar si el webhook se repite', async () => {
    const pagos = pagoRepo({
      obtenerPorContrato: vi.fn().mockResolvedValue(pagoRetenido),
      confirmar: vi.fn().mockResolvedValue(pagoRetenido),
    });
    const notificaciones = {
      crear: vi.fn(),
    } as unknown as NotificacionRepository;
    const gateway = pasarela(false);
    (gateway.consultarPago as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'MP-1',
      estado: 'approved',
      monto: 103,
      referenciaExterna: '1',
    });

    await new ConfirmarPagoUseCase(
      contratoRepo(),
      pagos,
      notificaciones,
      gateway
    ).ejecutar('MP-1');

    expect(notificaciones.crear).not.toHaveBeenCalled();
  });

  it('ignora los pagos que la pasarela aún no aprueba', async () => {
    const gateway = pasarela(false);
    (gateway.consultarPago as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'MP-2',
      estado: 'pending',
      monto: 103,
      referenciaExterna: '1',
    });

    await expect(
      new ConfirmarPagoUseCase(
        contratoRepo(),
        pagoRepo(),
        {} as NotificacionRepository,
        gateway
      ).ejecutar('MP-2')
    ).resolves.toEqual({ confirmado: false, pago: null });
  });
});

describe('SimularPagoUseCase', () => {
  it('confirma el pago en desarrollo', async () => {
    const pagos = pagoRepo({
      confirmar: vi.fn().mockResolvedValue(pagoRetenido),
    });

    const resultado = await new SimularPagoUseCase(
      contratoRepo(),
      pagos,
      { crear: vi.fn() } as unknown as NotificacionRepository,
      pasarela(true),
      false
    ).ejecutar(1, 10);

    expect(resultado.estado).toBe('retenido');
  });

  it('prohíbe simular pagos en producción', async () => {
    await expect(
      new SimularPagoUseCase(
        contratoRepo(),
        pagoRepo(),
        {} as NotificacionRepository,
        pasarela(true),
        true
      ).ejecutar(1, 10)
    ).rejects.toBeInstanceOf(ErrorProhibido);
  });
});
