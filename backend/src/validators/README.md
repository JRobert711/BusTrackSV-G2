# validators/
Funciones que revisan que los datos de entrada tengan el formato correcto antes de que el servidor los procese.

- auth.validator.js: valida el cuerpo del login (usuario y contraseña requeridos, formatos mínimos).

¿Por qué es importante?
- Evita que entren datos vacíos o mal formados.
- Reduce errores y mejora la seguridad.

¿Dónde se usan?
- Se integran en las rutas, antes del controlador. Ej.: en `auth.routes.js` se aplica `validateLogin` antes de `login`.
