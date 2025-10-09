import React, { useState, useEffect } from 'react';
import './App.css';
import { MapView } from './components/MapView';
import { BusList } from './components/BusList';
import { BusDetails } from './components/BusDetails';

// Mock data for buses
const generateMockBuses = () => {
  const routes = ['101', '102', '201', '205', '301', '305', '401', '501'];
  const drivers = [
    'Carlos Rodríguez', 'María González', 'José López', 'Ana Martínez',
    'Luis Hernández', 'Carmen Jiménez', 'Roberto Silva', 'Patricia Vargas',
    'Miguel Castillo', 'Laura Morales', 'Fernando Vega', 'Sofía Ramírez'
  ];
  
  const statuses = ['moving', 'parked', 'maintenance'];

  return Array.from({ length: 12 }, (_, i) => ({
    id: (i + 1).toString().padStart(3, '0'),
    licensePlate: `BUS-${(i + 1).toString().padStart(3, '0')}`,
    route: routes[i % routes.length],
    status: statuses[Math.floor(Math.random() * 3)],
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

function App() {
  const [buses, setBuses] = useState(generateMockBuses());
  const [selectedBus, setSelectedBus] = useState(null);
  const [detailsBus, setDetailsBus] = useState(null);
  const [backendData, setBackendData] = useState([{}]);

  useEffect(() => {
    fetch("/api")
      .then(response => response.json())
      .then(data => {
        setBackendData(data);
      })
      .catch(error => {
        console.log('Error fetching data:', error);
      });
  }, []);

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
          // Occasionally change status
          status: Math.random() > 0.98 
            ? (['moving', 'parked', 'maintenance'][Math.floor(Math.random() * 3)])
            : bus.status
        }))
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleBusSelect = (busId) => {
    setSelectedBus(busId);
    setDetailsBus(busId);
  };

  const handleToggleFavorite = (busId) => {
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

  const selectedBusData = detailsBus ? buses.find(bus => bus.id === detailsBus) : null;

  return (
    <div className="h-screen flex bg-gray-50">
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
      {detailsBus && (
        <BusDetails
          bus={selectedBusData}
          onClose={handleCloseDetails}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}

export default App;
