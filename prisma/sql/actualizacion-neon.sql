-- Actualizacion de la base de datos Neon - Fase 0
-- Generado con prisma migrate diff (Neon actual -> schema nuevo)

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "descripcion" TEXT;

-- AlterTable
ALTER TABLE "Contrato" ADD COLUMN     "ofertaChatId" INTEGER,
ADD COLUMN     "servicioId" INTEGER,
ALTER COLUMN "propuestaId" DROP NOT NULL,
ALTER COLUMN "proyectoId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Conversacion" ADD COLUMN     "servicioId" INTEGER;

-- AlterTable
ALTER TABLE "Mensaje" ADD COLUMN     "tipo" VARCHAR(20) NOT NULL DEFAULT 'texto';

-- AlterTable
ALTER TABLE "Proyecto" ADD COLUMN     "imagenUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fotoPerfil" TEXT;

-- CreateTable
CREATE TABLE "Servicio" (
    "id" SERIAL NOT NULL,
    "freelancerId" INTEGER NOT NULL,
    "categoriaId" INTEGER,
    "titulo" VARCHAR(150) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DECIMAL(12,2) NOT NULL,
    "imagenUrl" TEXT,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'activo',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfertaChat" (
    "id" SERIAL NOT NULL,
    "conversacionId" INTEGER NOT NULL,
    "mensajeId" INTEGER NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "descripcion" TEXT,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "ofertaPadreId" INTEGER,
    "fechaEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaExpiracion" TIMESTAMP(3),

    CONSTRAINT "OfertaChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publicacion" (
    "id" SERIAL NOT NULL,
    "autorId" INTEGER NOT NULL,
    "titulo" VARCHAR(150),
    "contenido" TEXT NOT NULL,
    "imagenUrl" TEXT,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'publicado',
    "fechaPublicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Publicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeGustaPublicacion" (
    "publicacionId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeGustaPublicacion_pkey" PRIMARY KEY ("publicacionId","usuarioId")
);

-- CreateIndex
CREATE INDEX "Servicio_categoriaId_idx" ON "Servicio"("categoriaId");

-- CreateIndex
CREATE INDEX "Servicio_estado_idx" ON "Servicio"("estado");

-- CreateIndex
CREATE INDEX "Servicio_freelancerId_idx" ON "Servicio"("freelancerId");

-- CreateIndex
CREATE UNIQUE INDEX "OfertaChat_mensajeId_key" ON "OfertaChat"("mensajeId");

-- CreateIndex
CREATE UNIQUE INDEX "OfertaChat_ofertaPadreId_key" ON "OfertaChat"("ofertaPadreId");

-- CreateIndex
CREATE INDEX "OfertaChat_conversacionId_idx" ON "OfertaChat"("conversacionId");

-- CreateIndex
CREATE INDEX "Publicacion_autorId_idx" ON "Publicacion"("autorId");

-- CreateIndex
CREATE INDEX "Publicacion_fechaPublicacion_idx" ON "Publicacion"("fechaPublicacion");

-- CreateIndex
CREATE INDEX "MeGustaPublicacion_usuarioId_idx" ON "MeGustaPublicacion"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Contrato_ofertaChatId_key" ON "Contrato"("ofertaChatId");

-- CreateIndex
CREATE INDEX "Contrato_servicioId_idx" ON "Contrato"("servicioId");

-- CreateIndex
CREATE INDEX "Conversacion_servicioId_idx" ON "Conversacion"("servicioId");

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_ofertaChatId_fkey" FOREIGN KEY ("ofertaChatId") REFERENCES "OfertaChat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Conversacion" ADD CONSTRAINT "Conversacion_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OfertaChat" ADD CONSTRAINT "OfertaChat_conversacionId_fkey" FOREIGN KEY ("conversacionId") REFERENCES "Conversacion"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OfertaChat" ADD CONSTRAINT "OfertaChat_mensajeId_fkey" FOREIGN KEY ("mensajeId") REFERENCES "Mensaje"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OfertaChat" ADD CONSTRAINT "OfertaChat_ofertaPadreId_fkey" FOREIGN KEY ("ofertaPadreId") REFERENCES "OfertaChat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MeGustaPublicacion" ADD CONSTRAINT "MeGustaPublicacion_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "Publicacion"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MeGustaPublicacion" ADD CONSTRAINT "MeGustaPublicacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
