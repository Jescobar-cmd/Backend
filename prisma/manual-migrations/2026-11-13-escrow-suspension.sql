-- Migración manual: flujo escrow (Mercado Pago) y suspensión de cuentas.
-- El proyecto aún no usa prisma/migrations; este script es idempotente y debe
-- ejecutarse en la base de datos (Neon) antes de desplegar el backend.
--
--   psql "$DATABASE_URL" -f prisma/manual-migrations/2026-11-13-escrow-suspension.sql
--
-- Luego: npx prisma generate

-- 1. Preferencia de Mercado Pago asociada al pago del contrato.
ALTER TABLE "Pago" ADD COLUMN IF NOT EXISTS "preferenciaId" VARCHAR(100);
CREATE UNIQUE INDEX IF NOT EXISTS "Pago_preferenciaId_key" ON "Pago"("preferenciaId");
CREATE INDEX IF NOT EXISTS "Pago_estado_idx" ON "Pago"("estado");

-- 2. Comentario visible del estado del dinero (pending -> retenido -> liberado | reembolsado).
COMMENT ON COLUMN "Pago"."estado" IS 'pendiente -> retenido (escrow) -> liberado | reembolsado';

-- 3. Motivo cuando el moderador rechaza un retiro (el saldo vuelve a pendiente).
ALTER TABLE "Liquidacion" ADD COLUMN IF NOT EXISTS "motivoRechazo" VARCHAR(255);

-- 4. Los contratos nuevos nacen pendientes de pago; se activan al confirmar el pago.
ALTER TABLE "Contrato" ALTER COLUMN "estado" SET DEFAULT 'pendiente_pago';
COMMENT ON COLUMN "Contrato"."estado" IS 'pendiente_pago -> activo (pago retenido) -> completado | cancelado';

-- 5. Las cuentas suspendidas usan el estado 'suspendido' (columna de texto, sin DDL adicional).
COMMENT ON COLUMN "User"."estado" IS 'activo | inactivo | suspendido';
