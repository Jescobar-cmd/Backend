import {
  DatosPagoPasarela,
  DatosPreferencia,
  PasarelaPago,
  PreferenciaPago,
} from '../../domain/ports/services/PasarelaPago';

/**
 * Pasarela simulada para desarrollo y pruebas.
 * Permite recorrer el flujo escrow sin credenciales de Mercado Pago.
 * Nunca debe usarse en producción: el caso de uso lo bloquea.
 */
export class PasarelaPagoSimulada implements PasarelaPago {
  readonly esSimulada = true;

  constructor(private readonly frontendUrl: string) {}

  async crearPreferencia(datos: DatosPreferencia): Promise<PreferenciaPago> {
    const id = `sim-${datos.contratoId}-${Date.now()}`;
    return {
      id,
      initPoint: `${this.frontendUrl}/pago/simulado?contrato=${datos.contratoId}&preferencia=${encodeURIComponent(id)}`,
    };
  }

  async consultarPago(idPago: string): Promise<DatosPagoPasarela> {
    const partes = idPago.split('-');
    return {
      id: idPago,
      estado: 'approved',
      monto: 0,
      referenciaExterna: partes[1] ?? null,
    };
  }

  async reembolsar(): Promise<void> {
    // El dinero simulado no existe: no hay nada que devolver en la pasarela.
  }
}
