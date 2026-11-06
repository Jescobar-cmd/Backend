import { describe, expect, it, vi } from 'vitest';
import { ActualizarMiPerfilFreelancerUseCase } from '../../src/application/use-cases/ActualizarMiPerfilFreelancerUseCase';
import { Habilidad } from '../../src/domain/entities/Habilidad';
import { PerfilFreelancer } from '../../src/domain/entities/Perfil';
import { HabilidadRepository } from '../../src/domain/ports/repositories/HabilidadRepository';
import { PerfilRepository } from '../../src/domain/ports/repositories/PerfilRepository';

const habilidades: Habilidad[] = [
  { id: 1, nombre: 'React', categoriaId: null, categoria: null },
  { id: 2, nombre: 'SQL', categoriaId: null, categoria: null },
];

const perfil: PerfilFreelancer = {
  id: 7,
  nombre: 'Ana',
  email: 'ana@example.com',
  telefono: null,
  fotoPerfil: null,
  rolId: 2,
  rolNombre: 'freelancer',
  estado: 'activo',
  fechaRegistro: new Date(),
  freelancer: {
    tituloProfesional: 'Dev',
    biografia: null,
    calificacionPromedio: 0,
    habilidades: [],
    portafolio: [],
    servicios: [],
    calificaciones: [],
  },
};

function crearPerfilRepo(): PerfilRepository {
  return {
    obtenerPerfilCliente: vi.fn(),
    actualizarPerfilCliente: vi.fn(),
    obtenerPerfilFreelancer: vi.fn(),
    actualizarPerfilFreelancer: vi.fn().mockResolvedValue(perfil),
    obtenerPerfilPublico: vi.fn(),
  };
}

function crearHabilidadRepo(): HabilidadRepository {
  return {
    listar: vi.fn(),
    buscarPorIds: vi.fn().mockResolvedValue(habilidades),
  };
}

describe('ActualizarMiPerfilFreelancerUseCase', () => {
  it('acepta habilidades con nivel y las envía al repositorio', async () => {
    const perfilRepo = crearPerfilRepo();
    const habilidadRepo = crearHabilidadRepo();
    const caso = new ActualizarMiPerfilFreelancerUseCase(perfilRepo, habilidadRepo);

    await caso.ejecutar(7, {
      habilidades: [
        { id: 1, nivel: 'avanzado' },
        { id: 2, nivel: 'intermedio' },
      ],
    });

    expect(perfilRepo.actualizarPerfilFreelancer).toHaveBeenCalledWith(7, {
      habilidades: [
        { id: 1, nivel: 'avanzado' },
        { id: 2, nivel: 'intermedio' },
      ],
    });
  });

  it('devuelve 422 si una habilidad no existe', async () => {
    const perfilRepo = crearPerfilRepo();
    const habilidadRepo = crearHabilidadRepo();
    vi.mocked(habilidadRepo.buscarPorIds).mockResolvedValueOnce([habilidades[0]]);
    const caso = new ActualizarMiPerfilFreelancerUseCase(perfilRepo, habilidadRepo);

    await expect(
      caso.ejecutar(7, { habilidades: [{ id: 1, nivel: 'basico' }, { id: 2, nivel: null }] })
    ).rejects.toMatchObject({ codigoEstado: 422 });
  });

  it('devuelve 422 si se repite una habilidad', async () => {
    const caso = new ActualizarMiPerfilFreelancerUseCase(
      crearPerfilRepo(),
      crearHabilidadRepo()
    );

    await expect(
      caso.ejecutar(7, {
        habilidades: [
          { id: 1, nivel: 'basico' },
          { id: 1, nivel: 'avanzado' },
        ],
      })
    ).rejects.toMatchObject({ codigoEstado: 422 });
  });
});
