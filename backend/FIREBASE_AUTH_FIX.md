# Solución al Error UNAUTHENTICATED de Firebase

## Problema

Al intentar registrar un usuario, recibes el error:
```
16 UNAUTHENTICATED: Request had invalid authentication credentials. Expected OAuth 2 access token, login cookie or other valid authentication credential.
```

## Causa

Este error ocurre cuando:
1. El service account no tiene permisos para acceder a Firestore
2. Firestore no está habilitado en tu proyecto de Firebase
3. Las credenciales están expiradas o fueron revocadas
4. El proyecto_id en las credenciales no coincide con tu proyecto real

## Solución

### Paso 1: Verificar que Firestore esté habilitado

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto "tibitribial"
3. Ve a **Firestore Database** en el menú lateral
4. Si no está habilitado, haz clic en **"Create Database"**
5. Selecciona **"Start in production mode"** (puedes cambiar las reglas después)
6. Elige una ubicación cercana a tus usuarios

### Paso 2: Verificar permisos del Service Account

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto "tibitribial"
3. Ve a **IAM & Admin** → **Service Accounts**
4. Busca el service account: `firebase-adminsdk-fbsvc@tibitribial.iam.gserviceaccount.com`
5. Haz clic en el service account
6. Verifica que tenga uno de estos roles:
   - **Cloud Datastore User** (mínimo necesario)
   - **Firebase Admin SDK Administrator Service Agent** (recomendado)
   - **Editor** (más permisos, pero funciona)

### Paso 3: Si no tiene permisos, agregarlos

1. En la página del service account, haz clic en **"Permissions"** o **"Grant Access"**
2. Haz clic en **"Add Principal"** o **"Grant Access"**
3. Agrega el rol **"Cloud Datastore User"** o **"Firebase Admin SDK Administrator Service Agent"**
4. Guarda los cambios

### Paso 4: Regenerar credenciales (si es necesario)

Si los permisos no funcionan, regenera las credenciales:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Project Settings** (⚙️) → **Service Accounts**
4. Haz clic en **"Generate new private key"**
5. Descarga el nuevo archivo JSON
6. Reemplaza el archivo `backend/src/config/firebase-adminsdk.json` con el nuevo
7. Reinicia el servidor

### Paso 5: Verificar la configuración

Ejecuta el script de diagnóstico:
```bash
cd backend
node scripts/diagnose-firebase.js
```

Deberías ver:
```
✅ Diagnóstico completado - Todo está correcto!
```

## Verificación Rápida

Para verificar que todo funciona, intenta registrar un usuario nuevamente. Si el error persiste:

1. Verifica que Firestore esté habilitado en Firebase Console
2. Verifica que el service account tenga permisos en Google Cloud Console
3. Regenera las credenciales si es necesario
4. Reinicia el servidor después de hacer cambios

## Notas Adicionales

- Los cambios de permisos pueden tardar unos minutos en propagarse
- Asegúrate de que el `project_id` en el archivo JSON coincida con tu proyecto real
- No compartas tus credenciales de service account públicamente

