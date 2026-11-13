import { ContratoDetalle, ContratoVista } from './Contrato';

export interface ResumenDashboardCliente {
  contratosActivos: number;
  contratosCompletados: number;
  contratosCancelados: number;
  entregasPendientes: number;
  disputasAbiertas: number;
  pagosPendientes: number;
  totalPagado: number;
  notificacionesSinLeer: number;
}

/** Datos crudos que entrega el adaptador de persistencia. */
export interface DashboardClienteDatos extends ResumenDashboardCliente {
  contratosRecientes: ContratoDetalle[];
}

/** Respuesta del panel del cliente con los contratos vistos por ese cliente. */
export interface DashboardCliente extends ResumenDashboardCliente {
  contratosRecientes: ContratoVista[];
}
