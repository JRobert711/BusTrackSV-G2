# BusTrack SV - Integración Frontend y Backend

## Descripción
Este proyecto integra el frontend moderno de Figma AI con el backend existente de BusTrack SV, creando una aplicación completa de gestión de flotas de buses.

## Estructura del Proyecto

```
BusTrackSV-G2/
├── backend/                    # Servidor Node.js con Express
│   ├── server.js              # Servidor principal con API endpoints
│   └── package.json           # Dependencias del backend
├── frontend/
│   ├── bustrack-frontend/     # Frontend original (React)
│   ├── bustrack-frontend copy/ # Copia del frontend original
│   └── New bustrack frontend/ # Frontend moderno de Figma AI (React + TypeScript + Vite)
├── start-integrated.bat       # Script para iniciar ambos servidores
└── INTEGRATION-README.md      # Este archivo
```

## Tecnologías Utilizadas

### Backend
- **Node.js** con Express
- **JWT** para autenticación
- **CORS** para comunicación con frontend
- **Mock data** para buses y usuarios

### Frontend (New bustrack frontend)
- **React 18** con TypeScript
- **Vite** como bundler y servidor de desarrollo
- **Tailwind CSS** para estilos
- **Radix UI** para componentes
- **Lucide React** para iconos

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
  - Body: `{ username: string, password: string }`
  - Response: `{ token: string, user: { id, username, name, role } }`

### Buses
- `GET /api/buses` - Obtener lista de buses (requiere autenticación)
- `PATCH /api/buses/:id/favorite` - Actualizar favorito (requiere autenticación)

### Utilidades
- `GET /api/test` - Probar conexión

## Credenciales de Demo

### Usuario Administrador
- **Username:** `admin`
- **Password:** `admin123`
- **Rol:** Administrador
- **Permisos:** Acceso completo, gestión de flota, mensajes

### Usuario Operador
- **Username:** `operador`
- **Password:** `operador123`
- **Rol:** Operador
- **Permisos:** Visualización de buses, favoritos

## Instalación y Configuración

### 1. Instalar Dependencias del Backend
```bash
cd backend
npm install
```

### 2. Instalar Dependencias del Frontend
```bash
cd "frontend/New bustrack frontend"
npm install
```

### 3. Iniciar Servidores

#### Opción A: Script Automático (Recomendado)
```bash
# Ejecutar el script de inicio
start-integrated.bat
```

#### Opción B: Manual
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd "frontend/New bustrack frontend"
npm run dev
```

## Acceso a la Aplicación

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Test:** http://localhost:5000/api/test

## Características Principales

### Frontend Moderno
- ✅ Diseño responsive y moderno
- ✅ Componentes reutilizables con Radix UI
- ✅ Gestión de estado con React hooks
- ✅ Autenticación JWT
- ✅ Manejo de errores y estados de carga
- ✅ Simulación de movimiento en tiempo real
- ✅ Panel de gestión de flota (solo admin)
- ✅ Sistema de favoritos
- ✅ Panel de mensajes (solo admin)

### Backend Robusto
- ✅ API RESTful
- ✅ Autenticación JWT
- ✅ Middleware de CORS
- ✅ Validación de datos
- ✅ Manejo de errores
- ✅ Datos mock realistas

## Estructura de Datos

### Bus Object
```typescript
interface Bus {
  id: string;
  licensePlate: string;
  unitName: string;
  status: 'moving' | 'parked' | 'maintenance' | 'needs_urgent_maintenance' | 'usable';
  route: string;
  driver: string;
  movingTime: number;
  parkedTime: number;
  isFavorite: boolean;
}
```

### User Object
```typescript
interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'operator';
  department?: string;
  phone?: string;
  joinDate?: string;
}
```

## Configuración de Proxy

El frontend está configurado con un proxy en Vite para redirigir las llamadas a `/api/*` al backend en `http://localhost:5000`. Esto permite el desarrollo sin problemas de CORS.

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

## Desarrollo

### Agregar Nuevas Funcionalidades

1. **Backend:** Agregar endpoints en `backend/server.js`
2. **Frontend:** Actualizar `src/services/api.ts` con nuevos métodos
3. **Componentes:** Usar el servicio API en los componentes React

### Estructura de Servicios

```typescript
// src/services/api.ts
class ApiService {
  async login(credentials: LoginCredentials): Promise<LoginResponse>
  async getBuses(): Promise<Bus[]>
  async updateBusFavorite(busId: string, isFavorite: boolean): Promise<Bus>
  logout(): void
  isAuthenticated(): boolean
}
```

## Troubleshooting

### Error de Conexión
- Verificar que ambos servidores estén ejecutándose
- Comprobar que los puertos 3000 y 5000 estén disponibles
- Revisar la consola del navegador para errores de red

### Error de Autenticación
- Verificar que el token JWT esté guardado en localStorage
- Comprobar que las credenciales sean correctas
- Revisar que el backend esté respondiendo en `/api/auth/login`

### Error de CORS
- El proxy de Vite debería manejar esto automáticamente
- En caso de problemas, verificar la configuración del proxy en `vite.config.ts`

## Próximos Pasos

- [ ] Integrar base de datos real (MongoDB/PostgreSQL)
- [ ] Agregar WebSockets para actualizaciones en tiempo real
- [ ] Implementar sistema de notificaciones push
- [ ] Agregar pruebas unitarias y de integración
- [ ] Configurar CI/CD
- [ ] Optimizar para producción

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

