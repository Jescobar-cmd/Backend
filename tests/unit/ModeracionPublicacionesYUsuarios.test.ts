import { describe, expect, it, vi } from 'vitest';
import { DerivarReporteADisputaUseCase } from '../../src/application/use-cases/DerivarReporteADisputaUseCase';
import { ListarUsuariosModeracionUseCase } from '../../src/application/use-cases/ListarUsuariosModeracionUseCase';
import { ObtenerUsuarioModeracionUseCase } from '../../src/application/use-cases/ObtenerUsuarioModeracionUseCase';
import { ModerarPublicacionUseCase } from '../../src/application/use-cases/ModerarPublicacionUseCase';
import { ReporteRepository } from '../../src/domain/ports/repositories/ReporteRepository';
import { DisputaRepository } from '../../src/domain/ports/repositories/DisputaRepository';
import { ContratoRepository } from '../../src/domain/ports/repositories/ContratoRepository';
import { NotificacionRepository } from '../../src/domain/ports/repositories/NotificacionRepository';
import { UsuarioModeracionRepository } from '../../src/domain/ports/repositories/UsuarioModeracionRepository';
import { ServicioRepository } from '../../src/domain/ports/repositories/ServicioRepository';
import { ProyectoRepository } from '../../src/domain/ports/repositories/ProyectoRepository';
import { PagoRepository } from '../../src/domain/ports/repositories/PagoRepository';
import { ModeracionPublicacionRepository } from '../../src/domain/ports/repositories/ModeracionPublicacionRepository';
import { Reporte } from '../../src/domain/entities/Reporte';
import { Disputa } from '../../src/domain/entities/Disputa';
import { ContratoDetalle } from '../../src/domain/entities/Contrato';
import { Servicio } from '../../src/domain/entities/Servicio';
import { DetalleUsuarioModeracion } from '../../src/domain/entities/UsuarioModeracion';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorValidacion,
} from '../../src/shared/errors/ErrorAplicacion';

const reporteBase: Reporte = {
  id: 5,
  usuarioReportaId: 2,
  usuarioReportadoId: 8,
  proyectoId: 11,
  adminId: null,
  motivo: 'Incumplimiento de entrega',
  descripcion: 'El freelancer no entregó el trabajo acordado',
  estado: 'pendiente',
  resolucion: null,
  fechaResolucion: null,
  fecha: new Date('2026-01-01T00:00:00.000Z'),
};

const contratoBase: ContratoDetalle = {
  id: 3,
  propuestaId: null,
  proyectoId: 11,
  servicioId: null,
  ofertaChatId: null,
  montoAcordado: 250,
  fechaInicio: new Date('2026-01-01T00:00:00.000Z'),
  fechaFin: null,
  estado: 'activo',
  contexto: { tipo: 'proyecto', id: 11, titulo: 'Landing page' },
  cliente: { id: 2, nombre: 'Cliente', fotoPerfil: null },
  freelancer: { id: 7, nombre: 'Freelancer', fotoPerfil: null },
};

const disputaCreada: Disputa = {
  id: 20,
  contratoId: 3,
  abiertaPorId: 1,
  motivo: 'Incumplimiento de entrega',
  descripcion: 'Contexto adicional',
  evidenciaUrl: null,
  estado: 'abierta',
  resolucion: null,
  resueltaPorId: null,
  fechaApertura: new Date('2026-01-02T00:00:00.000Z'),
  fechaResolucion: null,
};

function repoReportes(overrides: Partial<ReporteRepository> = {}) {
  return {
    crear: vi.fn(),
    listar: vi.fn(),
    contar: vi.fn(),
    obtenerPorId: vi.fn().mockResolvedValue(reporteBase),
    obtenerDetallePorId: vi.fn(),
    resolver: vi.fn(),
    ...overrides,
  } as ReporteRepository;
}

