# Backend BusTrackSV – Guía de Estructura

Este backend está construido con Express y organizado en capas para facilitar mantenimiento, pruebas y escalabilidad.

## Mapa general
- src/
  - app.js → Configura Express, middlewares y monta rutas.
  - server.js → Arranca el servidor (usa variables desde config/env.js).
  - config/ → Configuración (env, jwt, cors, conexiones futuras).
  - middlewares/ → Middleware reutilizable (auth, 404, errores).
  - services/ → Lógica de negocio y orquestación con datos.
  - controllers/ → Manejo de requests/responses por endpoint.
  - routes/ → Definición de endpoints y agrupación por recurso.

## Convenciones
- Prefijo de API: `/api/v1`.
- Validar entradas en controllers/services (o con validadores adicionales).
- Respuestas de error consistentes: `{ message, details? }`.
- Variables sensibles en entorno (ver `.env.example`).

## Cómo iniciar
- Dev: `npm run dev` (desde backend/)
- Prod: `npm start`

## Dónde agregar nuevas funcionalidades
- Endpoint nuevo → `routes/<recurso>.routes.js` + `controllers/<recurso>.controller.js` + (opcional) `services/<recurso>.service.js`.
- Reglas cross-cutting → `middlewares/`.
- Configuraciones → `config/`.

Para más detalle, revisa los README dentro de cada subcarpeta.
