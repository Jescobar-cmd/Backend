export interface DatosPreferencia {
  contratoId: number;
  monto: number;
  descripcion: string;
  emailCliente: string;
  urlRetorno: string;
  urlNotificacion: string;
}

export interface PreferenciaPago {
  id: string;
  initPoint: string;
}

export interface DatosPagoPasarela {
  id: string;
  /** approved | pending | rejected | cancelled | refunded ... */
  estado: string;
  monto: number;
  referenciaExterna: string | null;
}

/** Puerto de la pasarela de pagos (Mercado Pago en producción). */
export interface PasarelaPago {
  /** true cuando se usa el adaptador simulado de desarrollo/pruebas. */
  readonly esSimulada: boolean;

  crearPreferencia(datos: DatosPreferencia): Promise<PreferenciaPago>;

  consultarPago(idPago: string): Promise<DatosPagoPasarela>;

  reembolsar(idPago: string): Promise<void>;
}
