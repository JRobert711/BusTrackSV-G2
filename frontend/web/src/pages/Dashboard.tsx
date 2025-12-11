import React, { useState, useEffect, useMemo } from 'react';
import Map from '../components/map/Map';
import { BusList } from '../components/bus/BusList';
import { BusDetails } from '../components/bus/BusDetails';
import { Header } from '../components/layout//Header';
import { MessagesPanel } from '../components/layout/MessagesPanel';
import { FleetManagement } from './FleetManagement';
import { UserManagement } from './UserManagement';
import type { User } from './LoginPage';

interface Position {
  lat: number;
  lng: number;
}

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

// Definir las paradas en San Salvador
interface BusStop {
  id: string;
  name: string;
  position: Position;
}

const STOPS: BusStop[] = [
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

interface DashboardProps {
  user: User;
  onNavigate: (view: 'dashboard' | 'profile' | 'settings') => void;
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
  try {
    const token = 'pk.eyJ1IjoiZW1pbGlvcDFvIiwiYSI6ImNtaTQzc2QzbDE5cnMya29lN2N1bDBqbzAifQ._kLPzOXtEqwDom86Ph6CnQ';
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

  // Create initial bus with real route on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (STOPS.length < 2) return;
        const start = STOPS[0].position;
        const end = STOPS[1].position;
        const routeCoordinates = await fetchDirections(start, end);
        const bus: Bus = {
          id: 'bus-001',
          licensePlate: 'BUS-001',
          route: `Ruta 101: ${STOPS[0].name} a ${STOPS[1].name}`,
          status: 'moving',
          position: routeCoordinates[0],
          driver: 'Juan Pérez',
          isFavorite: false,
          routeCoordinates,
          currentPositionInRoute: 0,
          currentStopIndex: 0
        };
        if (mounted) {
          setBuses([bus]);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to initialize bus route', err);
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // Efecto para animar el bus y manejar cambios de parada/recálculo de ruta
  useEffect(() => {
    if (buses.length === 0) return;

    let isActive = true;
    const interval = setInterval(() => {
      const needsRecalc: Array<{ id: string; nextStopIndex: number; currentStopIndex: number }> = [];

      setBuses(prevBuses => prevBuses.map(bus => {
        if (!bus.routeCoordinates || bus.routeCoordinates.length === 0) return bus;

        const currentPosition = bus.currentPositionInRoute ?? 0;
        const nextPosition = (currentPosition + 1) % bus.routeCoordinates.length;
        const isAtEnd = nextPosition === 0;

        const progress = nextPosition / (bus.routeCoordinates.length - 1 || 1);
        const currentStopIndex = Math.floor(progress * (STOPS.length - 1));

        const updatedBus: Bus = {
          ...bus,
          position: { ...bus.routeCoordinates[nextPosition] },
          currentPositionInRoute: nextPosition,
          currentStopIndex,
          status: 'moving' as const
        };

        if (isAtEnd && STOPS.length > 1) {
          const nextStopIndex = ((bus.currentStopIndex ?? 0) + 1) % STOPS.length;
          needsRecalc.push({ id: bus.id, nextStopIndex, currentStopIndex: bus.currentStopIndex ?? 0 });
        }

        return updatedBus;
      }));

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

  const handleToggleFavorite = (busId: string) => {
    setBuses(prevBuses =>
      prevBuses.map(bus =>
        bus.id === busId
          ? { ...bus, isFavorite: !bus.isFavorite }
          : bus
      )
    );
  };

  const handleCloseDetails = () => {
    setDetailsBus(null);
    setSelectedBus(null);
  };

  const handleUpdateBus = (busId: string, updates: Partial<Bus>) => {
    setBuses(prevBuses =>
      prevBuses.map(bus =>
        bus.id === busId
          ? { ...bus, ...updates }
          : bus
      )
    );
  };

  const handleDeleteBus = (busId: string) => {
    setBuses(prevBuses => prevBuses.filter(bus => bus.id !== busId));
    setDetailsBus(null);
    setSelectedBus(null);
  };

  const handleAddBus = (newBus: Bus) => {
    setBuses(prevBuses => [...prevBuses, newBus]);
  };

  const selectedBusData = detailsBus ? (buses.find(bus => bus.id === detailsBus) ?? null) : null;

  // Narrow statuses for FleetManagement prop expectations ('moving' | 'parked' | 'maintenance')
  const fleetBuses = useMemo(() =>
    buses.map(b => ({
      ...b,
      status: (b.status === 'needs_urgent_maintenance'
        ? 'maintenance'
        : b.status === 'usable'
          ? 'parked'
          : b.status) as 'moving' | 'parked' | 'maintenance',
    })),
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
        <div className="flex-1 p-4">
          <div className="w-full h-full rounded-lg overflow-hidden border shadow-lg">
            {loading ? (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-700">Cargando mapa...</div>
                </div>
              </div>
            ) : (
              <Map 
                buses={buses}
                selectedBusId={selectedBus}
                onBusSelect={handleBusSelect}
              />
            )}
          </div>
        </div>

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