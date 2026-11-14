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
4. Si la base ya existe, aplicar la migración manual de escrow y suspensión:
   `psql "$DATABASE_URL" -f prisma/manual-migrations/2026-11-13-escrow-suspension.sql`
   y regenerar el cliente con `npx prisma generate`.
5. `npm run dev`

## 💸 Flujo de dinero (escrow con Mercado Pago)

El dinero no se mueve directo entre cliente y freelancer: la plataforma lo retiene
hasta que el servicio se completa satisfactoriamente.

```
pendiente_pago ──(pago aprobado)──► activo ──(cliente aprueba entrega)──► completado
       │                              │
       └──(cancelar sin pago)──► cancelado
                                      └──(disputa: reembolso_cliente)──► cancelado
```

| Concepto | Valor por defecto |
| --- | --- |
| Comisión total de la plataforma | `15%` (`COMISION_PLATAFORMA_PORCENTAJE`) |
| Comisión que paga el cliente | `3%` (`COMISION_CLIENTE_PORCENTAJE`) |
| Comisión que paga el freelancer | `12%` (resto) |

Estados del pago: `pendiente → retenido → liberado | reembolsado`.

- El cliente inicia el pago con `POST /api/contratos/:id/pago/preferencia`.
- Mercado Pago confirma por `POST /api/pagos/webhook`; el pago pasa a `retenido`
  y el contrato a `activo`.
- `PATCH /api/contratos/:id/aprobar-entrega` libera el escrow, completa el
  contrato y genera la liquidación del freelancer.
- `PATCH /api/contratos/:id/estado` solo puede **cancelar** contratos que aún no
  tienen pago; completar siempre pasa por la aprobación de entrega.
- Una disputa abierta bloquea la aprobación de entrega. El moderador la resuelve
  con `resultado`: `reembolso_cliente` o `liberar_freelancer`.
- Rechazar un retiro exige `motivoRechazo` y devuelve el saldo a `pendiente`.

### Modo simulado (sin credenciales)

Si no existe `MERCADOPAGO_ACCESS_TOKEN`, se usa una pasarela simulada que solo
funciona fuera de producción. Para probar el flujo sin Mercado Pago:

```bash
curl -X POST http://localhost:4000/api/contratos/1/pago/simular \
  -H "Authorization: Bearer <token-cliente>"
```

En producción la pasarela real es obligatoria: sin token, el backend responde
`503` al intentar iniciar un pago.

### Suspensión de cuentas

`PATCH /api/moderador/usuarios/:id/suspender` (admin/moderador) marca la cuenta
como `suspendido`. El login queda bloqueado y cada petición revalida el estado
del usuario contra la base de datos, así que los tokens emitidos dejan de servir
de inmediato. `PATCH /api/moderador/usuarios/:id/reactivar` restaura el acceso.

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

Cada push a `main`, `produccion` o `desarrollo` ejecuta typecheck, tests, cobertura y build (`.github/workflows/ci.yml`). El flujo de Docker (`.github/workflows/docker.yml`) construye la imagen y levanta el stack completo con `docker compose` en los servidores de GitHub. Si sale en verde, el Dockerfile y el compose funcionan — sin necesidad de Docker instalado en tu PC.

```bash
npm test                 # suite completa
npm run test:coverage    # suite + reporte de cobertura
npm run test:typecheck   # typecheck de los tests
```

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
