import { Prisma, PrismaClient } from '@prisma/client';
import { FacturaCliente, PagoCliente } from '../../../domain/entities/Pago';
import { PagoRepository } from '../../../domain/ports/repositories/PagoRepository';

const pagoInclude = {
  Factura: true,
  Contrato: {
    select: {
      id: true,
      estado: true,
      Proyecto: { select: { titulo: true } },
      Servicio: { select: { titulo: true } },
    },
  },
} satisfies Prisma.PagoInclude;

type PagoConRelaciones = Prisma.PagoGetPayload<{ include: typeof pagoInclude }>;

function toPagoCliente(pago: PagoConRelaciones): PagoCliente {
  const titulo =
    pago.Contrato.Proyecto?.titulo ?? pago.Contrato.Servicio?.titulo ?? 'Contrato';

  return {
    id: pago.id,
    contratoId: pago.contratoId,
    monto: Number(pago.monto),
    metodoPago: pago.metodoPago,
    estado: pago.estado,
    referenciaPasarela: pago.referenciaPasarela,
    fechaPago: pago.fechaPago,
    contrato: {
      id: pago.Contrato.id,
      titulo,
      estado: pago.Contrato.estado,
    },
    factura: pago.Factura
      ? {
          id: pago.Factura.id,
          numeroFactura: pago.Factura.numeroFactura,
          cufe: pago.Factura.cufe,
          fechaEmision: pago.Factura.fechaEmision,
          estado: pago.Factura.estado,
          urlPdf: pago.Factura.urlPdf,
        }
      : null,
  };
}

/** Adaptador Prisma del puerto PagoRepository. */
export class PrismaPagoRepository implements PagoRepository {
  constructor(private db: PrismaClient) {}

  async listarPorCliente(clienteId: number): Promise<PagoCliente[]> {
    const pagos = await this.db.pago.findMany({
      where: { Contrato: { clienteId } },
      include: pagoInclude,
      orderBy: { fechaPago: 'desc' },
    });
    return pagos.map(toPagoCliente);
  }

  async obtenerFactura(
    pagoId: number,
    clienteId: number
  ): Promise<FacturaCliente | null> {
    const factura = await this.db.factura.findFirst({
      where: {
        pagoId,
        Pago: { Contrato: { clienteId } },
      },
    });
    if (!factura) {
      return null;
    }
    return {
      id: factura.id,
      numeroFactura: factura.numeroFactura,
      cufe: factura.cufe,
      fechaEmision: factura.fechaEmision,
      estado: factura.estado,
      urlPdf: factura.urlPdf,
    };
  }
}
