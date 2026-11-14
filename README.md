# FirstGig Backend (Auth — Comité 1)

[![Docker CI](https://github.com/Jescobar-cmd/Backend/actions/workflows/docker.yml/badge.svg)](https://github.com/Jescobar-cmd/Backend/actions/workflows/docker.yml)

Arquitectura hexagonal con Node + Express + TS.

```
src/
  domain/          # entidades, puertos (interfaces) y casos de uso puros
  application/     # DTOs + validaciones zod
  infrastructure/  # adaptadores: http, postgres, security, email, google, config
```

## Correr
1. `npm install`
2. Copiar `.env.example` a `.env` y completar (DB, JWT, Gmail SMTP, GOOGLE_CLIENT_ID).
3. Aplicar el schema a la base de datos: `npx prisma db push`.
4. `npm run dev`

## 🐳 Docker (entrega de la actividad)

```bash
docker compose up --build
```

Levanta tres servicios en orden:
1. **db** — PostgreSQL 16 con volumen persistente (`db_data`).
2. **migrate** — aplica el schema de Prisma (`npx prisma db push`), siembra los roles base (`prisma/seed.ts`) y termina.
3. **backend** — API en `http://localhost:4000` (salud: `/health`, disponibilidad: `/health/ready`, Swagger: `/api-docs`).

Usuario de prueba que incluye el seed: **demo@firstgig.com** / **Demo1234** (sirve para probar el login sin configurar correo).

```bash
docker compose down      # apagar (conserva los datos)
docker compose down -v   # apagar y borrar también la BD local
```

Las variables del `.env` (JWT, SMTP, Google) se toman automáticamente; si no existen, se usan valores por defecto.

### Automatización (GitHub Actions)

Cada push a `main` construye la imagen y levanta el stack completo con `docker compose` en los servidores de GitHub (`.github/workflows/docker.yml`). Si el flujo sale en verde, el Dockerfile y el compose funcionan — sin necesidad de Docker instalado en tu PC.

## 🧭 Los 12 factores

La aplicación sigue la metodología [Twelve-Factor App](https://12factor.net/es/). La auditoría está automatizada en `tests/unit/doceFactores.test.ts` y corre junto a la suite y en CI:

```bash
npx vitest run tests/unit/doceFactores.test.ts
```

| Factor | Cómo se cumple |
| --- | --- |
| I. Código base | Un repositorio, una app; los entornos son ramas/despliegues del mismo código. |
| II. Dependencias | Todo en `package.json` + `package-lock.json`; `node_modules` y `dist` no se versionan. |
| III. Configuración | Variables de entorno validadas con Zod en `src/config/entorno.ts`; arranque falla rápido si falta algo. `.env` es local. |
| IV. Servicios de respaldo | PostgreSQL se resuelve por `DATABASE_URL`; no hay hosts ni credenciales fijos en el código. |
| V. Construir, entregar, ejecutar | `npm run build` genera `dist/`; `npm start` solo ejecuta el artefacto compilado. |
| VI. Procesos | API stateless: sin sesiones en memoria, sin estado en disco y sin WebSockets (chat por polling). |
| VII. Asignación de puertos | Express escucha en `PORT`; el puerto es configurable y las pruebas usan puertos efímeros. |
| VIII. Concurrencia | Escala por procesos/contenedores independientes, sin gestores de procesos internos. |
| IX. Desechabilidad | `SIGTERM`/`SIGINT` cierran HTTP y Prisma; `/health` es liveness y `/health/ready` verifica la BD. |
| X. Paridad dev/prod | Docker Compose y producción usan el mismo PostgreSQL 16 y el mismo build. |
| XI. Logs | Eventos a stdout/stderr (`console`), sin archivos de log locales. |
| XII. Procesos de administración | Seed y migraciones se ejecutan como comandos puntuales (`npm run seed`, `prisma/manual-migrations/`). |
