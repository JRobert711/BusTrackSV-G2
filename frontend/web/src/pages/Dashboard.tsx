import React, { useState, useEffect, useMemo } from 'react';
import { MapView } from '../components/map/MapView';
import { BusList } from '../components/bus/BusList';
import { BusDetails } from '../components/bus/BusDetails';
import { Header } from '../components/layout//Header';
import { MessagesPanel } from '../components/layout/MessagesPanel';
import { FleetManagement } from './FleetManagement';
import { UserManagement } from './UserManagement';
import type { User } from './LoginPage';
import { api, type Bus as ApiBus } from '../services/api';

interface Bus {
  id: string;
  licensePlate: string;
  route: string;
  status: 'moving' | 'parked' | 'maintenance' | 'needs_urgent_maintenance' | 'usable';
  position: { lat: number; lng: number } | null;
  driver: string | null;
  parkedTime?: number;
  movingTime?: number;
  isFavorite: boolean;
}

interface DashboardProps {
  user: User;
  onNavigate: (view: 'dashboard' | 'profile' | 'settings') => void;
  onLogout: () => void;
}

// Map API bus to Dashboard bus format
const mapApiBusToDashboardBus = (apiBus: ApiBus): Bus => {
  return {
    id: apiBus.id,
    licensePlate: apiBus.licensePlate,
    route: apiBus.route || '',
    status: apiBus.status as 'moving' | 'parked' | 'maintenance' | 'needs_urgent_maintenance' | 'usable',
    position: apiBus.position,
    driver: apiBus.driver,
    parkedTime: apiBus.parkedTime,
    movingTime: apiBus.movingTime,
    isFavorite: apiBus.isFavorite
  };
};

export function Dashboard({ user, onNavigate, onLogout }: DashboardProps) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [detailsBus, setDetailsBus] = useState<string | null>(null);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [fleetManagementOpen, setFleetManagementOpen] = useState(false);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load buses from API
  useEffect(() => {
    const loadBuses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getBuses({ pageSize: 100 });
        const mappedBuses = response.data.map(mapApiBusToDashboardBus);
        setBuses(mappedBuses);
      } catch (err: any) {
        setError(err.error || 'Error al cargar los buses');
        console.error('Error loading buses:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBuses();

    // Poll for updates every 30 seconds
    const interval = setInterval(loadBuses, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBusSelect = (busId: string) => {
    setSelectedBus(busId);
    setDetailsBus(busId);
  };

  const handleToggleFavorite = async (busId: string) => {
    try {
      const response = await api.toggleFavorite(busId);
      const updatedBus = mapApiBusToDashboardBus(response.bus);
      setBuses(prevBuses =>
        prevBuses.map(bus =>
          bus.id === busId ? updatedBus : bus
        )
      );
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      setError(err.error || 'Error al actualizar favorito');
    }
  };

  const handleCloseDetails = () => {
    setDetailsBus(null);
  };

  const handleUpdateBus = async (busId: string, updates: Partial<Bus>) => {
    try {
      // Map Dashboard bus updates to API format
      const apiUpdates: Partial<ApiBus> = {};
      if (updates.status) apiUpdates.status = updates.status as 'parked' | 'moving' | 'maintenance';
      if (updates.route !== undefined) apiUpdates.route = updates.route;
      if (updates.driver !== undefined) apiUpdates.driver = updates.driver;
      
      const response = await api.updateBus(busId, apiUpdates);
      const updatedBus = mapApiBusToDashboardBus(response.bus);
      setBuses(prevBuses =>
        prevBuses.map(bus =>
          bus.id === busId ? updatedBus : bus
        )
      );
    } catch (err: any) {
      console.error('Error updating bus:', err);
      setError(err.error || 'Error al actualizar el bus');
    }
  };

  const handleDeleteBus = async (busId: string) => {
    try {
      await api.deleteBus(busId);
      setBuses(prevBuses => prevBuses.filter(bus => bus.id !== busId));
      setDetailsBus(null);
      setSelectedBus(null);
    } catch (err: any) {
      console.error('Error deleting bus:', err);
      setError(err.error || 'Error al eliminar el bus');
    }
  };

  const handleAddBus = async (newBus: Omit<Bus, 'id' | 'createdAt' | 'updatedAt' | 'movingTime' | 'parkedTime' | 'isFavorite' | 'position'>) => {
    try {
      const apiBus: Omit<ApiBus, 'id' | 'createdAt' | 'updatedAt' | 'movingTime' | 'parkedTime' | 'isFavorite' | 'position'> = {
        licensePlate: newBus.licensePlate,
        unitName: newBus.licensePlate, // Using licensePlate as unitName fallback
        status: newBus.status as 'parked' | 'moving' | 'maintenance',
        route: newBus.route,
        driver: newBus.driver
      };
      const response = await api.createBus(apiBus);
      const mappedBus = mapApiBusToDashboardBus(response.bus);
      setBuses(prevBuses => [...prevBuses, mappedBus]);
    } catch (err: any) {
      console.error('Error adding bus:', err);
      setError(err.error || 'Error al agregar el bus');
    }
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
        {error && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 rounded-lg p-3 z-50">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        {loading && buses.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-600">Cargando buses...</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}