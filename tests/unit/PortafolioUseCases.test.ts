import { describe, expect, it, vi } from 'vitest';
import { CrearPortafolioItemUseCase } from '../../src/application/use-cases/CrearPortafolioItemUseCase';
import { ActualizarPortafolioItemUseCase } from '../../src/application/use-cases/ActualizarPortafolioItemUseCase';
import { EliminarPortafolioItemUseCase } from '../../src/application/use-cases/EliminarPortafolioItemUseCase';
import { PortafolioItem } from '../../src/domain/entities/PortafolioItem';
import { PortafolioRepository } from '../../src/domain/ports/repositories/PortafolioRepository';

const item: PortafolioItem = {
  id: 1,
  freelancerId: 7,
  titulo: 'Landing page',
  descripcion: null,
  imagenUrl: null,
  enlaceUrl: null,
  fechaCreacion: new Date(),
};

function crearRepo(): PortafolioRepository {
  return {
    listarPorFreelancer: vi.fn(),
    obtenerPorId: vi.fn().mockResolvedValue(item),
    crear: vi.fn().mockResolvedValue(item),
    actualizar: vi.fn().mockResolvedValue(item),
    eliminar: vi.fn().mockResolvedValue(undefined),
  };
}

describe('Casos de uso del portafolio', () => {
  it('crea un ítem para el freelancer autenticado', async () => {
    const repo = crearRepo();
    const caso = new CrearPortafolioItemUseCase(repo);

    await caso.ejecutar(7, { titulo: 'Landing page' });

    expect(repo.crear).toHaveBeenCalledWith(7, { titulo: 'Landing page' });
  });

  it('impide editar un ítem de otro freelancer', async () => {
    const caso = new ActualizarPortafolioItemUseCase(crearRepo());

    await expect(caso.ejecutar(99, 1, { titulo: 'Nuevo' })).rejects.toMatchObject({
      codigoEstado: 403,
    });
  });

  it('impide eliminar un ítem de otro freelancer', async () => {
    const caso = new EliminarPortafolioItemUseCase(crearRepo());

    await expect(caso.ejecutar(99, 1)).rejects.toMatchObject({ codigoEstado: 403 });
  });
});
