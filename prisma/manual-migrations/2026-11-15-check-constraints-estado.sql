-- Corrige los CHECK de estado que quedaron desactualizados respecto al dominio.
-- Sin esto, crear un contrato (pendiente_pago), confirmar un pago (retenido/liberado)
-- o rechazar un reporte falla con violación de constraint (HTTP 500).

ALTER TABLE "Contrato" DROP CONSTRAINT IF EXISTS "Contrato_estado_check";
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_estado_check"
  CHECK (estado IN ('pendiente_pago', 'activo', 'completado', 'cancelado'));

ALTER TABLE "Pago" DROP CONSTRAINT IF EXISTS "Pago_estado_check";
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_estado_check"
  CHECK (estado IN ('pendiente', 'retenido', 'liberado', 'reembolsado'));

ALTER TABLE "Reporte" DROP CONSTRAINT IF EXISTS "Reporte_estado_check";
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_estado_check"
  CHECK (estado IN ('pendiente', 'resuelto', 'rechazado'));

-- El código marca la factura como 'pagada' al confirmar el pago.
ALTER TABLE "Factura" DROP CONSTRAINT IF EXISTS "Factura_estado_check";
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_estado_check"
  CHECK (estado IN ('pendiente', 'pagada'));