function repoContratos(overrides: Partial<ContratoRepository> = {}) {
  return {
    listar: vi.fn(),
    obtener: vi.fn(),
    crearCompraDirecta: vi.fn(),
    existeActivoPorServicio: vi.fn(),
    cambiarEstado: vi.fn(),
    listarPorPublicacion: vi.fn().mockResolvedValue([contratoBase]),
    obtenerActivoPorProyecto: vi.fn(),
    ...overrides,
  } as ContratoRepository;
}

function repoDisputas(overrides: Partial<DisputaRepository> = {}) {
  return {
    crear: vi.fn().mockResolvedValue(disputaCreada),
    listarPorContrato: vi.fn(),
    listar: vi.fn(),
    contar: vi.fn(),
    obtenerPorId: vi.fn(),
    existeAbierta: vi.fn().mockResolvedValue(false),
    resolver: vi.fn(),
    marcarEnRevision: vi.fn(),
    ...overrides,
  } as DisputaRepository;
}

function repoNotificaciones() {
  return {
    crear: vi.fn().mockResolvedValue({ id: 1 }),
    listar: vi.fn(),
    marcarLeida: vi.fn(),
    marcarTodasLeidas: vi.fn(),
  } as unknown as NotificacionRepository;
}

describe('DerivarReporteADisputaUseCase', () => {
  function casoUso(overrides: {
    reportes?: Partial<ReporteRepository>;
    contratos?: Partial<ContratoRepository>;
    disputas?: Partial<DisputaRepository>;
  } = {}) {
    return new DerivarReporteADisputaUseCase(
      repoReportes(overrides.reportes),
      repoContratos(overrides.contratos),
      repoDisputas(overrides.disputas),
      repoNotificaciones()
    );
  }

  it('deriva un reporte pendiente con contrato activo', async () => {
    const disputas = repoDisputas();
    const notificaciones = repoNotificaciones();
    const caso = new DerivarReporteADisputaUseCase(
      repoReportes(),
      repoContratos(),
      disputas,
      notificaciones
    );

    const resultado = await caso.ejecutar(5, 1, 'Contexto adicional');

    expect(resultado.disputa).toEqual(disputaCreada);
    expect(resultado.reporte.id).toBe(5);
    expect(disputas.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        contratoId: 3,
        abiertaPorId: 1,
        motivo: 'Incumplimiento de entrega',
        descripcion: 'Contexto adicional',
      })
    );
    // Notifica a cliente y freelancer del contrato.
    expect(notificaciones.crear).toHaveBeenCalledTimes(2);
  });

  it('usa la descripción del reporte cuando no llega nota', async () => {
    const disputas = repoDisputas();
    const caso = new DerivarReporteADisputaUseCase(
      repoReportes(),
      repoContratos(),
      disputas,
      repoNotificaciones()
    );

    await caso.ejecutar(5, 1);
    expect(disputas.crear).toHaveBeenCalledWith(
      expect.objectContaining({ descripcion: reporteBase.descripcion })
    );
  });

  it('devuelve 404 si el reporte no existe', async () => {
    const caso = casoUso({ reportes: { obtenerPorId: vi.fn().mockResolvedValue(null) } });
    await expect(caso.ejecutar(5, 1)).rejects.toBeInstanceOf(ErrorNoEncontrado);
  });

  it('rechaza con 409 un reporte ya gestionado', async () => {
    const caso = casoUso({
      reportes: {
        obtenerPorId: vi.fn().mockResolvedValue({ ...reporteBase, estado: 'resuelto' }),
      },
    });
    await expect(caso.ejecutar(5, 1)).rejects.toBeInstanceOf(ErrorConflicto);
  });

  it('rechaza con 422 un reporte sin proyecto', async () => {
    const caso = casoUso({
      reportes: {
        obtenerPorId: vi.fn().mockResolvedValue({ ...reporteBase, proyectoId: null }),
      },
    });
    await expect(caso.ejecutar(5, 1)).rejects.toBeInstanceOf(ErrorValidacion);
  });

  it('rechaza con 409 si no hay contrato activo', async () => {
    const caso = casoUso({ contratos: { listarPorPublicacion: vi.fn().mockResolvedValue([]) } });
    await expect(caso.ejecutar(5, 1)).rejects.toBeInstanceOf(ErrorConflicto);
  });

  it('rechaza con 409 si ya existe una disputa abierta', async () => {
    const caso = casoUso({ disputas: { existeAbierta: vi.fn().mockResolvedValue(true) } });
    await expect(caso.ejecutar(5, 1)).rejects.toBeInstanceOf(ErrorConflicto);
  });
});

