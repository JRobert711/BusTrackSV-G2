# Frontend-Backend Integration Guide

## ✅ Correcciones Realizadas

### 1. Errores de Sintaxis Corregidos

**Archivo:** `src/components/layout/MessagesPanel.tsx`

**Errores encontrados:**
- ❌ Template strings sin backticks: `return Hace ${diffMins} min;`
- ❌ Comentario JSX mal escrito: `{ /Content/}`

**Correcciones aplicadas:**
- ✅ Template strings corregidos: `return \`Hace ${diffMins} min\`;`
- ✅ Comentario JSX corregido: `{/* Content */}`

---

## 🔌 Integración Frontend-Backend

### Servicio de API Creado

**Archivo:** `src/services/api.ts`

**Características:**
- ✅ Servicio completo para comunicación con backend
- ✅ Manejo de autenticación con JWT tokens
- ✅ Endpoints implementados:
  - Login/Register
  - Gestión de buses (CRUD)
  - Toggle de favoritos
  - Actualización de posición GPS
  - Health check

**Uso básico:**
```typescript
import { api } from './services/api';

// Login
const response = await api.login({ email, password });

// Obtener buses
const buses = await api.getBuses({ pageSize: 50 });

// Toggle favorito
await api.toggleFavorite(busId);
```

---

## 📢 Panel de Notificaciones Conectado

### Cómo Funciona

**Archivo:** `src/components/layout/MessagesPanel.tsx`

**Integración implementada:**

1. **Obtención de datos:**
   - Se conecta al backend cada vez que se abre el panel
   - Obtiene lista de buses desde `/api/v1/buses`
   - Auto-refresh cada 30 segundos

2. **Generación de notificaciones:**
   - **Buses en mantenimiento** → Notificación azul
   - **Buses estacionados >2 horas** → Advertencia naranja
   - **Buses sin GPS (status: moving)** → Advertencia naranja

3. **Estados manejados:**
   - ✅ **Loading**: Muestra "Cargando notificaciones..."
   - ✅ **Error**: Muestra mensaje de error con botón reintentar
   - ✅ **Vacío**: Muestra "Todos los buses operan normalmente"
   - ✅ **Con datos**: Lista de notificaciones ordenadas por fecha

### Lógica de Notificaciones

```typescript
// Bus en mantenimiento
if (bus.status === 'maintenance') {
  → Notificación: "Bus {nombre} en mantenimiento"
}

// Bus estacionado mucho tiempo
if (bus.status === 'parked' && bus.parkedTime > 7200) {
  → Advertencia: "Bus estacionado por X horas. Verificar estado"
}

// Bus sin ubicación GPS
if (!bus.position && bus.status === 'moving') {
  → Advertencia: "Bus sin ubicación GPS. Verificar dispositivo"
}
```

---

## 🚀 Cómo Probar la Integración

### Prerrequisitos

1. **Backend funcionando:**
   ```bash
   cd backend
   npm run dev
   ```
   - Debe estar en: `http://localhost:5000`
   - Debe tener datos seeded (1 admin + 5 buses)

2. **Frontend funcionando:**
   ```bash
   cd frontend/web
   npm run dev
   ```
   - Debe estar en: `http://localhost:5173` (o el puerto que use Vite)

### Pasos de Prueba

**1. Login**
   - Email: `admin@bustrack.com`
   - Password: `Admin123!@#`

**2. Abrir Panel de Notificaciones**
   - Click en el icono de campana (🔔) en la barra superior
   - Debería ver notificaciones generadas desde los buses del backend

**3. Ver Notificaciones en Tiempo Real**
   - Las notificaciones se actualizan cada 30 segundos
   - Si cambias el estado de un bus en el backend, verás la notificación actualizada

**4. Verificar Estados**

   **Estado Loading:**
   - Abrir panel → Ver "Cargando notificaciones..." brevemente
   
   **Estado Error:**
   - Apagar el backend → Abrir panel → Ver mensaje de error
   
   **Estado Vacío:**
   - Si todos los buses están "moving" con GPS → "Todos los buses operan normalmente"
   
   **Con Notificaciones:**
   - Si hay buses en "maintenance" → Ver notificaciones

