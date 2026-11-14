# Cambios manuales aplicados en la base de datos del moderador.
# Se guardan aquí porque el proyecto todavía no usa prisma/migrations.
# Ejecutar en test/dev o preproducción; nunca directamente en producción.

-- 1. Contexto de resolución de reportes
ALTER TABLE "Reporte" ADD COLUMN IF NOT EXISTS "resolucion" TEXT;
ALTER TABLE "Reporte" ADD COLUMN IF NOT EXISTS "fechaResolucion" TIMESTAMP(3);

-- 2. Rol de moderador (id 4)
INSERT INTO "Rol" (id, nombre) VALUES (4, 'Moderador')
ON CONFLICT (id) DO NOTHING;
