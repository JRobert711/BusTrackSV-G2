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

---

## Nuevas implementaciones (explicación no técnica)

- .env (variables de entorno)
  - Piensa en un “papelito secreto” con datos como el puerto o la llave del token.
  - Ventajas: seguridad (no se sube al repo), flexibilidad (cambia por entorno) y orden.
  - Archivo de ejemplo: `.env.example`. Crea tu `.env` a partir de ahí.

- Seguridad y observabilidad
  - Helmet: “casco de seguridad” que pone protecciones estándar al servidor.
  - Rate limit: “torniquete” que limita intentos (evita abusos en login, por ejemplo).
  - Logs (morgan): “bitácora” de entradas/salidas para entender qué pasó cuando algo falla.

- Validación de datos (validators)
  - “Guardia de entrada” que revisa que lo que envían los clientes tenga sentido (campos obligatorios, formatos, etc.).
  - Evita errores innecesarios y mejora la seguridad.

- Swagger (/docs)
  - “Manual interactivo”: ves los endpoints y los puedes probar desde el navegador.
  - Ideal para personas nuevas en el proyecto y para QA.

## Cómo instalar dependencias nuevas
- Ejecuta en `backend/`:
  - `npm install`

## Rutas útiles
- Salud: `GET /` y `GET /health`.
- Documentación: `GET /docs` (Swagger UI).
- Auth: `POST /api/v1/auth/login`.
- Buses: `GET /api/v1/buses`, `PATCH /api/v1/buses/:id/favorite`.
