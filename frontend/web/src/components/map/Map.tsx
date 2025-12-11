import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl, { Map as MapboxMap, Marker, Popup } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Configuración de Mapbox
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN?.trim();
const HAS_MAPBOX_TOKEN = !!MAPBOX_TOKEN;

if (HAS_MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
} else {
  console.warn('⚠️  VITE_MAPBOX_TOKEN is not defined. Mapbox features will be disabled.');
}

// Coordenadas de El Salvador - configurables via variables de entorno
const EL_SALVADOR_CENTER: [number, number] = [
  parseFloat(import.meta.env.VITE_MAP_CENTER_LNG || '-88.9149'),
  parseFloat(import.meta.env.VITE_MAP_CENTER_LAT || '13.7942')
];
const EL_SALVADOR_BOUNDS: mapboxgl.LngLatBoundsLike = [
  [parseFloat(import.meta.env.VITE_MAP_BOUNDS_SW_LNG || '-89.4'), parseFloat(import.meta.env.VITE_MAP_BOUNDS_SW_LAT || '13.6')], // Suroeste
  [parseFloat(import.meta.env.VITE_MAP_BOUNDS_NE_LNG || '-89.1'), parseFloat(import.meta.env.VITE_MAP_BOUNDS_NE_LAT || '13.8')]  // Noreste (zoom a San Salvador)
];

interface Position {
  lat: number;
  lng: number;
}

interface Stop {
  id: string;
  name: string;
  position: Position;
}

// Paradas - deberían venir del backend, pero por ahora están aquí como fallback
// TODO: Mover esto a una API endpoint o variable de entorno
const getDefaultStops = (): Stop[] => {
  const stopsEnv = import.meta.env.VITE_BUS_STOPS;
  if (stopsEnv) {
    try {
      return JSON.parse(stopsEnv);
    } catch (e) {
      console.warn('Failed to parse VITE_BUS_STOPS, using defaults', e);
    }
  }
  // Fallback a paradas por defecto en San Salvador
  return [
    { 
      id: 'stop-1',
      name: 'Terminal de Occidente',
      position: { lat: 13.7209, lng: -89.2331 } 
    },
    { 
      id: 'stop-2',
      name: 'Plaza Merliot',
      position: { lat: 13.7235, lng: -89.2398 } 
    },
    { 
      id: 'stop-3',
      name: 'Metrocentro',
      position: { lat: 13.6998, lng: -89.2265 } 
    },
    { 
      id: 'stop-4',
      name: 'Centro Histórico',
      position: { lat: 13.6831, lng: -89.2367 } 
    },
    { 
      id: 'stop-5',
      name: 'Universidad de El Salvador',
      position: { lat: 13.7119, lng: -89.2005 } 
    },
  ];
};

const STOPS: Stop[] = getDefaultStops();

interface Bus {
  id: string;
  licensePlate: string;
  route: string;
  status: 'moving' | 'parked' | 'maintenance' | 'needs_urgent_maintenance' | 'usable';
  position: Position;
  driver: string;
  parkedTime?: number;
  movingTime?: number;
  isFavorite: boolean;
  routeCoordinates?: Position[];
  currentPositionInRoute?: number;
  currentStopIndex?: number;
}

interface MapProps {
  buses?: Bus[];
  onBusSelect?: (busId: string) => void;
  selectedBusId?: string | null;
  onMapClick?: (position: Position) => void;
  isSelectingRoutePoints?: boolean;
  routePoints?: Position[];
}

const BUS_STATUS_COLORS = {
  moving: '#4CAF50',
  parked: '#2196F3',
  maintenance: '#FFC107',
  needs_urgent_maintenance: '#F44336',
  usable: '#9E9E9E'
} as const;

// Generar coordenadas entre dos puntos (simulación de ruta) con ligera curvatura
const generateRoute = (start: Position, end: Position, points = 20): Position[] => {
  const route: Position[] = [];
  const latStep = (end.lat - start.lat) / points;
  const lngStep = (end.lng - start.lng) / points;

  // Pequeña curva para que la línea no sea perfectamente recta
  const curve = (t: number) => Math.sin(t * Math.PI) * 0.00055;

  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const latOffset = curve(t) * (i % 2 === 0 ? 1 : -1);
    const lngOffset = curve(t) * (i % 3 === 0 ? 1 : -1);

    route.push({
      lat: start.lat + (latStep * i) + latOffset,
      lng: start.lng + (lngStep * i) + lngOffset
    });
  }

  return route;
};

