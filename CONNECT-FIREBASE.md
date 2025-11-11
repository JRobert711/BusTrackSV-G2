# 🔥 Cómo Conectar Firebase a Tu Proyecto BusTrack

Esta guía te ayudará a conectar Firebase a tu proyecto paso a paso.

## 📋 Tabla de Contenidos

1. [Crear Proyecto en Firebase](#1-crear-proyecto-en-firebase)
2. [Habilitar Servicios Firebase](#2-habilitar-servicios-firebase)
3. [Configurar Backend (Firebase Admin SDK)](#3-configurar-backend-firebase-admin-sdk)
4. [Configurar Frontend (Firebase Client SDK)](#4-configurar-frontend-firebase-client-sdk)
5. [Verificar la Conexión](#5-verificar-la-conexión)
6. [Probar los Endpoints](#6-probar-los-endpoints)

---

## 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Add project"** (Agregar proyecto)
3. Ingresa un nombre para tu proyecto (ej: `bustrack-sv`)
4. Desactiva Google Analytics (opcional) o actívalo si lo necesitas
5. Haz clic en **"Create project"** (Crear proyecto)
6. Espera a que se cree el proyecto

---

## 2. Habilitar Servicios Firebase

Necesitas habilitar estos servicios en Firebase Console:

### 2.1. Firebase Authentication

1. En el menú lateral, ve a **Authentication**
2. Haz clic en **"Get started"**
3. Ve a la pestaña **"Sign-in method"**
4. Habilita **"Email/Password"** y guarda

### 2.2. Cloud Firestore

1. En el menú lateral, ve a **Firestore Database**
2. Haz clic en **"Create database"**
3. Selecciona **"Start in production mode"** (luego puedes ajustar las reglas)
4. Elige una ubicación (ej: `us-central` o `southamerica-east1` para más cerca de El Salvador)
5. Haz clic en **"Enable"**

#### 2.2.1 ¿Te pide "Upgrade" (pagar) al crear la base de datos? — Alternativas gratuitas

Si la consola de Firebase te pide "upgrade your plan" en algún punto de la creación, no es necesario pagar para el desarrollo local o para la mayoría de funciones básicas. Aquí tienes alternativas sin costo:

- Opción A — Usar el plan Spark (gratuito) y/o "Start in test mode":
  - El plan Spark (free) soporta Firestore y Realtime Database con límites de uso razonables para desarrollo y pruebas (límites de lectura/escritura/almacenamiento). Si la consola te fuerza a seleccionar una opción de pago por defecto, busca la opción para continuar con el plan Spark o elige "Start in test mode" en vez de "production". "Test mode" te permite desarrollar rápido; recuerda endurecer reglas antes de producción.

- Opción B — Usar Firebase Emulator Suite (recomendado para desarrollo sin costo):
  - El Emulator Suite corre localmente y evita cualquier cuota/plan. Te permite emular Auth, Firestore, Realtime DB, Functions y más.
  - Ventajas: cero coste, rápido feedback, puedes hacer pruebas automatizadas y CI sin credenciales en la nube.
  - Pasos rápidos:
    1. Instala Firebase CLI si no lo tienes:
       ```bash
       npm install -g firebase-tools
       ```
    2. En la raíz del proyecto inicializa los emuladores (si no están):
       ```bash
       firebase init emulators
       ```
       - Selecciona Firestore, Realtime Database y Authentication según necesites.
    3. Inicia los emuladores:
       ```bash
       firebase emulators:start --only firestore,auth,database
       ```
    4. Conecta tu backend al emulador (ejemplos más abajo).

- Opción C — Usar una alternativa DB gratuita (Supabase, MongoDB Atlas, free-tier Postgres, SQLite):
  - Si no quieres usar Firebase, puedes usar Supabase (Postgres + Realtime) que tiene un plan gratuito generoso, o MongoDB Atlas (cluster free), o incluso una base de datos local como SQLite para pruebas.
  - Cambiar a una alternativa requiere ajustar la capa de acceso a datos del backend (pequeño cambio de configuración y dependencias), pero evita atarte a Firebase y sus límites.

En la continuación de esta guía verás instrucciones para usar el Emulator Suite y cómo ajustar `backend/.env` para apuntar al emulador.

### 2.3. Realtime Database (Opcional - para ubicaciones en tiempo real)

1. En el menú lateral, ve a **Realtime Database**
2. Haz clic en **"Create Database"**
3. Elige una ubicación
4. Selecciona **"Start in locked mode"** (luego puedes ajustar las reglas)
5. Haz clic en **"Enable"**

---

## 3. Configurar Backend (Firebase Admin SDK)

### Paso 1: Obtener Credenciales de Service Account

1. En Firebase Console, haz clic en el ⚙️ (icono de configuración) > **"Project settings"**
2. Ve a la pestaña **"Service accounts"**
3. Haz clic en **"Generate new private key"**
4. En el diálogo, haz clic en **"Generate key"**
5. Se descargará un archivo JSON (ej: `bustrack-sv-firebase-adminsdk-xxxxx.json`)
6. **⚠️ IMPORTANTE:** Guarda este archivo en un lugar seguro, contiene credenciales sensibles

### Paso 2: Extraer Valores del JSON

Abre el archivo JSON descargado. Necesitarás estos valores:

```json
{
  "project_id": "tu-project-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@tu-project.iam.gserviceaccount.com"
}
```

### Paso 3: Obtener Database URL (Realtime Database)

1. En Firebase Console, ve a **Realtime Database**
2. En la parte superior verás una URL como: `https://tu-project-default-rtdb.firebaseio.com`
3. Copia esa URL

### Paso 4: Configurar backend/.env

1. Abre `backend/.env` en tu editor
2. Descomenta y completa las variables de Firebase:

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://tu-project-default-rtdb.firebaseio.com
```

**⚠️ Importante sobre FIREBASE_PRIVATE_KEY:**

Tienes dos opciones para formatear la clave privada:

**Opción A: Con saltos de línea reales (mejor para desarrollo local)**
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
(todas las líneas de la clave aquí)
-----END PRIVATE KEY-----"
```

**Opción B: Con \n escapado (mejor para CI/CD)**
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### Paso 5: Verificar Backend

Reinicia tu servidor backend:

```bash
cd backend
npm run dev
```

Deberías ver:
```
✅ Firebase Admin SDK initialized successfully
```

Si ves un warning, verifica que las credenciales estén correctas.

---

## 4. Configurar Frontend (Firebase Client SDK)

### Paso 1: Obtener Configuración de la Web App

1. En Firebase Console, ve a ⚙️ > **"Project settings"**
2. Desplázate a la sección **"Your apps"**
3. Si no tienes una app web, haz clic en el icono `</>` (Web)
4. Ingresa un nombre (ej: `BusTrack Web App`)
5. Haz clic en **"Register app"**
6. Verás un objeto `firebaseConfig` - **NO lo copies todavía**, solo anota que está ahí

### Paso 2: Crear archivo .env en Frontend

1. Crea un archivo `.env` en `frontend/web/`:

```bash
cd frontend/web
copy .env.example .env  # Windows
# o
cp .env.example .env    # Linux/Mac
```

### Paso 3: Obtener los Valores de firebaseConfig

Del objeto `firebaseConfig` que viste antes, copia estos valores:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // ← VITE_FIREBASE_API_KEY
  authDomain: "tu-project.firebaseapp.com",  // ← VITE_FIREBASE_AUTH_DOMAIN
  databaseURL: "https://tu-project-default-rtdb.firebaseio.com",  // ← VITE_FIREBASE_DATABASE_URL
  projectId: "tu-project-id",       // ← VITE_FIREBASE_PROJECT_ID
  storageBucket: "tu-project.appspot.com",   // ← VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789012", // ← VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789012:web:abc123" // ← VITE_FIREBASE_APP_ID
};
```

### Paso 4: Llenar frontend/web/.env

Abre `frontend/web/.env` y completa:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://tu-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_FIREBASE_STORAGE_BUCKET=tu-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123
```

**Nota:** Los valores deben empezar con `VITE_` para que Vite los reconozca.

---

## 5. Verificar la Conexión

### Backend

1. Reinicia el servidor backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Deberías ver:
   ```
   ✅ Firebase Admin SDK initialized successfully
   Server is running on port 5000
   ```

3. Prueba los endpoints:
   ```bash
   # En otro terminal o en tu navegador:
   curl http://localhost:5000/health
   curl http://localhost:5000/ready
   ```

   - `/health` debe retornar `200 OK` con `firebase.configured: true`
   - `/ready` debe retornar `200 OK` con `status: "ready"` si Firestore está conectado

### Frontend

1. Reinicia el servidor de desarrollo:
   ```bash
   cd frontend/web
   npm run dev
   ```

2. Abre el navegador en `http://localhost:5173` (o el puerto que muestre)
3. Abre la consola del navegador (F12)
4. No deberías ver errores de Firebase

---

## 6. Probar los Endpoints

### Probar /health

```bash
curl http://localhost:5000/health
```

**Respuesta esperada:**
```json
{
  "message": "Backend is working!",
  "status": "success",
  "timestamp": "2025-11-04T00:00:00.000Z",
  "firebase": {
    "configured": true,
    "firestore": true,
    "auth": true,
    "realtime": true
  }
}
```

### Probar /ready

```bash
curl http://localhost:5000/ready
```

**Respuesta esperada (si Firebase está configurado):**
```json
{
  "status": "ready",
  "message": "Backend is ready and connected to Firestore",
  "timestamp": "2025-11-04T00:00:00.000Z",
  "services": {
    "firebase": true,
    "firestore": true,
    "auth": true,
    "realtime": true
  }
}
```

**Si Firebase NO está configurado, retornará `503` con:**
```json
{
  "status": "not_ready",
  "message": "Firebase or Firestore is not configured"
}
```

---

## 7. Poblar Datos Iniciales (Opcional)

Una vez que Firebase esté conectado, puedes poblar datos de prueba:

```bash
cd backend
npm run seed
```

Esto creará:
- 2 usuarios de prueba en Firebase Authentication
- 12 buses en Firestore
- Ubicaciones iniciales en Realtime Database

**Usuarios de prueba creados:**
- `admin@bustrack.com` / `admin123`
- `operador@bustrack.com` / `operador123`

---

## 🚨 Troubleshooting

### Error: "Firebase Admin credentials not found"

**Solución:**
- Verifica que `backend/.env` existe y tiene las variables correctas
- Asegúrate de que las variables no estén comentadas
- Verifica que no haya espacios extra en los valores

### Error: "Invalid PEM formatted message"

**Solución:**
- Verifica que `FIREBASE_PRIVATE_KEY` tenga las comillas dobles
- Asegúrate de que incluya `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`
- Si usas `\n`, asegúrate de que estén escapados correctamente

### Error: "Permission denied" en Firestore

**Solución:**
1. Ve a Firestore Database > Rules
2. Temporalmente, usa reglas de desarrollo:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true; // ⚠️ Solo para desarrollo
       }
     }
   }
   ```
3. Haz clic en "Publish"
4. **⚠️ Recuerda cambiar estas reglas en producción**

### Frontend: "Failed to resolve import firebase/database"

**Solución:**
- Asegúrate de haber ejecutado `npm install` en `frontend/web`
- Verifica que `package.json` tenga `"firebase": "^12.5.0"` (NO `firebase-admin`)
- Reinicia el servidor de desarrollo

### Endpoints /health y /ready retornan 503

**Solución:**
- Verifica que las credenciales de Firebase en `backend/.env` sean correctas
- Verifica que Firestore esté habilitado en Firebase Console
- Revisa los logs del servidor backend para ver errores específicos

---

## ✅ Checklist de Verificación

- [ ] Proyecto Firebase creado
- [ ] Authentication habilitado (Email/Password)
- [ ] Firestore Database creado
- [ ] Realtime Database creado (opcional)
- [ ] Service Account key descargado
- [ ] `backend/.env` configurado con credenciales
- [ ] Backend muestra "✅ Firebase Admin SDK initialized successfully"
- [ ] `/health` retorna `200 OK` con `firebase.configured: true`
- [ ] `/ready` retorna `200 OK` con `status: "ready"`
- [ ] Web app creada en Firebase Console
- [ ] `frontend/web/.env` configurado con `VITE_FIREBASE_*`
- [ ] Frontend se ejecuta sin errores de Firebase
- [ ] Datos iniciales poblados (opcional, `npm run seed`)

---

## 📚 Recursos Adicionales

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Firebase Client SDK Docs](https://firebase.google.com/docs/web/setup)

---

## 🎉 ¡Listo!

Una vez completados estos pasos, tu proyecto estará conectado a Firebase y podrás:
- Autenticar usuarios
- Guardar y leer datos de Firestore
- Recibir actualizaciones en tiempo real de ubicaciones
- Usar todas las funcionalidades de Firebase
