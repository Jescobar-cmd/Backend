import { Prisma, PrismaClient } from '@prisma/client';
import {
  FacturaCliente,
  PagoCliente,
  PagoEscrow,
  PagoFreelancer,
} from '../../../domain/entities/Pago';
import { PagoRepository } from '../../../domain/ports/repositories/PagoRepository';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
} from '../../../shared/errors/ErrorAplicacion';

const pagoInclude = {
  Factura: true,
  Contrato: {
    select: {
      id: true,
      estado: true,
      montoAcordado: true,
      Cliente: { include: { Usuario: true } },
      Proyecto: { select: { titulo: true } },
      Servicio: { select: { titulo: true } },
    },
  },
} satisfies Prisma.PagoInclude;

type PagoConRelaciones = Prisma.PagoGetPayload<{ include: typeof pagoInclude }>;

function redondearDos(valor: number): number {
  return Math.round(valor * 100) / 100;
}

function toPagoEscrow(pago: {
  id: number;
  contratoId: number;
  monto: { toString(): string } | number;
  estado: string;
  metodoPago: string | null;
  referenciaPasarela: string | null;
  preferenciaId: string | null;
  fechaPago: Date;
}): PagoEscrow {
  return {
    id: pago.id,
    contratoId: pago.contratoId,
    monto: Number(pago.monto),
    estado: pago.estado as PagoEscrow['estado'],
    metodoPago: pago.metodoPago,
    referenciaPasarela: pago.referenciaPasarela,
    preferenciaId: pago.preferenciaId,
    fechaPago: pago.fechaPago,
  };
}

function toPagoCliente(pago: PagoConRelaciones): PagoCliente {
  const titulo =
    pago.Contrato.Proyecto?.titulo ?? pago.Contrato.Servicio?.titulo ?? 'Contrato';
  const monto = Number(pago.monto);
  const montoBase = Number(pago.Contrato.montoAcordado);

  return {
    id: pago.id,
    contratoId: pago.contratoId,
    monto,
    montoBase,
    comisionCliente: redondearDos(monto - montoBase),
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

function toPagoFreelancer(pago: PagoConRelaciones): PagoFreelancer {
  return {
    ...toPagoCliente(pago),
    cliente: {
      id: pago.Contrato.Cliente.id,
      nombre: pago.Contrato.Cliente.Usuario.nombre,
      fotoPerfil: pago.Contrato.Cliente.Usuario.fotoPerfil,
    },
  };
}

function toFactura(factura: {
  id: number;
  numeroFactura: string | null;
  cufe: string | null;
  fechaEmision: Date | null;
  estado: string;
  urlPdf: string | null;
}): FacturaCliente {
  return {
    id: factura.id,
    numeroFactura: factura.numeroFactura,
    cufe: factura.cufe,
    fechaEmision: factura.fechaEmision,
    estado: factura.estado,
    urlPdf: factura.urlPdf,
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

  async listarPorFreelancer(freelancerId: number): Promise<PagoFreelancer[]> {
    const pagos = await this.db.pago.findMany({
      where: { Contrato: { freelancerId } },
      include: pagoInclude,
      orderBy: { fechaPago: 'desc' },
    });
    return pagos.map(toPagoFreelancer);
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
    return factura ? toFactura(factura) : null;
  }

  async obtenerFacturaFreelancer(
    pagoId: number,
    freelancerId: number
  ): Promise<FacturaCliente | null> {
    const factura = await this.db.factura.findFirst({
      where: {
        pagoId,
        Pago: { Contrato: { freelancerId } },
      },
    });
    return factura ? toFactura(factura) : null;
  }

  async obtenerPorContrato(contratoId: number): Promise<PagoEscrow | null> {
    const pago = await this.db.pago.findFirst({
      where: { contratoId },
      orderBy: { id: 'desc' },
    });
    return pago ? toPagoEscrow(pago) : null;
  }

  async guardarPreferencia(
    contratoId: number,
    preferenciaId: string
  ): Promise<void> {
    await this.db.pago.updateMany({
      where: { contratoId, estado: 'pendiente' },
      data: { preferenciaId },
    });
  }

  async confirmar(
    contratoId: number,
    referenciaPasarela: string,
    metodoPago: string
  ): Promise<PagoEscrow> {
    const pago = await this.db.$transaction(async (tx) => {
      const actual = await tx.pago.findFirst({
        where: { contratoId },
        orderBy: { id: 'desc' },
      });
      if (!actual) {
        throw new ErrorNoEncontrado('Pago del contrato no encontrado');
      }

      // Idempotencia: si ya se confirmó, no se vuelve a mover el dinero.
      if (actual.estado !== 'pendiente') {
        return actual;
      }

      const contrato = await tx.contrato.findUnique({
        where: { id: contratoId },
        select: { estado: true },
      });
      if (!contrato) {
        throw new ErrorNoEncontrado('Contrato del pago no encontrado');
      }
      if (contrato.estado !== 'pendiente_pago') {
        throw new ErrorConflicto(
          'El contrato ya no está pendiente de pago; no se puede confirmar'
        );
      }

      const actualizado = await tx.pago.update({
        where: { id: actual.id },
        data: {
          estado: 'retenido',
          referenciaPasarela,
          metodoPago,
          fechaPago: new Date(),
        },
      });

      await tx.contrato.update({
        where: { id: contratoId },
        data: { estado: 'activo', fechaInicio: new Date() },
      });

      await tx.factura.updateMany({
        where: { pagoId: actual.id },
        data: {
          estado: 'pagada',
          fechaEmision: new Date(),
          numeroFactura: `FG-${contratoId}-${Date.now()}`,
        },
      });

      return actualizado;
    });

    return toPagoEscrow(pago);
  }

  async liberar(contratoId: number): Promise<PagoEscrow> {
    return this.cambiarEstadoEscrow(contratoId, 'retenido', 'liberado');
  }

  async reembolsar(contratoId: number): Promise<PagoEscrow> {
    return this.cambiarEstadoEscrow(contratoId, 'retenido', 'reembolsado');
  }

  private async cambiarEstadoEscrow(
    contratoId: number,
    estadoEsperado: PagoEscrow['estado'],
    estadoNuevo: PagoEscrow['estado']
  ): Promise<PagoEscrow> {
    const actual = await this.db.pago.findFirst({
      where: { contratoId },
      orderBy: { id: 'desc' },
    });
    if (!actual) {
      throw new ErrorNoEncontrado('Pago del contrato no encontrado');
    }
    if (actual.estado === estadoNuevo) {
      return toPagoEscrow(actual);
    }
    if (actual.estado !== estadoEsperado) {
      throw new ErrorConflicto(
        `El pago no está ${estadoEsperado === 'retenido' ? 'retenido' : 'disponible'} (estado actual: ${actual.estado})`
      );
    }

    const actualizado = await this.db.pago.update({
      where: { id: actual.id },
      data: { estado: estadoNuevo },
    });
    return toPagoEscrow(actualizado);
  }
}
