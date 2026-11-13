import { aContratoVista } from '../../domain/entities/Contrato';
import { DashboardCliente } from '../../domain/entities/DashboardCliente';
import { DashboardClienteRepository } from '../../domain/ports/repositories/DashboardClienteRepository';

/** Caso de uso: obtener el resumen del panel del cliente. */
export class ObtenerDashboardClienteUseCase {
  constructor(private dashboardRepository: DashboardClienteRepository) {}

  async ejecutar(clienteId: number): Promise<DashboardCliente> {
    const datos = await this.dashboardRepository.obtener(clienteId);
    return {
      ...datos,
      contratosRecientes: datos.contratosRecientes.map((contrato) =>
        aContratoVista(contrato, clienteId)
      ),
    };
  }
}
