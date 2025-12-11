# Modo Desarrollo: Omitir Login (Temporal)

Para pruebas locales se puede habilitar un bypass de autenticación. **Usarlo sólo en development y nunca en production.**

- Activar bypass (PowerShell):

```powershell
$env:DEV_AUTH_SKIP='true'; node server.js
```

- Variables opcionales:
  - `DEV_AUTH_ROLE`: rol que tendrá el usuario "dev" (por defecto `admin`).
  - `DEV_AUTH_USER_EMAIL`: email del usuario dev (por defecto `dev@local`).

Ejemplo con rol personalizado (PowerShell):

```powershell
$env:DEV_AUTH_SKIP='true'; $env:DEV_AUTH_ROLE='supervisor'; node server.js
```

El servidor añadirá un usuario `req.user` con `id: 'dev'` y el rol configurado mientras `DEV_AUTH_SKIP` esté en `true`.