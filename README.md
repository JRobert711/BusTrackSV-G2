# BusTrack SV - Sistema de Seguimiento de Flota de Buses

## Descripción
BusTrack SV es una aplicación web moderna para el seguimiento y gestión de flotas de buses. La aplicación incluye un sistema de autenticación y una interfaz intuitiva para monitorear el estado de los buses en tiempo real.

## Características
- 🔐 Sistema de autenticación con JWT
- 📱 Interfaz moderna y responsive
- 🔍 Búsqueda y filtrado de buses
- ⭐ Sistema de favoritos
- 📊 Estadísticas en tiempo real
- 🚌 Seguimiento de estado de buses (En movimiento, Estacionado, Mantenimiento)

## Tecnologías Utilizadas

### Frontend
- React 18
- Tailwind CSS
- Lucide React (iconos)
- Radix UI (componentes)

### Backend
- Node.js
- Express.js
- JWT (JSON Web Tokens)
- CORS

## Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd BusTrackSV-G2
   ```

2. **Instalar dependencias del Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Instalar dependencias del Frontend**
   ```bash
   cd ../frontend/bustrack-frontend
   npm install
   ```

## Ejecución

### 1. Iniciar el Backend
```bash
cd backend
npm start
```
El servidor backend se ejecutará en `http://localhost:5000`

### 2. Iniciar el Frontend
```bash
cd frontend/bustrack-frontend
npm start
```
La aplicación frontend se ejecutará en `http://localhost:3000`

## Credenciales de Acceso

### Usuario Administrador
- **Usuario:** admin
- **Contraseña:** admin123

### Usuario Operador
- **Usuario:** operador
- **Contraseña:** operador123

## Estructura del Proyecto

```
BusTrackSV-G2/
├── backend/
│   ├── server.js          # Servidor principal
│   ├── package.json       # Dependencias del backend
│   └── node_modules/      # Módulos instalados
├── frontend/
│   └── bustrack-frontend/
│       ├── src/
│       │   ├── components/
│       │   │   ├── Login.js      # Componente de login
│       │   │   ├── HomePage.js   # Página principal
│       │   │   └── ui/           # Componentes UI reutilizables
│       │   ├── App.js           # Componente principal
│       │   └── App.css          # Estilos globales
│       ├── package.json          # Dependencias del frontend
│       └── node_modules/         # Módulos instalados
└── README.md
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión

### Buses
- `GET /api/buses` - Obtener lista de buses (requiere autenticación)
- `PATCH /api/buses/:id/favorite` - Actualizar estado de favorito (requiere autenticación)

### General
- `GET /api/test` - Verificar estado del servidor

## Funcionalidades

### Pantalla de Login
- Diseño moderno y responsive
- Validación de credenciales
- Manejo de errores
- Credenciales de demostración visibles

### Home Page
- Lista completa de buses con información detallada
- Búsqueda por placa, ruta o conductor
- Filtros por estado (Todos, En Movimiento, Estacionado, Mantenimiento)
- Sistema de favoritos
- Estadísticas en tiempo real
- Información de cada bus:
  - Placa y unidad
  - Estado actual
  - Ruta asignada
  - Conductor
  - Tiempo en movimiento
  - Tiempo estacionado

## Desarrollo

### Scripts Disponibles

#### Backend
- `npm start` - Iniciar servidor en modo producción
- `npm run dev` - Iniciar servidor en modo desarrollo con nodemon

#### Frontend
- `npm start` - Iniciar aplicación en modo desarrollo
- `npm run build` - Construir aplicación para producción
- `npm test` - Ejecutar tests

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Para preguntas o sugerencias, por favor contacta al equipo de desarrollo.