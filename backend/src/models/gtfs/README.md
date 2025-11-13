# 🚀 GTFS Models - Future Implementation

> **Estado:** ⚠️ **DESHABILITADO** - Listo para activar en el futuro  
> **Marcador de búsqueda:** `GTFS FUTURE IMPLEMENTATION`

## ¿Qué es esto?

Esta carpeta contiene los **modelos de dominio** para implementar el estándar **GTFS (General Transit Feed Specification)** en BusTrack SV.

Los modelos están **completamente implementados** pero **deshabilitados** para no afectar la ejecución actual del sistema.

## Modelos Implementados

### 1. **Agency** (Agencia de transporte)
- Archivo: `Agency.js`
- Representa la agencia operadora (ej: "Autobuses Metropolitanos")
- Campos: nombre, URL, timezone, idioma, teléfono, email
- Colección Firestore: `gtfs_agencies`

### 2. **Stop** (Paradas de bus)
- Archivo: `Stop.js`
- Representa paradas físicas donde suben/bajan pasajeros
- Campos: nombre, coordenadas GPS, código, tipo de localización, accesibilidad
- Colección Firestore: `gtfs_stops`

### 3. **Route** (Rutas)
- Archivo: `Route.js`
- Representa rutas de transporte (ej: "Ruta 101")
- Campos: nombre corto/largo, tipo, color, descripción
- Colección Firestore: `gtfs_routes`

### 4. **Trip** (Viajes)
- Archivo: `Trip.js`
- Representa un viaje específico de un vehículo en una ruta
- Campos: route_id, service_id, dirección, accesibilidad
- Colección Firestore: `gtfs_trips`

### 5. **StopTime** (Horarios)
- Archivo: `StopTime.js`
- Representa horarios de llegada/salida en cada parada
- Campos: trip_id, stop_id, hora llegada, hora salida, secuencia
- Colección Firestore: `gtfs_stop_times`

## Características de los Modelos

### ✅ Validación Completa
- Validación de tipos de datos
- Validación de rangos (coordenadas, colores, etc.)
- Validación de enums (tipos GTFS estándar)
- Mensajes de error descriptivos

### ✅ Encapsulación OOP
- Campos privados con `#` (JavaScript private fields)
- Getters y setters con validación
- Métodos de utilidad (isWheelchairAccessible, isBus, etc.)

### ✅ Conversión de Formatos
- `toJSON()` - Para respuestas API
- `toDatabase()` - Para guardar en Firestore
- `toGTFS()` - Para exportar a formato GTFS estándar
- `fromDatabase()` - Crear instancia desde Firestore
- `fromGTFS()` - Importar desde archivos GTFS

### ✅ Compatibilidad GTFS
- Siguiendo especificación oficial: https://gtfs.org/schedule/reference/
- Campos requeridos y opcionales según estándar
- Tipos de datos correctos
- Nomenclatura GTFS (snake_case para export)

## Estructura de Colecciones Firestore

Cuando se active GTFS, estas colecciones se crearán:

```
Firestore
├── gtfs_agencies/        # Agencias operadoras
├── gtfs_stops/           # Paradas de bus
├── gtfs_routes/          # Rutas
├── gtfs_trips/           # Viajes programados
└── gtfs_stop_times/      # Horarios por parada
```

## Índices Firestore Necesarios

Cuando se active, crear estos índices compuestos:

```javascript
// gtfs_stop_times
- tripId (ASC) + stopSequence (ASC)

// gtfs_trips
- routeId (ASC) + serviceId (ASC)

// gtfs_stops
- locationType (ASC) + parentStation (ASC)
```

## Uso Futuro

### Importar modelos:
```javascript
const { Agency, Stop, Route, Trip, StopTime } = require('../models/gtfs');
```

### Crear una parada:
```javascript
const stop = new Stop({
  id: 'STOP_001',
  name: 'Terminal de Oriente',
  lat: 13.7185,
  lng: -89.1683,
  code: 'TO-01',
  wheelchairBoarding: '1'
});

console.log(stop.isWheelchairAccessible()); // true
console.log(stop.toGTFS()); // Formato GTFS para export
```

### Crear una ruta:
```javascript
const route = new Route({
  id: 'ROUTE_101',
  shortName: '101',
  longName: 'Centro - Soyapango',
  type: '3', // Bus
  color: 'FF0000', // Rojo
  textColor: 'FFFFFF' // Blanco
});

console.log(route.isBus()); // true
console.log(route.getColorWithHash()); // '#FF0000'
```

## Relación con Sistema Actual

### Migración de `Bus` a GTFS:
```javascript
// Sistema actual
Bus {
  licensePlate: 'P-123456',
  unitName: 'Bus 1',
  route: 'Ruta 101',  // String simple
  position: { lat, lng }
}

// Sistema futuro con GTFS
Bus {
  licensePlate: 'P-123456',
  unitName: 'Bus 1',
  routeId: 'ROUTE_101',  // FK a gtfs_routes
  currentTripId: 'TRIP_001',  // FK a gtfs_trips
  position: { lat, lng }
}
```

## Referencias GTFS

- **Especificación oficial:** https://gtfs.org/schedule/reference/
- **GTFS Realtime:** https://gtfs.org/realtime/reference/
- **Mejores prácticas:** https://gtfs.org/schedule/best-practices/
- **Validador GTFS:** https://github.com/MobilityData/gtfs-validator

## Cómo Activar

Ver archivo: **`GTFS_ACTIVATION.md`** en la raíz del backend.

## Estado

- ✅ Modelos implementados
- ✅ Validación completa
- ✅ Métodos de conversión
- ⚠️ Deshabilitado (no afecta ejecución actual)
- ⏳ Pendiente: Repositorios, servicios, controladores, rutas

---

**Última actualización:** 2025-01-13  
**Desarrollado por:** BusTrack SV Team  
**Estándar:** GTFS Static v2.0

