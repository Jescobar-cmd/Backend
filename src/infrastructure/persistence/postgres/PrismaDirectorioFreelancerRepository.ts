import { Prisma, PrismaClient } from '@prisma/client';
import {
  DirectorioFreelancerPaginado,
  FiltrosDirectorioFreelancer,
  FreelancerDirectorioItem,
} from '../../../domain/entities/DirectorioFreelancer';
import { HabilidadAsignada } from '../../../domain/entities/Habilidad';
import { DirectorioFreelancerRepository } from '../../../domain/ports/repositories/DirectorioFreelancerRepository';
import { ROLES } from '../../../shared/constants/roles';

const directorioInclude = {
  Freelancer: {
    include: {
      FreelancerHabilidad: { include: { Habilidad: true } },
    },
  },
} satisfies Prisma.UsuarioInclude;

type UsuarioDirectorio = Prisma.UsuarioGetPayload<{ include: typeof directorioInclude }>;

function aHabilidades(usuario: UsuarioDirectorio): HabilidadAsignada[] {
  return (usuario.Freelancer?.FreelancerHabilidad ?? [])
    .map((asignada) => ({
      id: asignada.Habilidad.id,
      nombre: asignada.Habilidad.nombre,
      nivel: asignada.nivel,
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

function aItem(usuario: UsuarioDirectorio): FreelancerDirectorioItem {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    fotoPerfil: usuario.fotoPerfil,
    tituloProfesional: usuario.Freelancer?.tituloProfesional ?? null,
    biografia: usuario.Freelancer?.biografia ?? null,
    calificacionPromedio: usuario.Freelancer
      ? Number(usuario.Freelancer.calificacionPromedio)
      : 0,
    habilidades: aHabilidades(usuario),
  };
}

/** Adaptador Prisma del directorio público de freelancers. */
export class PrismaDirectorioFreelancerRepository implements DirectorioFreelancerRepository {
  constructor(private db: PrismaClient) {}

  async buscar(filtros: FiltrosDirectorioFreelancer): Promise<DirectorioFreelancerPaginado> {
    const where: Prisma.UsuarioWhereInput = {
      rolId: ROLES.FREELANCER,
      estado: 'activo',
    };

    if (filtros.texto) {
      where.OR = [
        { nombre: { contains: filtros.texto, mode: 'insensitive' } },
        {
          Freelancer: {
            is: {
              tituloProfesional: { contains: filtros.texto, mode: 'insensitive' },
            },
          },
        },
        {
          Freelancer: {
            is: {
              biografia: { contains: filtros.texto, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    const filtroFreelancer: Prisma.FreelancerWhereInput = {};
    if (filtros.habilidadId !== undefined) {
      filtroFreelancer.FreelancerHabilidad = {
        some: { habilidadId: filtros.habilidadId },
      };
    }
    if (filtros.categoriaId !== undefined) {
      filtroFreelancer.Servicio = {
        some: { categoriaId: filtros.categoriaId, estado: 'activo' },
      };
    }
    if (Object.keys(filtroFreelancer).length > 0) {
      where.Freelancer = { is: filtroFreelancer };
    }

    const [total, usuarios] = await this.db.$transaction([
      this.db.usuario.count({ where }),
      this.db.usuario.findMany({
        where,
        include: directorioInclude,
        orderBy: [{ fechaRegistro: 'desc' }, { id: 'desc' }],
        skip: (filtros.page - 1) * filtros.limit,
        take: filtros.limit,
      }),
    ]);

    return {
      page: filtros.page,
      limit: filtros.limit,
      total,
      items: usuarios.map(aItem),
    };
  }
}
