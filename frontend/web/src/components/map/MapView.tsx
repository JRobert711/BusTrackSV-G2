import React from 'react';
import { Bus, MapPin, Pin } from 'lucide-react';
import { Badge } from '../ui/badge';

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

interface MapViewProps {
  buses: Bus[];
  selectedBus: string | null;
  onBusSelect: (busId: string) => void;
}

export function MapView({ buses, selectedBus, onBusSelect }: MapViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'moving': return 'bg-green-500';
      case 'parked': return 'bg-yellow-500';
      case 'maintenance': return 'bg-red-500';
      case 'needs_urgent_maintenance': return 'bg-orange-500';
      case 'usable': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'moving': return 'En Movimiento';
      case 'parked': return 'Estacionado';
      case 'maintenance': return 'Mantenimiento';
      case 'needs_urgent_maintenance': return 'Urgente';
      case 'usable': return 'Usable';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-100 rounded-lg border overflow-hidden">
      {/* Map Header */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-md p-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span className="font-medium">Mapa de Buses - BusTrack</span>
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">En Movimiento</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">Estacionado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm">Mantenimiento</span>
          </div>
        </div>
      </div>

      {/* Map Background with Grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}>
        </div>
      </div>

      {/* Mock Streets */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 right-0 h-1 bg-gray-400"></div>
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-400"></div>
        <div className="absolute top-3/4 left-0 right-0 h-1 bg-gray-400"></div>
        <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-gray-400"></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-400"></div>
        <div className="absolute left-3/4 top-0 bottom-0 w-1 bg-gray-400"></div>
      </div>

      {/* Bus Markers */}
      {buses.map((bus) => (
        <div
          key={bus.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 ${
            selectedBus === bus.id ? 'scale-125 z-20' : 'z-10'
          }`}
          style={{
            left: `${bus.position.lng}%`,
            top: `${bus.position.lat}%`
          }}
          onClick={() => onBusSelect(bus.id)}
        >
          <div className="relative">
            <div className={`p-2 rounded-full shadow-lg border-2 border-white ${getStatusColor(bus.status)}`}>
              <Bus className="h-4 w-4 text-white" />
            </div>
            {bus.isFavorite && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                <Pin className="h-3 w-3 text-white" fill="white" />
              </div>
            )}
            {selectedBus === bus.id && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <Badge variant="secondary" className="bg-white shadow-md">
                  {bus.licensePlate}
                </Badge>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Route Lines (for selected bus) */}
      {selectedBus && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="route-pattern" patternUnits="userSpaceOnUse" width="10" height="10">
                <rect width="10" height="10" fill="transparent"/>
                <rect width="5" height="2" fill="#3b82f6"/>
              </pattern>
            </defs>
            <path
              d="M 20,30 Q 40,20 60,40 T 80,60"
              stroke="url(#route-pattern)"
              strokeWidth="0.5"
              fill="none"
              strokeDasharray="2,1"
              className="animate-pulse"
            />
          </svg>
        </div>
      )}


    </div>
  );
}