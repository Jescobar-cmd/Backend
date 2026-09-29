# FirstGig Backend (Auth — Comité 1)

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
3. Crear la BD y correr `src/infrastructure/persistence/postgres/sql/init.sql`.
4. `npm run dev`
