# routes/
Define endpoints y agrupa por recurso.

- index.js: monta subrutas bajo `/api/v1`.
- auth.routes.js: rutas de autenticación (p. ej., POST /auth/login).
- buses.routes.js: rutas protegidas para buses.
- health.routes.js: rutas públicas (/, /health).

Reglas:
- Mantener rutas pequeñas: solo mapping → controller.
- No poner lógica de negocio aquí.
