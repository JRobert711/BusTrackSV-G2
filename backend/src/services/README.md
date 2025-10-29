# services/
Lógica de negocio y acceso a datos. No depende de Express.

- bus.service.js: listado y actualización de estado favorito (mock en memoria).
- auth.service.js: validación de credenciales (mock en memoria).

Cuándo crear un service:
- Cuando la lógica pueda ser usada por distintos controllers o jobs.
- Para aislar cambios de infraestructura (por ejemplo, pasar de mock a BD).
