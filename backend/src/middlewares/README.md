# middlewares/
Middlewares reutilizables de Express.

- auth.middleware.js: valida Bearer token y asigna `req.user`.
- error.middleware.js: manejador global de errores (formato consistente).
- notFound.middleware.js: respuesta 404 para rutas no definidas.

Buenas prácticas:
- Un middleware por responsabilidad.
- Exporta funciones nombradas (`{ myMiddleware }`).
- No escribas lógica de negocio aquí; delega a services si es necesario.
