# 🚀 Guía Completa para Iniciar BusTrack SV

## ✅ Estado Actual de la Configuración

### Backend
- ✅ Dependencias instaladas (855 paquetes)
- ✅ `.env` configurado para usar emulador
- ✅ `firebase.json` creado
- ✅ Firebase Tools instalado globalmente

### Frontend
- ✅ Dependencias instaladas (823 paquetes)
- ✅ TypeScript configurado
- ✅ Vite configurado
- ✅ Servicio API conectado al backend

### Firebase
- ✅ Emulador configurado en puerto 8080
- ✅ UI del emulador en puerto 4000

---

## 🎯 Inicio Rápido (3 Terminales)

### Terminal 1: Emulador de Firebase

```powershell
cd backend
firebase emulators:start --only firestore
```

**Deberías ver:**
```
✔  firestore: Emulator started at http://localhost:8080
✔  firestore: View Emulator UI at http://localhost:4000/firestore
```

**Accesos:**
- **Firestore API:** http://localhost:8080
- **Emulator UI:** http://localhost:4000/firestore

---

### Terminal 2: Backend API

```powershell
cd backend
npm run dev
```

**Deberías ver:**
```
[INFO] Firebase Emulator detected at localhost:8080
[INFO] Server listening on port 5000
[INFO] Environment: development
```

**Verificar que funciona:**
```powershell
curl http://localhost:5000/health
```

Respuesta esperada:
```json
{
  "status": "healthy",
  "service": "bustrack-sv-backend",
  "version": "1.0.0",
  "timestamp": "..."
}
```

---

### Terminal 3: Frontend

```powershell
cd frontend/web
npm run dev
```

**Deberías ver:**
```
VITE v6.4.1  ready in X ms
➜  Local:   http://localhost:3000/
➜  press h + enter to show help
```

---

## 📊 Seed de Base de Datos (Primera vez)

**Después de iniciar el emulador y el backend**, ejecuta en otra terminal:

```powershell
cd backend
npm run seed
```

**Esto crea:**
- ✅ 1 Usuario administrador
  - Email: `admin@bustrack.com`
  - Password: `Admin123!@#`
- ✅ 5 Buses de ejemplo con datos realistas

---

## 🧪 Probar la Aplicación

### 1. Abrir Frontend
Abre en tu navegador: **http://localhost:3000**

### 2. Login
- **Email:** `admin@bustrack.com`
- **Password:** `Admin123!@#`

### 3. Verificar Funcionalidades

**Dashboard:**
- ✅ Lista de buses cargada desde backend
- ✅ Estadísticas calculadas en tiempo real
- ✅ Mapa (si está implementado)

**Panel de Notificaciones (🔔):**
- ✅ Se conecta al backend automáticamente
- ✅ Genera notificaciones basadas en estado de buses:
  - 🔵 Buses en mantenimiento
  - 🟠 Buses estacionados >2 horas
  - 🟠 Buses sin ubicación GPS
- ✅ Auto-refresh cada 30 segundos

---

## 🎨 Emulator UI (Opcional)

Abre en el navegador: **http://localhost:4000**

Desde aquí puedes:
- 👀 Ver todas las colecciones de Firestore
- 📝 Agregar/editar/eliminar documentos manualmente
- 🔍 Hacer queries a la base de datos
- 📊 Ver estadísticas de uso

---

## 🛑 Detener Todo

**Para detener los servicios:**
1. En cada terminal, presiona `Ctrl+C`
2. Confirma si te pregunta

**Orden recomendado:**
1. Frontend (Terminal 3)
2. Backend (Terminal 2)
3. Emulador (Terminal 1)

---

## 🐛 Troubleshooting

### Error: "Port 8080 already in use"

**Solución:** Detén el proceso que usa el puerto
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :8080

# Matar el proceso (reemplaza PID con el número que veas)
taskkill /PID <PID> /F

# O reinicia tu computadora
```

### Error: "Port 5000 already in use"

**Solución:**
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Error: "Port 3000 already in use"

**Solución:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error: Panel de notificaciones no carga

**Causas posibles:**
1. Backend no está corriendo
2. Emulador no está corriendo
3. No se hizo el seed de datos

**Solución:**
1. Verifica que los 3 servicios estén corriendo
2. Ejecuta `npm run seed` en el backend
3. Refresca el navegador

### Error: "Cannot find firebase command"

**Solución:** Firebase-tools no está en el PATH
```powershell
# Reinstala firebase-tools
npm install -g firebase-tools

# O usa npx
npx firebase emulators:start --only firestore
```

---

## 📋 Checklist de Inicio

**Antes de empezar, verifica:**
- [ ] Node.js instalado (v18+)
- [ ] npm instalado (v9+)
- [ ] Dependencias del backend instaladas
- [ ] Dependencias del frontend instaladas
- [ ] Firebase Tools instalado
- [ ] Archivos `.env` y `firebase.json` existen

**Al iniciar:**
- [ ] Terminal 1: Emulador corriendo (puerto 8080)
- [ ] Terminal 2: Backend corriendo (puerto 5000)
- [ ] Terminal 3: Frontend corriendo (puerto 3000)
- [ ] Base de datos seeded (primera vez)

**Verificación:**
- [ ] http://localhost:8080 responde
- [ ] http://localhost:5000/health responde
- [ ] http://localhost:3000 abre la app
- [ ] Login funciona
- [ ] Panel de notificaciones carga

---

## 🎯 Resumen de Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| **Firestore Emulator** | 8080 | http://localhost:8080 |
| **Emulator UI** | 4000 | http://localhost:4000 |
| **Backend API** | 5000 | http://localhost:5000 |
| **Frontend Web** | 3000 | http://localhost:3000 |

---

## 🔐 Credenciales de Prueba

**Admin:**
- Email: `admin@bustrack.com`
- Password: `Admin123!@#`

---

## 📁 Estructura de Datos (Después del Seed)

### Colección: `users`
```json
{
  "id": "auto-generated",
  "email": "admin@bustrack.com",
  "name": "Admin BusTrack",
  "role": "admin",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Colección: `buses`
```json
{
  "id": "auto-generated",
  "unitName": "Bus 01",
  "licensePlate": "P-123456",
  "status": "moving|parked|maintenance|outOfService",
  "driver": "Nombre del conductor",
  "route": "Ruta San Salvador - Santa Ana",
  "capacity": 45,
  "position": {
    "lat": 13.6929,
    "lng": -89.2182
  },
  "lastUpdate": "timestamp",
  "parkedTime": 0,
  "favorite": false,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## ✅ ¡Todo Listo!

**Configuración completada al 100%**

Solo necesitas:
1. **Abrir 3 terminales**
2. **Ejecutar los comandos en orden**
3. **Hacer seed** (primera vez)
4. **Abrir el navegador**

**¡Disfruta desarrollando BusTrack SV!** 🚌🎉
