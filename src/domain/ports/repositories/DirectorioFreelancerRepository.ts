import {
  DirectorioFreelancerPaginado,
  FiltrosDirectorioFreelancer,
} from '../../entities/DirectorioFreelancer';

/** Puerto de búsqueda pública de freelancers. */
export interface DirectorioFreelancerRepository {
  buscar(filtros: FiltrosDirectorioFreelancer): Promise<DirectorioFreelancerPaginado>;
}