describe('Moderación de usuarios', () => {
  const detalleBase: DetalleUsuarioModeracion = {
    id: 8,
    nombre: 'Usuario',
    email: 'usuario@test.com',
    rolId: 3,
    rol: 'Cliente',
    estado: 'activo',
    fotoPerfil: null,
    fechaRegistro: new Date('2026-01-01T00:00:00.000Z'),
    suspension: null,
    telefono: null,
    cedula: null,
    calificacionPromedio: null,
    totalContratos: 2,
    totalPublicaciones: 1,
    sanciones: [],
  };

  it('lista usuarios con paginación y filtros', async () => {
    const repo = {
      listar: vi.fn().mockResolvedValue({ items: [detalleBase], total: 1 }),
      obtenerDetalle: vi.fn(),
      registrarSancion: vi.fn(),
    } as unknown as UsuarioModeracionRepository;

    const resultado = await new ListarUsuariosModeracionUseCase(repo).ejecutar({
      texto: 'usuario',
      rolId: 3,
      estado: 'activo',
      page: 2,
      limit: 20,
    });

    expect(resultado).toEqual({ page: 2, limit: 20, total: 1, items: [detalleBase] });
    expect(repo.listar).toHaveBeenCalledWith({
      texto: 'usuario',
      rolId: 3,
      estado: 'activo',
      page: 2,
      limit: 20,
    });
  });

  it('devuelve la ficha de moderación o 404', async () => {
    const repo = {
      listar: vi.fn(),
      obtenerDetalle: vi.fn().mockResolvedValue(detalleBase),
      registrarSancion: vi.fn(),
    } as unknown as UsuarioModeracionRepository;

    await expect(
      new ObtenerUsuarioModeracionUseCase(repo).ejecutar(8)
    ).resolves.toEqual(detalleBase);

    (repo.obtenerDetalle as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(
      new ObtenerUsuarioModeracionUseCase(repo).ejecutar(99)
    ).rejects.toBeInstanceOf(ErrorNoEncontrado);
  });
});

describe('ModerarPublicacionUseCase', () => {
  const servicioBase: Servicio = {
    id: 9,
    titulo: 'Landing page',
    descripcion: 'Diseño y desarrollo',
    precio: 300,
    imagenUrl: null,
    estado: 'activo',
    fechaCreacion: new Date('2026-01-01T00:00:00.000Z'),
    categoria: null,
    freelancer: {
      id: 7,
      nombre: 'Freelancer',
      fotoPerfil: null,
      tituloProfesional: null,
      calificacionPromedio: 4.5,
      estado: 'activo',
    },
    moderacionRetirada: false,
    moderacionEstadoAnterior: null,
    moderacionMotivo: null,
  };

  function casoUso(overrides: {
    servicios?: Partial<ServicioRepository>;
    proyectos?: Partial<ProyectoRepository>;
    contratos?: Partial<ContratoRepository>;
    pagos?: Partial<PagoRepository>;
    moderaciones?: Partial<ModeracionPublicacionRepository>;
    notificaciones?: NotificacionRepository;
  } = {}) {
    const servicios = {
      crear: vi.fn(),
      listar: vi.fn(),
      listarPorFreelancer: vi.fn(),
      listarParaModeracion: vi.fn(),
      obtenerPorId: vi.fn().mockResolvedValue(servicioBase),
      actualizar: vi.fn(),
      cambiarEstado: vi.fn().mockResolvedValue({ ...servicioBase, estado: 'eliminado' }),
      actualizarModeracion: vi.fn(),
      categoriaExiste: vi.fn(),
      ...overrides.servicios,
    } as ServicioRepository;

    const proyectos = {
      obtenerPorId: vi.fn(),
      listar: vi.fn(),
      cambiarEstado: vi.fn(),
      actualizarModeracion: vi.fn(),
      ...overrides.proyectos,
    } as ProyectoRepository;

    const contratos = repoContratos(overrides.contratos);
    const pagos = {
      listarPorCliente: vi.fn(),
      listarPorFreelancer: vi.fn(),
      obtenerFactura: vi.fn(),
      obtenerFacturaFreelancer: vi.fn(),
      obtenerPorContrato: vi.fn().mockResolvedValue(null),
      guardarPreferencia: vi.fn(),
      confirmar: vi.fn(),
      liberar: vi.fn(),
      reembolsar: vi.fn(),
      ...overrides.pagos,
    } as PagoRepository;

    const moderaciones = {
      listarPorPublicacion: vi.fn().mockResolvedValue([]),
      listarUltimas: vi.fn().mockResolvedValue([]),
      crear: vi.fn().mockResolvedValue({}),
      ...overrides.moderaciones,
    } as ModeracionPublicacionRepository;

    return new ModerarPublicacionUseCase(
      servicios,
      proyectos,
      contratos,
      pagos,
      moderaciones,
      overrides.notificaciones ?? repoNotificaciones()
    );
  }

  it('retira un servicio, cancela contratos y reembolsa pagos retenidos', async () => {
    const pagosRepo = {
      listarPorCliente: vi.fn(),
      listarPorFreelancer: vi.fn(),
      obtenerFactura: vi.fn(),
      obtenerFacturaFreelancer: vi.fn(),
      obtenerPorContrato: vi.fn().mockResolvedValue({
        id: 1,
        contratoId: 3,
        monto: 300,
        estado: 'retenido',
        metodoPago: null,
        referenciaPasarela: null,
        preferenciaId: null,
        fechaPago: new Date(),
      }),
      guardarPreferencia: vi.fn(),
      confirmar: vi.fn(),
      liberar: vi.fn(),
      reembolsar: vi.fn(),
    };
    const caso = casoUso({
      pagos: pagosRepo,
      servicios: {
        obtenerPorId: vi
          .fn()
          .mockResolvedValueOnce(servicioBase)
          .mockResolvedValue({ ...servicioBase, estado: 'eliminado' }),
      },
      contratos: {
        listarPorPublicacion: vi.fn().mockResolvedValue([
          { ...contratoBase, servicioId: 9, proyectoId: null },
        ]),
      },
    });

    const resultado = await caso.retirar(9, 'servicio', 'Contenido inapropiado', 1);

    expect(resultado.mensaje).toContain('retirado');
    expect(pagosRepo.reembolsar).toHaveBeenCalledWith(3);
    expect(resultado.publicacion.estado).toBe('eliminado');
  });

  it('no permite retirar un servicio ya eliminado', async () => {
    const caso = casoUso({
      servicios: {
        obtenerPorId: vi.fn().mockResolvedValue({ ...servicioBase, estado: 'eliminado' }),
      },
    });
    await expect(caso.retirar(9, 'servicio', 'Motivo válido', 1)).rejects.toBeInstanceOf(
      ErrorConflicto
    );
  });

  it('no permite reactivar un servicio que no está retirado', async () => {
    const caso = casoUso();
    await expect(caso.reactivar(9, 'servicio', 1)).rejects.toBeInstanceOf(ErrorConflicto);
  });

  it('reactiva un servicio retirado restaurando su estado anterior', async () => {
    const servicios = {
      obtenerPorId: vi.fn().mockResolvedValue({
        ...servicioBase,
        estado: 'eliminado',
        moderacionRetirada: true,
        moderacionEstadoAnterior: 'pausado',
      }),
      cambiarEstado: vi.fn(),
      actualizarModeracion: vi.fn(),
    };
    const caso = casoUso({ servicios });

    const resultado = await caso.reactivar(9, 'servicio', 1);

    expect(servicios.cambiarEstado).toHaveBeenCalledWith(9, 'pausado');
    expect(resultado.mensaje).toContain('reactivado');
  });
});
