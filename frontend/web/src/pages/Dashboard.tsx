import React, { useState, useEffect, useMemo } from 'react';
import Map from '../components/map/Map';
import { BusList } from '../components/bus/BusList';
import { BusDetails } from '../components/bus/BusDetails';
import { Header } from '../components/layout//Header';
import { MessagesPanel } from '../components/layout/MessagesPanel';
import { FleetManagement } from './FleetManagement';
import { UserManagement } from './UserManagement';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import type { User } from './LoginPage';
import { api, type Bus as ApiBus } from '../services/api';
import { toast } from '../utils/toast';

interface Position {
  lat: number;
  lng: number;
}

interface Bus extends Omit<ApiBus, 'status' | 'position' | 'driver'> {
  status: 'moving' | 'parked' | 'maintenance' | 'needs_urgent_maintenance' | 'usable';
  position: Position;
  driver: string; // Convert null to string for local use
  routeCoordinates?: Position[];
  currentPositionInRoute?: number;
  currentStopIndex?: number;
}

// Definir las paradas en San Salvador
interface BusStop {
  id: string;
  name: string;
  position: Position;
}

// Paradas - deberían venir del backend, pero por ahora están aquí como fallback
// TODO: Mover esto a una API endpoint
const getDefaultStops = (): BusStop[] => {
  const stopsEnv = import.meta.env.VITE_BUS_STOPS;
  if (stopsEnv) {
    try {
      return JSON.parse(stopsEnv);
    } catch (e) {
      console.warn('Failed to parse VITE_BUS_STOPS, using defaults', e);
    }
  }
  // Fallback a paradas por defecto
  return [
    { 
      id: 'terminal-occidente',
      name: 'Terminal de Occidente', 
      position: { lat: 13.7209, lng: -89.2331 }
    },
    { 
      id: 'metrocentro',
      name: 'Metrocentro', 
      position: { lat: 13.6998, lng: -89.2265 }
    }
  ];
};

const STOPS: BusStop[] = getDefaultStops();

interface DashboardProps {
  user: User;
  onNavigate: (view: 'dashboard' | 'profile' | 'settings' | 'driver') => void;
  onLogout: () => void;
}

// Fallback route generator (simple linear with slight curve)
const generateRoute = (start: Position, end: Position, points = 20): Position[] => {
  const route: Position[] = [];
  const latStep = (end.lat - start.lat) / points;
  const lngStep = (end.lng - start.lng) / points;
  const curve = (t: number) => Math.sin(t * Math.PI) * 0.0005;

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

// Fetch directions from Mapbox Directions API (returns array of Position)
async function fetchDirections(start: Position, end: Position): Promise<Position[]> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN?.trim();
  if (!token) {
    // Silently use fallback route if token is not configured
    return generateRoute(start, end);
  }
  
  try {
    const coords = `${start.lng},${start.lat};${end.lng},${end.lat}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${token}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Directions API error ${res.status}`);
    const data = await res.json();
    const coordsArr: [number, number][] = data.routes?.[0]?.geometry?.coordinates;
    if (!coordsArr) return generateRoute(start, end);
    return coordsArr.map(([lng, lat]) => ({ lat, lng }));
  } catch (err) {
    console.warn('Failed to fetch directions, falling back to simple route', err);
    return generateRoute(start, end);
  }
}

