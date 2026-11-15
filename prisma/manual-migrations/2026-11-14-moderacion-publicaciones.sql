CREATE TABLE IF NOT EXISTS "ModeracionPublicacion" (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL,
  "publicacionId" INTEGER NOT NULL,
  "moderadorId" INTEGER NOT NULL REFERENCES "Usuario"(id),
  accion TEXT NOT NULL,
  motivo TEXT,
  "estadoAnterior" TEXT NOT NULL,
  "estadoNuevo" TEXT NOT NULL,
  fecha TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "ModeracionPublicacion_tipo_publicacionId_idx"
  ON "ModeracionPublicacion"(tipo, "publicacionId");

CREATE TABLE IF NOT EXISTS "SancionUsuario" (
  id SERIAL PRIMARY KEY,
  "usuarioId" INTEGER NOT NULL REFERENCES "Usuario"(id),
  "moderadorId" INTEGER NOT NULL REFERENCES "Usuario"(id),
  tipo TEXT NOT NULL,
  motivo TEXT NOT NULL,
  fecha TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "SancionUsuario_usuarioId_fecha_idx"
  ON "SancionUsuario"("usuarioId", fecha);

ALTER TABLE "Servicio"
  ADD COLUMN IF NOT EXISTS "moderacionRetirada" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "moderacionEstadoAnterior" TEXT,
  ADD COLUMN IF NOT EXISTS "moderacionMotivo" TEXT;

ALTER TABLE "Proyecto"
  ADD COLUMN IF NOT EXISTS "moderacionRetirada" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "moderacionEstadoAnterior" TEXT,
  ADD COLUMN IF NOT EXISTS "moderacionMotivo" TEXT;

ALTER TABLE "Usuario"
  ADD COLUMN IF NOT EXISTS "motivoSuspension" TEXT,
  ADD COLUMN IF NOT EXISTS "suspendidoPorId" INTEGER,
  ADD COLUMN IF NOT EXISTS "fechaSuspension" TIMESTAMP(3);