// Generar ruta que pase por todas las paradas
const generateFullRoute = (stops: Stop[]): Position[] => {
  let fullRoute: Position[] = [];
  
  for (let i = 0; i < stops.length - 1; i++) {
    const segment = generateRoute(stops[i].position, stops[i + 1].position);
    fullRoute = [...fullRoute, ...segment];
  }
  
  return fullRoute;
};



// Ícono SVG personalizado para los marcadores
const createBusIcon = (color: string) => {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 1C14.9 1 14 1.9 14 3V4H10V3C10 1.9 9.1 1 8 1C6.9 1 6 1.9 6 3V4H5C3.9 4 3 4.9 3 6V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V6C21 4.9 20.1 4 19 4H18V3C18 1.9 17.1 1 16 1ZM8 3C8 2.45 8.45 2 9 2C9.55 2 10 2.45 10 3V4H8V3ZM16 4V3C16 2.45 15.55 2 15 2C14.45 2 14 2.45 14 3V4H16ZM19 19H5V6H19V19Z" fill="${color}"/>
      <path d="M7 11H9V13H7V11ZM15 11H17V13H15V11Z" fill="${color}"/>
    </svg>`
  )}`;
};

// GeoJSON feature type for routes
type RouteFeature = GeoJSON.Feature<GeoJSON.LineString>;

// Function to create a bus marker
const createBusMarker = (bus: Bus, mapInstance: MapboxMap, onClick: (busId: string) => void) => {
  const el = document.createElement('div');
  el.className = 'bus-marker';
  
  // Create a child element for the emoji to avoid positioning issues
  const inner = document.createElement('div');
  inner.innerHTML = '🚌';
  inner.style.fontSize = '32px';
  inner.style.lineHeight = '1';
  inner.style.margin = '0';
  inner.style.padding = '0';
  
  el.appendChild(inner);
  el.style.cursor = 'pointer';
  el.style.width = '32px';
  el.style.height = '32px';
  el.style.margin = '0';
  el.style.padding = '0';
  el.style.border = 'none';
  el.style.background = 'none';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.onpointerdown = (e) => {
    e.stopPropagation();
    onClick(bus.id);
  };

  const marker = new Marker({ element: el, anchor: 'center' });
  marker.setLngLat([bus.position.lng, bus.position.lat]);
  marker.addTo(mapInstance);
  
  return marker;
};

// Function to update the bus route on the map (uses typed GeoJSON)
const updateBusRoute = (bus: Bus, mapInstance: MapboxMap) => {
  if (!bus.routeCoordinates || bus.routeCoordinates.length === 0) return;
  const routeFeature: RouteFeature = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: bus.routeCoordinates.map(coord => [coord.lng, coord.lat])
    }
  };

  const addOrUpdate = () => {
    try {
      const routeSource = mapInstance.getSource('route');
      if (!routeSource) {
        mapInstance.addSource('route', {
          type: 'geojson',
          data: routeFeature
        });

        mapInstance.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 4,
            'line-opacity': 1
          }
        });
      } else {
        (routeSource as mapboxgl.GeoJSONSource).setData(routeFeature);
      }
    } catch (err) {
      console.warn('Failed to add/update route source/layer:', err);
    }
  };

  try {
    // If style is loaded, apply immediately; otherwise wait for 'load'
    if ((mapInstance as any).loaded && (mapInstance as any).loaded()) {
      addOrUpdate();
    } else {
      mapInstance.once('load', addOrUpdate);
    }
  } catch (err) {
    // Fallback retry
    setTimeout(() => {
      try { addOrUpdate(); } catch (e) { console.warn('Retry failed to add route', e); }
    }, 300);
  }
};

