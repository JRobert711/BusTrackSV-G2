# 🚌 BusTrack SV - Instrucciones Rápidas

## ⚡ Inicio Rápido

### 1. Ejecutar la Aplicación
**Opción más fácil:** Doble clic en `start-servers.bat`

**Opción manual:**
1. Abrir terminal en la carpeta `backend` y ejecutar: `node server.js`
2. Abrir otra terminal en la carpeta `frontend/bustrack-frontend` y ejecutar: `npm start`

### 2. Acceder a la Aplicación
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

### 3. Credenciales de Login
- **Usuario:** admin
- **Contraseña:** admin123

## 🎯 Funcionalidades

### Pantalla de Login
- Diseño moderno y profesional
- Validación de credenciales
- Manejo de errores
- Credenciales visibles para pruebas

### Home Page
- Lista completa de buses (12 buses)
- Búsqueda por placa, ruta o conductor
- Filtros por estado (Todos, En Movimiento, Estacionado)
- Sistema de favoritos funcional
- Estadísticas en tiempo real:
  - Total: 12 buses
  - Favoritos: 4 buses
  - En movimiento: 5 buses
  - Parados: 7 buses

### Información de cada Bus
- Placa y número de unidad
- Estado actual (Estacionado/En Movimiento)
- Ruta asignada
- Conductor asignado
- Tiempo en movimiento
- Tiempo estacionado
- Botón de favorito

## 🔧 Solución de Problemas

### Error de Conexión
1. Verificar que el backend esté ejecutándose en puerto 5000
2. Verificar que el frontend esté ejecutándose en puerto 3000
3. Usar el script `start-servers.bat` para inicio automático

### Puerto Ocupado
- Cambiar el puerto del backend en `backend/server.js` (línea 255)
- Cambiar el puerto del frontend en `frontend/bustrack-frontend/package.json`

## 📱 Diseño Responsive
La aplicación está optimizada para:
- Desktop (recomendado)
- Tablet
- Móvil

## 🎨 Características del Diseño
- Interfaz limpia y moderna
- Colores azules corporativos
- Iconos intuitivos
- Tipografía clara y legible
- Espaciado consistente
- Efectos hover suaves

¡La aplicación está lista para usar! 🚀
