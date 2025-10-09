import React from 'react';
import { X, Bus, Clock, MapPin, Route, User, Fuel, Settings, Star, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

function BusDetails({ bus, onClose, onToggleFavorite }) {
  if (!bus) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'moving': return 'bg-green-100 text-green-800 border-green-200';
      case 'parked': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'moving': return 'En Movimiento';
      case 'parked': return 'Estacionado';
      case 'maintenance': return 'En Mantenimiento';
      default: return 'Desconocido';
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0 minutos';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} hora${hours > 1 ? 's' : ''} ${mins > 0 ? `y ${mins} minuto${mins > 1 ? 's' : ''}` : ''}`;
    }
    return `${mins} minuto${mins > 1 ? 's' : ''}`;
  };

  const totalTime = (bus.movingTime || 0) + (bus.parkedTime || 0);
  const movingPercentage = totalTime > 0 ? ((bus.movingTime || 0) / totalTime) * 100 : 0;

  // Mock additional data
  const mockData = {
    speed: bus.status === 'moving' ? Math.floor(Math.random() * 40 + 20) : 0,
    fuel: Math.floor(Math.random() * 40 + 60),
    temperature: Math.floor(Math.random() * 10 + 85),
    lastMaintenance: '15 días',
    totalKm: Math.floor(Math.random() * 50000 + 150000),
    phoneNumber: '+506 8888-9999'
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold">{bus.licensePlate}</h2>
              <p className="text-sm text-muted-foreground">Unidad {bus.id}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(bus.id)}
              className="p-2"
            >
              <Star 
                className={`h-4 w-4 ${
                  bus.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                }`}
              />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Badge className={getStatusColor(bus.status)}>
          {getStatusText(bus.status)}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Current Status */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Estado Actual</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Velocidad</span>
              </div>
              <span className="font-medium">{mockData.speed} km/h</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Combustible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${mockData.fuel}%` }}
                  ></div>
                </div>
                <span className="font-medium text-sm">{mockData.fuel}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Temperatura</span>
              </div>
              <span className="font-medium">{mockData.temperature}°C</span>
            </div>
          </div>
        </Card>

        {/* Route Information */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Información de Ruta</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Ruta {bus.route}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              San José Centro → Cartago → San José Centro
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Próxima parada:</span>
              <span className="font-medium">Terminal Cartago</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tiempo estimado:</span>
              <span className="font-medium">15 min</span>
            </div>
          </div>
        </Card>

        {/* Driver Information */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Conductor</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{bus.driver}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{mockData.phoneNumber}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Experiencia:</span>
              <span className="font-medium">5 años</span>
            </div>
          </div>
        </Card>

        {/* Time Statistics */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Estadísticas de Tiempo</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Tiempo en movimiento</span>
                <span className="text-sm font-medium">{formatTime(bus.movingTime)}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${movingPercentage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Tiempo estacionado</span>
                <span className="text-sm font-medium">{formatTime(bus.parkedTime)}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 transition-all duration-300"
                  style={{ width: `${100 - movingPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tiempo total hoy</span>
                <span className="font-medium">{formatTime(totalTime)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Maintenance Information */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Mantenimiento</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Último mantenimiento:</span>
              <span className="font-medium">{mockData.lastMaintenance}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Kilometraje total:</span>
              <span className="font-medium">{mockData.totalKm.toLocaleString()} km</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Próximo servicio:</span>
              <span className="font-medium">En 15 días</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export { BusDetails };




