import React, { useState, useEffect, useMemo } from 'react';
import { MapView } from '../components/map/MapView';
import { BusList } from '../components/bus/BusList';
import { BusDetails } from '../components/bus/BusDetails';
import { Header } from '../components/layout//Header';
import { MessagesPanel } from '../components/layout/MessagesPanel';
import { FleetManagement } from './FleetManagement';
import { UserManagement } from './UserManagement';
import type { User } from './LoginPage';

interface Bus {
  id: string;
  licensePlate: string;
  route: string;
  status: 'moving' | 'parked' | 'maintenance' | 'needs_urgent_maintenance' | 'usable';
  position: { lat: number; lng: number };
  driver: string;
  parkedTime?: number;
  movingTime?: number;
  isFavorite: boolean;
}

interface DashboardProps {
  user: User;
  onNavigate: (view: 'dashboard' | 'profile' | 'settings') => void;
  onLogout: () => void;
}

// Mock data for buses
const generateMockBuses = (): Bus[] => {
  const routes = ['101', '102', '201', '205', '301', '305', '401', '501'];
  const drivers = [
    'Carlos Rodríguez', 'María González', 'José López', 'Ana Martínez',
    'Luis Hernández', 'Carmen Jiménez', 'Roberto Silva', 'Patricia Vargas',
    'Miguel Castillo', 'Laura Morales', 'Fernando Vega', 'Sofía Ramírez'
  ];
  
  const statuses: Array<'moving' | 'parked' | 'maintenance' | 'needs_urgent_maintenance' | 'usable'> = [
    'moving', 'parked', 'maintenance', 'needs_urgent_maintenance', 'usable'
  ];

  return Array.from({ length: 12 }, (_, i) => ({
    id: (i + 1).toString().padStart(3, '0'),
    licensePlate: `BUS-${(i + 1).toString().padStart(3, '0')}`,
    route: routes[i % routes.length],
    status: statuses[Math.floor(Math.random() * 5)],
    position: {
      lat: 20 + Math.random() * 60,
      lng: 15 + Math.random() * 70
    },
    driver: drivers[i % drivers.length],
    parkedTime: Math.floor(Math.random() * 120),
    movingTime: Math.floor(Math.random() * 300 + 60),
    isFavorite: Math.random() > 0.7
  }));
};

export function Dashboard({ user, onNavigate, onLogout }: DashboardProps) {
  const [buses, setBuses] = useState<Bus[]>(generateMockBuses());
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [detailsBus, setDetailsBus] = useState<string | null>(null);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [fleetManagementOpen, setFleetManagementOpen] = useState(false);
  const [userManagementOpen, setUserManagementOpen] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses(prevBuses => 
        prevBuses.map(bus => ({
          ...bus,
          // Simulate movement for moving buses
          position: bus.status === 'moving' ? {
            lat: Math.max(10, Math.min(90, bus.position.lat + (Math.random() - 0.5) * 2)),
            lng: Math.max(10, Math.min(90, bus.position.lng + (Math.random() - 0.5) * 2))
          } : bus.position,
          // Update times
          movingTime: bus.status === 'moving' 
            ? (bus.movingTime || 0) + 1 
            : bus.movingTime,
          parkedTime: bus.status === 'parked' 
            ? (bus.parkedTime || 0) + 1 
            : bus.parkedTime,
          // Occasionally change status (but not maintenance states)
          status: Math.random() > 0.98 && !['maintenance', 'needs_urgent_maintenance'].includes(bus.status)
            ? (['moving', 'parked'][Math.floor(Math.random() * 2)] as any)
            : bus.status
        }))
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

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
          <MapView
            buses={buses}
            selectedBus={selectedBus}
            onBusSelect={handleBusSelect}
          />
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