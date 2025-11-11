import React, { useState } from 'react';
import { X, Bus, Clock, MapPin, Route, User, Fuel, Settings, Pin, Phone, Pencil, AlertTriangle, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { AdminActions } from '../admin/AdminActions';
import type { User as UserType } from '../../pages/LoginPage';

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

interface BusDetailsProps {
  bus: Bus | null;
  user: UserType;
  onClose: () => void;
  onToggleFavorite: (busId: string) => void;
  onUpdateBus: (busId: string, updates: Partial<Bus>) => void;
  onDeleteBus: (busId: string) => void;
}

export function BusDetails({ bus, user, onClose, onToggleFavorite, onUpdateBus, onDeleteBus }: BusDetailsProps) {
  const [editingRoute, setEditingRoute] = useState(false);
  const [editingDriver, setEditingDriver] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [reprimanding, setReprimanding] = useState(false);
  const [newRoute, setNewRoute] = useState('');
  const [newDriver, setNewDriver] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [reprimandReason, setReprimandReason] = useState('');

  if (!bus) return null;

  const handleEditRoute = () => {
    setNewRoute(bus.route);
    setEditingRoute(true);
  };

  const handleEditDriver = () => {
    setNewDriver(bus.driver);
    setEditingDriver(true);
  };

  const handleSaveRoute = () => {
    if (newRoute.trim()) {
      onUpdateBus(bus.id, { route: newRoute.trim() });
      setEditingRoute(false);
    }
  };

  const handleSaveDriver = () => {
    if (newDriver.trim()) {
      onUpdateBus(bus.id, { driver: newDriver.trim() });
      setEditingDriver(false);
    }
  };

  const handleNotify = () => {
    setNotificationMessage('');
    setNotifying(true);
  };

  const handleSendNotification = () => {
    if (notificationMessage.trim()) {
      toast.success(`Notificación enviada a ${bus.driver}`, {
        description: notificationMessage.trim()
      });
      setNotifying(false);
      setNotificationMessage('');
    }
  };

  const handleReprimand = () => {
    setReprimandReason('');
    setReprimanding(true);
  };

  const handleSendReprimand = () => {
    if (reprimandReason.trim()) {
      toast.warning(`Amonestación registrada para ${bus.driver}`, {
        description: reprimandReason.trim()
      });
      setReprimanding(false);
      setReprimandReason('');
    }
  };

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
      case 'maintenance': return 'En Mantenimiento';
      case 'needs_urgent_maintenance': return 'Necesita Mantenimiento Urgente';
      case 'usable': return 'Usable';
      default: return 'Desconocido';
    }
  };

  const formatTime = (minutes?: number) => {
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
              title={bus.isFavorite ? 'Despinnear' : 'Pinnear'}
            >
              <Pin 
                className={`h-4 w-4 ${
                  bus.isFavorite ? 'fill-blue-600 text-blue-600' : 'text-gray-400'
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-6">
        {/* Route Information */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Información de Ruta</h3>
            {user.role === 'admin' && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={handleEditRoute}
                title="Editar Ruta"
              >
                <Pencil className="h-4 w-4 text-blue-600" />
              </Button>
            )}
          </div>
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
          </div>
        </Card>

        {/* Driver Information */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Conductor</h3>
            {user.role === 'admin' && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={handleEditDriver}
                title="Editar Conductor"
              >
                <Pencil className="h-4 w-4 text-blue-600" />
              </Button>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{bus.driver}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{mockData.phoneNumber}</span>
            </div>
            
            {/* Action Buttons */}
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNotify}
                className="w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notificar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReprimand}
                className="w-full"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Amonestar
              </Button>
            </div>
          </div>
        </Card>

        {/* Time Statistics */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Estadísticas de Tiempo</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tiempo en movimiento</span>
              <span className="font-medium">{formatTime(bus.movingTime)}</span>
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
              <span className="text-muted-foreground">Próximo servicio:</span>
              <span className="font-medium">En 15 días</span>
            </div>
          </div>
        </Card>

        {/* Admin/Supervisor Actions */}
        {user.role === 'admin' && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Acciones de Administrador</h3>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (window.confirm(`¿Estás seguro de eliminar el bus ${bus.licensePlate}?`)) {
                  onDeleteBus(bus.id);
                }
              }}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </Card>
        )}
      </div>

      {/* Edit Route Dialog */}
      <Dialog open={editingRoute} onOpenChange={setEditingRoute}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ruta</DialogTitle>
            <DialogDescription>
              Cambia la ruta asignada al bus {bus.licensePlate}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="route">Número de Ruta</Label>
              <Input
                id="route"
                value={newRoute}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRoute(e.target.value)}
                placeholder="Ej: 101"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRoute(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRoute}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Driver Dialog */}
      <Dialog open={editingDriver} onOpenChange={setEditingDriver}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Conductor</DialogTitle>
            <DialogDescription>
              Cambia el conductor asignado al bus {bus.licensePlate}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="driver">Nombre del Conductor</Label>
              <Input
                id="driver"
                value={newDriver}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDriver(e.target.value)}
                placeholder="Ej: Juan Pérez"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDriver(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveDriver}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notify Driver Dialog */}
      <Dialog open={notifying} onOpenChange={setNotifying}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notificar al Conductor</DialogTitle>
            <DialogDescription>
              Envía una notificación a {bus.driver}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notification">Mensaje de Notificación</Label>
              <Textarea
                id="notification"
                value={notificationMessage}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotificationMessage(e.target.value)}
                placeholder="Escribe el mensaje que deseas enviar al conductor..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifying(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendNotification}>
              <Bell className="h-4 w-4 mr-2" />
              Enviar Notificación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reprimand Driver Dialog */}
      <Dialog open={reprimanding} onOpenChange={setReprimanding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Amonestar al Conductor</DialogTitle>
            <DialogDescription>
              Registra una amonestación para {bus.driver}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reprimand">Motivo de la Amonestación</Label>
              <Textarea
                id="reprimand"
                value={reprimandReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReprimandReason(e.target.value)}
                placeholder="Describe el motivo de la amonestación..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReprimanding(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendReprimand} variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Registrar Amonestación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}