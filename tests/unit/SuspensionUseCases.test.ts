import { describe, expect, it, vi } from 'vitest';
import { SuspenderUsuarioUseCase } from '../../src/application/use-cases/SuspenderUsuarioUseCase';
import { ReactivarUsuarioUseCase } from '../../src/application/use-cases/ReactivarUsuarioUseCase';
import { RepositorioUsuario } from '../../src/domain/ports/repositories/RepositorioUsuario';
import { NotificacionRepository } from '../../src/domain/ports/repositories/NotificacionRepository';
import { Usuario, PropsUsuario } from '../../src/domain/entities/Usuario';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../src/shared/errors/ErrorAplicacion';

const ROL_CLIENTE = 3;
const ROL_ADMIN = 1;

function usuario(overrides: Partial<PropsUsuario> = {}) {
  return new Usuario({
    id: 8,
    nombre: 'Cuenta',
    email: 'cuenta@test.com',
    rolId: ROL_CLIENTE,
    estado: 'activo',
    ...overrides,
  });
}

function repoUsuario(sobreescribir: Partial<RepositorioUsuario> = {}) {
  return {
    guardar: vi.fn(),
    buscarPorId: vi.fn().mockResolvedValue(usuario()),
    buscarPorEmail: vi.fn(),
    buscarPorCedula: vi.fn(),
    buscarPorGoogleId: vi.fn(),
    listarIdsPorRoles: vi.fn(),
    actualizar: vi.fn().mockImplementation(async (u: Usuario) => u),
    ...sobreescribir,
  } as RepositorioUsuario;
}

function repoNotificaciones() {
  return { crear: vi.fn() } as unknown as NotificacionRepository;
}

describe('SuspenderUsuarioUseCase', () => {
  it('suspende la cuenta y deja la notificación al usuario', async () => {
    const usuarios = repoUsuario();
    const notificaciones = repoNotificaciones();

    const resultado = await new SuspenderUsuarioUseCase(
      usuarios,
      notificaciones
    ).ejecutar(8, 1, 'Incumplimiento de las normas');

    expect(resultado.estado).toBe('suspendido');
    expect(usuarios.actualizar).toHaveBeenCalled();
    expect(notificaciones.crear).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: 8, tipo: 'cuenta_suspendida' })
    );
  });

  it('no permite suspender la propia cuenta', async () => {
    await expect(
      new SuspenderUsuarioUseCase(repoUsuario(), repoNotificaciones()).ejecutar(
        1,
        1,
        'Motivo'
      )
    ).rejects.toBeInstanceOf(ErrorProhibido);
  });

  it('no permite suspender administradores ni moderadores', async () => {
    const usuarios = repoUsuario({
      buscarPorId: vi.fn().mockResolvedValue(usuario({ rolId: ROL_ADMIN })),
    });

    await expect(
      new SuspenderUsuarioUseCase(usuarios, repoNotificaciones()).ejecutar(
        8,
        1,
        'Motivo'
      )
    ).rejects.toBeInstanceOf(ErrorProhibido);
  });

  it('rechaza suspender una cuenta que ya está suspendida', async () => {
    const usuarios = repoUsuario({
      buscarPorId: vi
        .fn()
        .mockResolvedValue(usuario({ estado: 'suspendido' })),
    });

    await expect(
      new SuspenderUsuarioUseCase(usuarios, repoNotificaciones()).ejecutar(
        8,
        1,
        'Motivo'
      )
    ).rejects.toBeInstanceOf(ErrorConflicto);
  });

  it('devuelve 404 si el usuario no existe', async () => {
    const usuarios = repoUsuario({
      buscarPorId: vi.fn().mockResolvedValue(null),
    });

    await expect(
      new SuspenderUsuarioUseCase(usuarios, repoNotificaciones()).ejecutar(
        8,
        1,
        'Motivo'
      )
    ).rejects.toBeInstanceOf(ErrorNoEncontrado);
  });
});

describe('ReactivarUsuarioUseCase', () => {
  it('reactiva una cuenta suspendida y notifica', async () => {
    const usuarios = repoUsuario({
      buscarPorId: vi
        .fn()
        .mockResolvedValue(usuario({ estado: 'suspendido' })),
    });
    const notificaciones = repoNotificaciones();

    const resultado = await new ReactivarUsuarioUseCase(
      usuarios,
      notificaciones
    ).ejecutar(8);

    expect(resultado.estado).toBe('activo');
    expect(notificaciones.crear).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: 8, tipo: 'cuenta_reactivada' })
    );
  });

  it('rechaza reactivar una cuenta que no está suspendida', async () => {
    await expect(
      new ReactivarUsuarioUseCase(repoUsuario(), repoNotificaciones()).ejecutar(8)
    ).rejects.toBeInstanceOf(ErrorConflicto);
  });
});
