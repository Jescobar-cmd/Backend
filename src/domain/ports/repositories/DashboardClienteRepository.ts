import { DashboardClienteDatos } from '../../entities/DashboardCliente';

export interface DashboardClienteRepository {
  obtener(clienteId: number): Promise<DashboardClienteDatos>;
}
