# src/
Contiene el código fuente del servidor.

- app.js: instancia de Express, middlewares base, montaje de rutas y manejadores de errores.
- server.js: arranque del servidor, lee `PORT` desde `config/env.js` y ejecuta `app.listen`.
- Subcarpetas especializadas:
  - config/: configuración y utilidades (env, jwt, cors, conexiones futuras).
  - middlewares/: middlewares reutilizables (auth, 404, error handler).
  - services/: lógica de negocio (no depende de Express).
  - controllers/: coordina request/response y llama a services.
  - routes/: define endpoints y agrupa por recurso.
