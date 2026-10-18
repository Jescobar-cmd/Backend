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
3. **backend** — API en `http://localhost:4000` (salud: `/health`, Swagger: `/api-docs`).

Usuario de prueba que incluye el seed: **demo@firstgig.com** / **Demo1234** (sirve para probar el login sin configurar correo).

```bash
docker compose down      # apagar (conserva los datos)
docker compose down -v   # apagar y borrar también la BD local
```

Las variables del `.env` (JWT, SMTP, Google) se toman automáticamente; si no existen, se usan valores por defecto.

### Automatización (GitHub Actions)

Cada push a `main` construye la imagen y levanta el stack completo con `docker compose` en los servidores de GitHub (`.github/workflows/docker.yml`). Si el flujo sale en verde, el Dockerfile y el compose funcionan — sin necesidad de Docker instalado en tu PC.