---

## 🔍 Endpoints del Backend Utilizados

### GET /api/v1/buses

**Usado por:** Panel de notificaciones para obtener estado de buses

**Request:**
```http
GET http://localhost:5000/api/v1/buses?pageSize=50
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "bus_abc123",
      "licensePlate": "P-123456",
      "unitName": "Ruta 29 - Bus 001",
      "status": "moving",
      "route": "Ruta 29",
      "driver": "driver-001",
      "movingTime": 3600,
      "parkedTime": 1200,
      "isFavorite": true,
      "position": {
        "lat": 13.6929,
        "lng": -89.2182
      },
      "createdAt": "2024-01-15T08:00:00.000Z",
      "updatedAt": "2024-01-15T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 5,
    "totalPages": 1,
    "hasMore": false
  }
}
```

---

## 🛠️ Troubleshooting

### Error: "No se pudo conectar al servidor"

**Causa:** Backend no está corriendo o URL incorrecta

**Solución:**
1. Verificar que backend esté en `http://localhost:5000`
2. Verificar en `src/services/api.ts` que `API_BASE_URL` es correcto
3. Revisar logs del backend para errores

### Error: "401 Unauthorized"

**Causa:** Token expirado o inválido

**Solución:**
1. Hacer logout y login nuevamente
2. Verificar que `JWT_SECRET` en backend `.env` no ha cambiado
3. Revisar que token se está guardando en localStorage

### Error: CORS

**Causa:** Frontend y backend en diferentes puertos/dominios

**Solución:**
1. Verificar `CORS_ORIGIN` en backend `.env`
2. Debe incluir: `http://localhost:5173` (o puerto del frontend)
3. Reiniciar backend después de cambiar `.env`

### No se ven notificaciones

**Causa:** Todos los buses están en estado normal

**Solución (para testing):**
1. En el backend, cambiar estado de un bus a "maintenance":
   ```bash
   curl -X PATCH http://localhost:5000/api/v1/buses/<BUS_ID> \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"status":"maintenance"}'
   ```
2. Refrescar panel de notificaciones
3. Debería ver notificación de mantenimiento

---

## 📝 Próximos Pasos

### Mejoras Sugeridas

1. **WebSockets para notificaciones en tiempo real**
   - Eliminar polling cada 30 segundos
   - Recibir notificaciones instantáneas

2. **Sistema de persistencia de notificaciones**
   - Guardar notificaciones en backend
   - Marcar como leídas persistentemente

3. **Filtros de notificaciones**
   - Por tipo (notificación/advertencia)
   - Por bus
   - Por fecha

4. **Notificaciones push**
   - Usar Web Push API
   - Notificar incluso cuando la app está cerrada

5. **Acciones desde notificaciones**
   - Click en notificación → Navegar a detalle del bus
   - Botón "Resolver" para marcar notificación como atendida

---

## 📊 Resumen

**✅ Completado:**
- Errores de sintaxis corregidos
- Servicio de API completo creado
- Panel de notificaciones conectado al backend
- Generación automática de notificaciones desde estado de buses
- Manejo de estados (loading, error, vacío)
- Auto-refresh cada 30 segundos

**🎯 Funcionalidad:**
- Frontend se comunica correctamente con backend
- Notificaciones se generan dinámicamente
- Usuario ve estado real de la flota de buses
- Sistema robusto con manejo de errores

**🚀 Listo para usar:**
- Iniciar backend → Iniciar frontend → Login → Ver notificaciones reales

---

## 🔗 Archivos Modificados/Creados

1. **`frontend/web/src/services/api.ts`** (nuevo)
   - Servicio completo de comunicación con backend

2. **`frontend/web/src/components/layout/MessagesPanel.tsx`** (modificado)
   - Errores de sintaxis corregidos
   - Integración con backend implementada
   - Sistema de notificaciones dinámico

3. **`frontend/web/INTEGRATION.md`** (nuevo)
   - Este documento de guía

---

**La integración frontend-backend está completa y funcional.** 🎉
