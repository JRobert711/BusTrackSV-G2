import React from 'react';
import { Bus, Clock, MapPin, User, Star, Route } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

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

interface BusCardProps {
  bus: Bus;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

export function BusCard({ bus, isSelected, onSelect, onToggleFavorite }: BusCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'moving': return 'bg-green-100 text-green-800 border-green-200';
      case 'parked': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance': return 'bg-red-100 text-red-800 border-red-200';
      case 'needs_urgent_maintenance': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'usable': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const formatTime = (minutes?: number) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bus className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold">{bus.licensePlate}</h3>
            <p className="text-sm text-muted-foreground">Unidad {bus.id}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="p-1 h-auto"
        >
          <Star 
            className={`h-4 w-4 ${
              bus.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
            }`}
          />
        </Button>
      </div>

      <div className="space-y-2">
        <Badge className={getStatusColor(bus.status)}>
          {getStatusText(bus.status)}
        </Badge>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Route className="h-4 w-4" />
          <span>Ruta {bus.route}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{bus.driver}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-3 w-3 text-green-600" />
            <span className="text-muted-foreground">En mov:</span>
            <span className="font-medium">{formatTime(bus.movingTime)}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-3 w-3 text-yellow-600" />
            <span className="text-muted-foreground">Parado:</span>
            <span className="font-medium">{formatTime(bus.parkedTime)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