export default function Map({ buses = [], onBusSelect = () => {}, selectedBusId, onMapClick, isSelectingRoutePoints, routePoints = [] }: MapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapboxMap | null>(null);
  const firstFitRef = useRef(false);
  const markersRef = useRef<{[key: string]: Marker}>({});
  const [error, setError] = useState<string | null>(null);

  // Función para inicializar el mapa
  const initializeMap = useCallback(() => {
    if (!mapContainer.current) return () => {};

    // Don't initialize if Mapbox token is not configured
    if (!HAS_MAPBOX_TOKEN) {
      setError('Mapbox token no configurado. Por favor, configura VITE_MAPBOX_TOKEN en tu archivo .env');
      return () => {};
    }

    // Remove existing map if it exists
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    try {
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: EL_SALVADOR_CENTER,
        zoom: 13,
        bounds: EL_SALVADOR_BOUNDS
      });

      // Save reference so other effects can use it
      map.current = mapInstance;

      // Agregar controles de navegación
      mapInstance.addControl(new mapboxgl.NavigationControl());

      // Manejar errores de carga del mapa
      mapInstance.on('error', (e) => {
        console.error('Error al cargar el mapa:', e.error);
        setError('Error al cargar el mapa. Por favor, haz clic en Reintentar.');
      });

      // Limpieza
      return () => {
        if (mapInstance) {
          mapInstance.remove();
          if (map.current === mapInstance) {
            map.current = null;
          }
        }
      };
    } catch (err: any) {
      console.error('Error inicializando mapa:', err);
      setError('Error al inicializar el mapa. Verifica que VITE_MAPBOX_TOKEN esté configurado correctamente.');
      return () => {};
    }
  }, []);

  // Initialize map when component mounts
  useEffect(() => {
    const cleanup = initializeMap();
    return cleanup;
  }, [initializeMap]);

  // Handle map clicks for route point selection
  useEffect(() => {
    if (!HAS_MAPBOX_TOKEN || !map.current || !isSelectingRoutePoints) return;

    const handleMapClick = (e: any) => {
      const { lat, lng } = e.lngLat;
      if (onMapClick) {
        onMapClick({ lat, lng });
      }
    };

    map.current.on('click', handleMapClick);

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
      }
    };
  }, [isSelectingRoutePoints, onMapClick]);

  // Ensure map and markers are cleaned up on unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        try {
          map.current.remove();
        } catch (err) {
          // ignore
        }
        map.current = null;
      }

      Object.values(markersRef.current).forEach(marker => {
        try { marker.remove(); } catch (err) { /* ignore */ }
      });
      markersRef.current = {};
    };
  }, []);

  // Handle route points visualization
  useEffect(() => {
    if (!HAS_MAPBOX_TOKEN || !map.current || !isSelectingRoutePoints) {
      // Remove layers when not selecting
      if (map.current) {
        if (map.current.getLayer('route-points-text')) {
          map.current.removeLayer('route-points-text');
        }
        if (map.current.getLayer('route-points')) {
          map.current.removeLayer('route-points');
        }
        if (map.current.getSource('route-points')) {
          map.current.removeSource('route-points');
        }
      }
      return;
    }

    // Wait for map to load
    if (!map.current.loaded()) {
      map.current.once('load', () => {
        updateRoutePointsVisualization();
      });
      return;
    }

    updateRoutePointsVisualization();

    function updateRoutePointsVisualization() {
      if (!map.current) return;

      // Remove existing route points layers
      if (map.current.getLayer('route-points-text')) {
        map.current.removeLayer('route-points-text');
      }
      if (map.current.getLayer('route-points')) {
        map.current.removeLayer('route-points');
      }
      if (map.current.getSource('route-points')) {
        map.current.removeSource('route-points');
      }

      // If no points, don't add layers
      if (routePoints.length === 0) return;

      // Add source for route points
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: routePoints.map((point, idx) => ({
          type: 'Feature',
          properties: { index: idx, type: idx === 0 ? 'start' : 'end' },
          geometry: { type: 'Point', coordinates: [point.lng, point.lat] }
        }))
      };

      map.current.addSource('route-points', {
        type: 'geojson',
        data: geojson
      });

      // Add layer for route points
      map.current.addLayer({
        id: 'route-points',
        type: 'circle',
        source: 'route-points',
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'type'], 'start'],
            12,
            12
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'type'], 'start'],
            '#4CAF50',
            '#2196F3'
          ],
          'circle-opacity': 0.9,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#fff'
        }
      });

      // Add text layer for point numbers
      map.current.addLayer({
        id: 'route-points-text',
        type: 'symbol',
        source: 'route-points',
        layout: {
          'text-field': ['+', ['get', 'index'], 1],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 16,
          'text-offset': [0, 0],
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#fff',
          'text-halo-color': '#000',
          'text-halo-width': 2
        }
      });
    }
  }, [isSelectingRoutePoints, routePoints]);

  // Handle bus updates
  useEffect(() => {
    if (!HAS_MAPBOX_TOKEN || !map.current || buses.length === 0) return;

    // Update or create bus markers
    buses.forEach(bus => {
      if (markersRef.current[bus.id]) {
        // Update existing marker
        markersRef.current[bus.id].setLngLat([bus.position.lng, bus.position.lat]);
      } else {
        // Create new marker
        markersRef.current[bus.id] = createBusMarker(bus, map.current!, onBusSelect);
      }

      // Update the route for the first bus
      if (bus.id === buses[0].id) {
        updateBusRoute(bus, map.current!);
      }
    });

    // Do not auto-zoom on every update. We'll fit bounds only once on first load.

    // Cleanup function to remove markers when component unmounts or buses change
    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
    };
  }, [buses, onBusSelect]);

  // Fit map bounds only the first time buses are available
  useEffect(() => {
    if (!HAS_MAPBOX_TOKEN) return;
    const currentMap = map.current;
    if (!currentMap || buses.length === 0 || firstFitRef.current) return;

    const bounds = new mapboxgl.LngLatBounds();
    buses.forEach(bus => bounds.extend([bus.position.lng, bus.position.lat]));
    // include route coordinates from all buses
    buses.forEach(bus => {
      bus.routeCoordinates?.forEach(rc => bounds.extend([rc.lng, rc.lat]));
    });

    if (!bounds.isEmpty()) {
      try {
        currentMap.fitBounds(bounds, { padding: 50 });
        firstFitRef.current = true;
      } catch (err) {
        console.warn('fitBounds failed on first fit:', err);
      }
    }
  }, [buses]);

  // When a bus is selected, zoom and center on it for better visibility
  useEffect(() => {
    if (!HAS_MAPBOX_TOKEN || !map.current || !selectedBusId) return;
    const bus = buses.find(b => b.id === selectedBusId);
    if (!bus) return;
    try {
      // Fly to the bus with zoom level 16 for good visibility
      map.current.flyTo({
        center: [bus.position.lng, bus.position.lat],
        zoom: 16,
        duration: 1000
      });
    } catch (err) {
      console.warn('flyTo failed:', err);
    }
  }, [selectedBusId, buses]);

  useEffect(() => {
    if (!HAS_MAPBOX_TOKEN) return;
    const currentMap = map.current;
    if (!currentMap) return;

    // Agregar ruta del bus (asegurarse de que el estilo esté cargado antes)
    if (buses[0]?.routeCoordinates) {
      const addRouteIfNeeded = () => {
        if (!currentMap.getSource('route')) {
          currentMap.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: buses[0].routeCoordinates!.map(p => [p.lng, p.lat])
              }
            }
          });

          currentMap.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3B82F6',
              'line-width': 4
            }
          });
        }
      };

      if ((currentMap as any).loaded && (currentMap as any).loaded()) {
        addRouteIfNeeded();
      } else {
        currentMap.once('load', addRouteIfNeeded);
      }
    }

      // Agregar o actualizar marcador del bus
      const bus = buses[0];
      if (bus && currentMap) {
        if (!markersRef.current['bus']) {
          markersRef.current['bus'] = createBusMarker(bus, currentMap, onBusSelect || (() => {}));
        } else {
          markersRef.current['bus'].setLngLat([bus.position.lng, bus.position.lat]);
        }
      }

    // Agregar marcadores de paradas
    STOPS.forEach((stop, index) => {
      const stopId = `stop-${index}`;
      if (!markersRef.current[stopId]) {
        const el = document.createElement('div');
        el.className = 'stop-marker';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.background = '#4F46E5';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';

        if (currentMap) {
          const marker = new Marker({ element: el })
            .setLngLat([stop.position.lng, stop.position.lat])
            .setPopup(new Popup().setHTML(`<div class="p-2"><strong>${stop.name}</strong></div>`))
            .addTo(currentMap);
        
          markersRef.current[stopId] = marker;
        }
      }
    });

    // No ajustar la vista aquí: el ajuste inicial se hace en el efecto dedicado
    // Evitamos llamar a `fitBounds` en cada actualización de posición para
    // permitir que el usuario navegue libremente mientras los buses se mueven.

    // Limpieza
    return () => {
      const currentMap = map.current;
      if (!currentMap) return;
      
      try {
        if (currentMap.getLayer('route')) {
          currentMap.removeLayer('route');
        }
        if (currentMap.getSource('route')) {
          currentMap.removeSource('route');
        }
      } catch (error) {
        console.warn('Error during map cleanup:', error);
      }
    };
  }, [buses.length, buses[0]?.routeCoordinates?.length]);

  // Efecto para dibujar la ruta y paradas
  useEffect(() => {
    if (!HAS_MAPBOX_TOKEN || !map.current || !buses.length) return;

    // Asegurarse de que el mapa esté cargado y luego dibujar ruta y paradas
    const onMapLoad = () => {
      if (!map.current) return;

      if (!map.current.getSource('route') && buses[0]?.routeCoordinates) {
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: buses[0].routeCoordinates.map(pos => [pos.lng, pos.lat])
            }
          }
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3B82F6',
            'line-width': 4,
            'line-opacity': 1
          }
        });
      }

      // Añadir marcadores de paradas
      STOPS.forEach((stop, index) => {
        const el = document.createElement('div');
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.background = '#4F46E5';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';

        // Crear y agregar marcador
        const marker = new Marker({ element: el })
          .setLngLat([stop.position.lng, stop.position.lat])
          .setPopup(new Popup().setHTML(`<div class="p-2"><strong>${stop.name}</strong></div>`))
          .addTo(map.current!);
        
        // Guardar referencia al marcador
        markersRef.current[`stop-${stop.id}`] = marker;
        markersRef.current[`stop-${index}`] = marker;
      });
    };

    // Ejecutar inmediatamente si ya está cargado, o escuchar 'load'
    if ((map.current as any)?.loaded && (map.current as any).loaded()) {
      onMapLoad();
    } else {
      map.current!.once('load', onMapLoad);
    }

    // Función de limpieza
    const cleanup = () => {
      // Eliminar marcadores de paradas
      STOPS.forEach((_, index) => {
        const stopId = `stop-${index}`;
        if (markersRef.current[stopId]) {
          markersRef.current[stopId].remove();
          delete markersRef.current[stopId];
        }
      });
      
      // Eliminar capa de ruta seleccionada si existe
      if (map.current) {
        if (map.current.getLayer('selected-route')) {
          map.current.removeLayer('selected-route');
        }
        if (map.current.getSource('selected-route')) {
          map.current.removeSource('selected-route');
        }
      }
    };

    return cleanup;
  }, []); // Empty dependency array means this effect runs once on mount

  // Show error message if Mapbox token is not configured
  if (!HAS_MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full relative">
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center p-4 text-center z-10">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Mapa no disponible</h3>
            <p className="text-gray-600 mb-4">
              El token de Mapbox no está configurado. Para habilitar el mapa:
            </p>
            <div className="text-left bg-gray-50 p-3 rounded mb-4 font-mono text-sm">
              <p className="mb-1">1. Obtén un token en:</p>
              <a 
                href="https://account.mapbox.com/access-tokens/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://account.mapbox.com/access-tokens/
              </a>
              <p className="mt-3 mb-1">2. Agrega a tu archivo .env:</p>
              <code className="text-xs">VITE_MAPBOX_TOKEN=tu_token_aqui</code>
            </div>
            <p className="text-sm text-gray-500">
              El mapa se deshabilitará hasta que se configure el token.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {error && (
        <div className="absolute inset-0 bg-red-50 flex items-center justify-center p-4 text-center z-10">
          <div className="bg-white p-4 rounded-lg shadow-md max-w-md">
            <h3 className="text-lg font-medium text-red-600 mb-2">Error en el mapa</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                initializeMap();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Add some basic styling for the bus marker */}
      <style>{`
        .bus-marker {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .bus-marker > div {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.16s ease-in-out;
        }
        .bus-marker > div:hover {
          transform: scale(1.15);
        }
        .bus-marker > div:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
}
