export interface FacturaCliente {
  id: number;
  numeroFactura: string | null;
  cufe: string | null;
  fechaEmision: Date | null;
  estado: string;
  urlPdf: string | null;
}

export interface PagoCliente {
  id: number;
  contratoId: number;
  monto: number;
  metodoPago: string | null;
  estado: string;
  referenciaPasarela: string | null;
  fechaPago: Date;
  contrato: {
    id: number;
    titulo: string;
    estado: string;
  };
  factura: FacturaCliente | null;
}

export interface PagoFreelancer extends PagoCliente {
  cliente: {
    id: number;
    nombre: string;
    fotoPerfil: string | null;
  };
}
