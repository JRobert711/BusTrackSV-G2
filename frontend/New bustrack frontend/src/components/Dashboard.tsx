import React, { useState, useEffect } from 'react';
import { MapView } from './MapView';
import { BusList } from './BusList';
import { BusDetails } from './BusDetails';
import { Header } from './Header';
import { MessagesPanel } from './MessagesPanel';
import { FleetManagement } from './FleetManagement';
import { apiService, Bus as ApiBus } from '../services/api';
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

// Transform API bus to frontend bus format
const transformApiBusToBus = (apiBus: ApiBus): Bus => {
  return {
    id: apiBus.id,
    licensePlate: apiBus.licensePlate,
    route: apiBus.route,
    status: apiBus.status as Bus['status'],
    position: {
      // Generate mock coordinates for demo - in real app these would come from GPS
      lat: 20 + Math.random() * 60,
      lng: 15 + Math.random() * 70
    },
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load buses from API
  const loadBuses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const apiBuses = await apiService.getBuses();
      const transformedBuses = apiBuses.map(transformApiBusToBus);
      setBuses(transformedBuses);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar los buses');
      console.error('Error loading buses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load buses on component mount
  useEffect(() => {
    loadBuses();
  }, []);

  // Simulate real-time updates (update positions and times)
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
        }))
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleBusSelect = (busId: string) => {
    setSelectedBus(busId);
    setDetailsBus(busId);
  };

  const handleToggleFavorite = async (busId: string) => {
    try {
      const currentBus = buses.find(bus => bus.id === busId);
      if (!currentBus) return;

      const newFavoriteStatus = !currentBus.isFavorite;
      
      // Update locally first for immediate UI feedback
      setBuses(prevBuses =>
        prevBuses.map(bus =>
          bus.id === busId
            ? { ...bus, isFavorite: newFavoriteStatus }
            : bus
        )
      );

      // Update on server
      await apiService.updateBusFavorite(busId, newFavoriteStatus);
    } catch (error) {
      console.error('Error updating favorite status:', error);
      // Revert local change on error
      setBuses(prevBuses =>
        prevBuses.map(bus =>
          bus.id === busId
            ? { ...bus, isFavorite: !bus.isFavorite }
            : bus
        )
      );
    }
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

  const selectedBusData = detailsBus ? buses.find(bus => bus.id === detailsBus) : null;

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Header 
          user={user} 
          onNavigate={onNavigate} 
          onLogout={onLogout}
          onOpenMessages={() => {}}
          onOpenFleetManagement={() => {}}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos de buses...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Header 
          user={user} 
          onNavigate={onNavigate} 
          onLogout={onLogout}
          onOpenMessages={() => {}}
          onOpenFleetManagement={() => {}}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-100 border border-red-200 rounded-lg p-6 max-w-md">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar datos</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={loadBuses}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        }}
        onOpenFleetManagement={() => {
          setFleetManagementOpen(true);
          setMessagesOpen(false);
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
        {detailsBus && !messagesOpen && !fleetManagementOpen && (
          <BusDetails
            bus={selectedBusData}
            user={user}
            onClose={handleCloseDetails}
            onToggleFavorite={handleToggleFavorite}
            onUpdateBus={handleUpdateBus}
            onDeleteBus={handleDeleteBus}
          />
        )}

        {/* Messages panel - Only for admin */}
        {messagesOpen && user.role === 'admin' && (
          <MessagesPanel
            user={user}
            onClose={() => setMessagesOpen(false)}
          />
        )}

        {/* Fleet Management panel - Only for admin */}
        {fleetManagementOpen && user.role === 'admin' && (
          <FleetManagement
            user={user}
            buses={buses}
            onClose={() => setFleetManagementOpen(false)}
            onAddBus={handleAddBus}
            onDeleteBus={handleDeleteBus}
          />
        )}
      </div>
    </div>
  );
}
