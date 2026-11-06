import { describe, expect, it, vi } from 'vitest';
import { RetirarPropuestaUseCase } from '../../src/application/use-cases/RetirarPropuestaUseCase';
import { PropuestaDetalle, PropuestaResumen } from '../../src/domain/entities/Propuesta';
import { PropuestaRepository } from '../../src/domain/ports/repositories/PropuestaRepository';

const propuestaPendiente: PropuestaDetalle = {
  id: 10,
  proyectoId: 3,
  freelancerId: 7,
  clienteId: 2,
  estado: 'pendiente',
  montoPropuesto: 100,
  proyectoEstado: 'abierto',
};

const propuestaRetirada: PropuestaResumen = {
  id: 10,
  mensaje: 'Hola',
  montoPropuesto: 100,
  estado: 'retirada',
  fechaEnvio: new Date(),
  freelancer: { id: 7, nombre: 'Ana', fotoPerfil: null, calificacionPromedio: 4.5 },
};

function crearRepo(detalle: PropuestaDetalle | null): PropuestaRepository {
  return {
    crear: vi.fn(),
    listarPorFreelancer: vi.fn(),
    obtenerDetalle: vi.fn().mockResolvedValue(detalle),
    aceptar: vi.fn(),
    rechazar: vi.fn(),
    retirar: vi.fn().mockResolvedValue(propuestaRetirada),
  };
}

describe('RetirarPropuestaUseCase', () => {
  it('retira una propuesta pendiente del mismo freelancer', async () => {
    const repo = crearRepo(propuestaPendiente);
    const caso = new RetirarPropuestaUseCase(repo);

    const resultado = await caso.ejecutar(7, 10);

    expect(repo.retirar).toHaveBeenCalledWith(10);
    expect(resultado.estado).toBe('retirada');
  });

  it('devuelve 404 si la propuesta no existe', async () => {
    const caso = new RetirarPropuestaUseCase(crearRepo(null));

    await expect(caso.ejecutar(7, 10)).rejects.toMatchObject({ codigoEstado: 404 });
  });

  it('devuelve 403 si la propuesta es de otro freelancer', async () => {
    const caso = new RetirarPropuestaUseCase(crearRepo(propuestaPendiente));

    await expect(caso.ejecutar(99, 10)).rejects.toMatchObject({ codigoEstado: 403 });
  });

  it('devuelve 409 si ya no está pendiente', async () => {
    const caso = new RetirarPropuestaUseCase(
      crearRepo({ ...propuestaPendiente, estado: 'aceptada' })
    );

    await expect(caso.ejecutar(7, 10)).rejects.toMatchObject({ codigoEstado: 409 });
  });
});
