# controllers/
Coordina requests/responses de Express y delega a services.

- auth.controller.js: login → genera token y retorna datos del usuario.
- buses.controller.js: obtener buses y actualizar favorito.
- health.controller.js: endpoints públicos de estado.

Guía rápida:
- Validar y parsear inputs del request.
- Llamar a services.
- Manejar status codes y formato de respuesta.
