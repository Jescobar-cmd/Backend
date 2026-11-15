-- Comprobantes académicos para el entorno sandbox. No representan documentos DIAN.
ALTER TABLE "Factura"
  ADD COLUMN IF NOT EXISTS "uuidDemo" VARCHAR(36),
  ADD COLUMN IF NOT EXISTS "ambiente" VARCHAR(20) NOT NULL DEFAULT 'sandbox',
  ADD COLUMN IF NOT EXISTS "moneda" VARCHAR(3) NOT NULL DEFAULT 'COP',
  ADD COLUMN IF NOT EXISTS "subtotal" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "comisionCliente" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "total" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "descripcion" TEXT,
  ADD COLUMN IF NOT EXISTS "compradorNombre" VARCHAR(150),
  ADD COLUMN IF NOT EXISTS "compradorDocumento" VARCHAR(50);

CREATE UNIQUE INDEX IF NOT EXISTS "Factura_uuidDemo_key" ON "Factura"("uuidDemo");
