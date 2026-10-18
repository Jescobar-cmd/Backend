# syntax=docker/dockerfile:1
# Imagen del backend FirstGig — build en 3 etapas:
# dependencias → compilación (Prisma + TypeScript) → runtime mínimo.

# ── Etapa 1: dependencias ────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Etapa 2: compilación (cliente Prisma + TypeScript) ───────────────
FROM node:22-alpine AS build
WORKDIR /app
# prisma.config.ts lee DATABASE_URL al cargarse; `generate` no se conecta
# a ninguna BD, es un valor de relleno para que la config cargue sin .env.
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate && npm run build

# ── Etapa 3: imagen final (solo producción) ──────────────────────────
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Parte del node_modules ya compilado y quita las dependencias de desarrollo
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
RUN npm prune --omit=dev && npm cache clean --force
# Restaura el cliente generado por Prisma por si `npm prune` lo limpió
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client

COPY --from=build /app/dist ./dist

# La imagen de Node ya trae un usuario sin privilegios
USER node

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/health || exit 1

CMD ["node", "dist/infrastructure/http/server.js"]