export function Dashboard({ user, onNavigate, onLogout }: DashboardProps) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [detailsBus, setDetailsBus] = useState<string | null>(null);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [fleetManagementOpen, setFleetManagementOpen] = useState(false);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectingRoutePoints, setSelectingRoutePoints] = useState(false);
  const [routePoints, setRoutePoints] = useState<Position[]>([]);
  const [routeNameForPoints, setRouteNameForPoints] = useState('');

  // Load buses from backend on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const response = await api.getBuses({ pageSize: 100 });
        
        if (!mounted) return;

        // Map API buses to local Bus interface with route coordinates
        const mappedBuses: Bus[] = await Promise.all(
          response.data.map(async (apiBus) => {
            // If bus has position and route, generate route coordinates
            let routeCoordinates: Position[] | undefined;
            let currentPositionInRoute = 0;
            let currentStopIndex = 0;

            if (apiBus.position && apiBus.route && STOPS.length >= 2) {
              try {
                // Use first two stops for route generation
                const start = STOPS[0].position;
                const end = STOPS[1].position;
                routeCoordinates = await fetchDirections(start, end);
                // Set initial position to start of route
                currentPositionInRoute = 0;
                currentStopIndex = 0;
              } catch (err) {
                console.warn(`Failed to generate route for bus ${apiBus.id}:`, err);
              }
            }

            return {
              ...apiBus,
              status: apiBus.status as 'moving' | 'parked' | 'maintenance',
              position: apiBus.position || { lat: 13.7942, lng: -88.9149 }, // Default to El Salvador center
              routeCoordinates,
              currentPositionInRoute,
              currentStopIndex,
              driver: apiBus.driver ?? 'Sin asignar' // Convert null to string
            } as Bus;
          })
        );

        setBuses(mappedBuses);
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to load buses:', err);
        toast.error('Error al cargar buses', {
          description: err.error || 'No se pudieron cargar los buses desde el servidor'
        });
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // Efecto para animar el bus y manejar cambios de parada/recálculo de ruta
  // También actualiza la posición en el backend periódicamente
  useEffect(() => {
    if (buses.length === 0) return;

    let isActive = true;
    const interval = setInterval(() => {
      const needsRecalc: Array<{ id: string; nextStopIndex: number; currentStopIndex: number }> = [];
      const needsPositionUpdate: Array<{ id: string; position: Position }> = [];

      setBuses(prevBuses => prevBuses.map(bus => {
        if (!bus.routeCoordinates || bus.routeCoordinates.length === 0) return bus;

        const currentPosition = bus.currentPositionInRoute ?? 0;
        const nextPosition = (currentPosition + 1) % bus.routeCoordinates.length;
        const isAtEnd = nextPosition === 0;

        const progress = nextPosition / (bus.routeCoordinates.length - 1 || 1);
        const currentStopIndex = Math.floor(progress * (STOPS.length - 1));

        const newPosition = { ...bus.routeCoordinates[nextPosition] };

        const updatedBus: Bus = {
          ...bus,
          position: newPosition,
          currentPositionInRoute: nextPosition,
          currentStopIndex,
          status: bus.status === 'maintenance' ? bus.status : 'moving' as const
        };

        // Queue position update for backend (only for moving buses)
        if (updatedBus.status === 'moving') {
          needsPositionUpdate.push({ id: bus.id, position: newPosition });
        }

        if (isAtEnd && STOPS.length > 1) {
          const nextStopIndex = ((bus.currentStopIndex ?? 0) + 1) % STOPS.length;
          needsRecalc.push({ id: bus.id, nextStopIndex, currentStopIndex: bus.currentStopIndex ?? 0 });
        }

        return updatedBus;
      }));

      // Update positions in backend (throttled - only every 5 seconds)
      if (needsPositionUpdate.length > 0 && Date.now() % 5000 < 500) {
        needsPositionUpdate.forEach(async (info) => {
          if (!isActive) return;
          try {
            await api.updateBusPosition(info.id, info.position);
          } catch (err) {
            console.warn('Failed to update bus position in backend:', err);
          }
        });
      }

      // For any bus that reached the end, recalculate the route asynchronously using Directions API
      if (needsRecalc.length > 0) {
        needsRecalc.forEach(async (info) => {
          if (!isActive) return;
          const currentStop = STOPS[info.currentStopIndex];
          const nextStop = STOPS[info.nextStopIndex];
          try {
            const newRoute = await fetchDirections(currentStop.position, nextStop.position);
            setBuses(prev => prev.map(b => b.id === info.id ? ({ ...b, routeCoordinates: newRoute, currentPositionInRoute: 0, currentStopIndex: info.nextStopIndex, route: `Ruta 101: ${currentStop.name} a ${nextStop.name}` }) : b));
          } catch (err) {
            console.warn('Failed to recalc route for bus', info.id, err);
          }
        });
      }

    }, 500);

    return () => { isActive = false; clearInterval(interval); };
  }, [buses.length]);

  const handleBusSelect = (busId: string) => {
    setSelectedBus(busId);
    setDetailsBus(busId);
  };

  const handleToggleFavorite = async (busId: string) => {
    try {
      const response = await api.toggleFavorite(busId);
      setBuses(prevBuses =>
        prevBuses.map(bus =>
          bus.id === busId
            ? { ...bus, isFavorite: response.bus.isFavorite }
            : bus
        )
      );
    } catch (err: any) {
      console.error('Failed to toggle favorite:', err);
      toast.error('Error al actualizar favorito', {
        description: err.error || 'No se pudo actualizar el estado de favorito'
      });
    }
  };

  const handleCloseDetails = () => {
    setDetailsBus(null);
    setSelectedBus(null);
  };

  const handleUpdateBus = async (busId: string, updates: Partial<Bus>) => {
    try {
      // Convert local Bus updates to API Bus format
      const apiUpdates: Partial<ApiBus> = {
        ...updates,
        status: updates.status as 'parked' | 'moving' | 'maintenance' | undefined,
        position: updates.position || undefined
      };
      
      // Remove local-only fields
      delete (apiUpdates as any).routeCoordinates;
      delete (apiUpdates as any).currentPositionInRoute;
      delete (apiUpdates as any).currentStopIndex;

      const response = await api.updateBus(busId, apiUpdates);
      
      setBuses(prevBuses =>
        prevBuses.map(bus =>
          bus.id === busId
            ? { 
                ...bus, 
                ...response.bus, 
                position: response.bus.position || bus.position,
                driver: response.bus.driver || 'Sin asignar' // Convert null to string
              } as Bus
            : bus
        )
      );
      
      toast.success('Bus actualizado', {
        description: `Se actualizó ${response.bus.licensePlate}`
      });
    } catch (err: any) {
      console.error('Failed to update bus:', err);
      toast.error('Error al actualizar bus', {
        description: err.error || 'No se pudo actualizar el bus'
      });
    }
  };

  const handleDeleteBus = async (busId: string) => {
    try {
      await api.deleteBus(busId);
      setBuses(prevBuses => prevBuses.filter(bus => bus.id !== busId));
      setDetailsBus(null);
      setSelectedBus(null);
      toast.success('Bus eliminado', {
        description: 'El bus ha sido eliminado exitosamente'
      });
    } catch (err: any) {
      console.error('Failed to delete bus:', err);
      toast.error('Error al eliminar bus', {
        description: err.error || 'No se pudo eliminar el bus'
      });
    }
  };

  const handleStartSelectingRoutePoints = () => {
    setSelectingRoutePoints(true);
    setRoutePoints([]);
  };

  const handleMapClick = (position: Position) => {
    if (!selectingRoutePoints) return;
    
    setRoutePoints(prev => {
      if (prev.length < 2) {
        return [...prev, position];
      }
      return prev;
    });
  };

  const handleCancelRouteSelection = () => {
    setSelectingRoutePoints(false);
    setRoutePoints([]);
    setRouteNameForPoints('');
  };

  const handleAddBus = async (newBus: Partial<Bus> & { licensePlate: string; route: string; driver: string; status: 'moving' | 'parked' | 'maintenance' }) => {
    try {
      // Convert to API format (ignore id from FleetManagement, backend will generate it)
      const apiBusData: Omit<ApiBus, 'id' | 'createdAt' | 'updatedAt' | 'movingTime' | 'parkedTime' | 'isFavorite' | 'position'> = {
        licensePlate: newBus.licensePlate,
        unitName: (newBus as any).unitName || newBus.licensePlate, // Use unitName if provided, otherwise licensePlate
        status: newBus.status as 'parked' | 'moving' | 'maintenance',
        route: newBus.route ?? null,
        driver: newBus.driver ?? null
      };

      const response = await api.createBus(apiBusData);
      
      // Map response to local Bus format
      const mappedBus: Bus = {
        ...response.bus,
        status: response.bus.status as 'moving' | 'parked' | 'maintenance',
        position: response.bus.position || newBus.position || { lat: 13.7942, lng: -88.9149 },
        driver: response.bus.driver || 'Sin asignar', // Convert null to string
        routeCoordinates: newBus.routeCoordinates,
        currentPositionInRoute: newBus.currentPositionInRoute,
        currentStopIndex: newBus.currentStopIndex
      } as Bus;

      setBuses(prevBuses => [...prevBuses, mappedBus]);
      toast.success('Bus creado', {
        description: `Se creó ${response.bus.licensePlate}`
      });
    } catch (err: any) {
      console.error('Failed to create bus:', err);
      toast.error('Error al crear bus', {
        description: err.error || 'No se pudo crear el bus'
      });
      throw err;
    }
  };

  const selectedBusData = detailsBus ? (buses.find(bus => bus.id === detailsBus) ?? null) : null;

  // Narrow statuses for FleetManagement prop expectations ('moving' | 'parked' | 'maintenance')
  const fleetBuses = useMemo(() =>
    buses.map(b => {
      const status = (b.status === 'needs_urgent_maintenance'
        ? 'maintenance'
        : b.status === 'usable'
          ? 'parked'
          : b.status === 'moving' || b.status === 'parked' || b.status === 'maintenance'
            ? b.status
            : 'parked') as 'moving' | 'parked' | 'maintenance';
      
      return {
        ...b,
        status
      };
    }),
    [buses]
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header 
        user={user} 
        onNavigate={onNavigate} 
        onLogout={onLogout}
        onOpenMessages={() => {
          setMessagesOpen(true);
          setFleetManagementOpen(false);
          setUserManagementOpen(false);
        }}
        onOpenFleetManagement={() => {
          setFleetManagementOpen(true);
          setMessagesOpen(false);
          setUserManagementOpen(false);
          setDetailsBus(null);
        }}
        onOpenUserManagement={() => {
          setUserManagementOpen(true);
          setMessagesOpen(false);
          setFleetManagementOpen(false);
          setDetailsBus(null);
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar with bus list */}
        <BusList
          buses={buses}
          selectedBus={selectedBus}
          onBusSelect={handleBusSelect}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Main map area */}
        <div className="flex-1 p-4 relative">
          <div className="w-full h-full rounded-lg overflow-hidden border shadow-lg">
            {loading ? (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-700">Cargando mapa...</div>
                </div>
              </div>
            ) : (
              <>
                <Map 
                  buses={buses}
                  selectedBusId={selectedBus}
                  onBusSelect={handleBusSelect}
                  onMapClick={selectingRoutePoints ? handleMapClick : undefined}
                  isSelectingRoutePoints={selectingRoutePoints}
                  routePoints={routePoints}
                />
              </>
            )}
          </div>
        </div>

        {/* Route Point Selection Panel - Left side */}
        {selectingRoutePoints && (
          <div className="fixed inset-y-0 left-0 w-80 bg-white border-r shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b bg-black">
              <h2 className="font-bold text-black text-lg">Crear Ruta</h2>
              <p className="text-sm text-gray-300 mt-1">Selecciona puntos en el mapa</p>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div className="bg-gray-100 border-2 border-gray-400 rounded-lg p-3">
                <p className="text-sm font-bold text-gray-900">
                  Puntos seleccionados: {routePoints.length}/2
                </p>
              </div>

              {routePoints.length > 0 && (
                <>
                  <div className="space-y-2">
                    {routePoints.map((point, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded border-2 border-gray-300 shadow-md">
                        <p className="text-xs text-purple-700 font-bold mb-1">
                          {idx === 0 ? '📍 Punto de Salida' : '🎯 Punto de Llegada'}
                        </p>
                        <p className="text-xs text-gray-800 font-mono">
                          {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setRoutePoints([])}
                    className="w-full text-red-600 border-red-500 border-2 hover:bg-red-50 font-bold"
                  >
                    🗑️ Limpiar Puntos
                  </Button>
                </>
              )}

              {routePoints.length === 2 && (
                      <div className="space-y-2 bg-gray-50 p-3 rounded-lg border-2 border-gray-400 shadow-md">
                  <Label htmlFor="route-name-panel" className="text-gray-800 font-bold">Nombre de la Ruta</Label>
                  <Input
                    id="route-name-panel"
                    placeholder="Ej: Ruta 102 - Centro a Cuscatlán"
                    value={routeNameForPoints}
                    onChange={(e) => setRouteNameForPoints(e.target.value)}
                    autoFocus
                    className="border-2 border-gray-400 font-semibold"
                  />
                </div>
              )}
            </div>

            {/* Footer with buttons */}
            <div className="p-4 border-t-2 border-gray-300 space-y-2 bg-gray-100">
              <Button
                variant="outline"
                onClick={handleCancelRouteSelection}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold border-0"
              >
                ✕ Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (routePoints.length === 2 && routeNameForPoints.trim()) {
                    toast.success('Ruta creada exitosamente', {
                      description: `${routeNameForPoints.trim()} ha sido agregada`
                    });
                    
                    // Limpiar estado
                    setSelectingRoutePoints(false);
                    setRoutePoints([]);
                    setRouteNameForPoints('');
                    setFleetManagementOpen(false);
                  }
                }}
                disabled={routePoints.length < 2 || !routeNameForPoints.trim()}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold border-0 disabled:bg-gray-400"
              >
                ✓ Confirmar Ruta
              </Button>
            </div>
          </div>
        )}

        {/* Details panel */}
        {detailsBus && !messagesOpen && !fleetManagementOpen && !userManagementOpen && (
          <BusDetails
            bus={selectedBusData}
            user={user}
            onClose={handleCloseDetails}
            onToggleFavorite={handleToggleFavorite}
            onUpdateBus={handleUpdateBus}
            onDeleteBus={handleDeleteBus}
          />
        )}

        {/* Messages panel - Available for all users */}
        {messagesOpen && (
          <MessagesPanel
            user={user}
            onClose={() => setMessagesOpen(false)}
          />
        )}

        {/* Fleet Management panel - Only for admin */}
        {fleetManagementOpen && user.role === 'admin' && (
          <FleetManagement
            user={user}
            buses={fleetBuses}
            onClose={() => setFleetManagementOpen(false)}
            onAddBus={handleAddBus}
            onDeleteBus={handleDeleteBus}
            onStartSelectingRoutePoints={handleStartSelectingRoutePoints}
          />
        )}

        {/* User Management panel - Only for admin */}
        {userManagementOpen && user.role === 'admin' && (
          <UserManagement
            user={user}
            onClose={() => setUserManagementOpen(false)}
          />
        )}
      </div>
    </div>
  );
}