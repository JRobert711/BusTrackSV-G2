import React, { useState, useEffect } from 'react';
import { X, Bus, Plus, Trash2, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Badge } from '../components/ui/badge';
import { toast } from '../utils/toast';
import type { User as UserType } from './LoginPage';
import { getAvailableRoutes, getDefaultRoute } from '../utils/config';
import { api } from '../services/api';

interface Route {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
}

interface Bus {
  id: string;
  licensePlate: string;
  route: string;
  status: 'moving' | 'parked' | 'maintenance';
  position: { lat: number; lng: number };
  driver: string;
  parkedTime?: number;
  movingTime?: number;
  isFavorite: boolean;
}

interface FleetManagementProps {
  user: UserType;
  buses: Bus[];
  onClose: () => void;
  onAddBus: (bus: Bus) => Promise<void> | void;
  onDeleteBus: (busId: string) => void;
  routes?: Route[];
  onAddRoute?: (route: Route) => void;
  onStartSelectingRoutePoints?: () => void;
}

export function FleetManagement({ user, buses, onClose, onAddBus, onDeleteBus, routes, onAddRoute, onStartSelectingRoutePoints }: FleetManagementProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addRouteDialogOpen, setAddRouteDialogOpen] = useState(false);
  const [busToDelete, setBusToDelete] = useState<Bus | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableDrivers, setAvailableDrivers] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  // New bus form state
  const [newBusPlate, setNewBusPlate] = useState('');
  const [newBusRoute, setNewBusRoute] = useState(getDefaultRoute());
  const [newBusDriver, setNewBusDriver] = useState('');

  // New route form state
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteStartPoint, setNewRouteStartPoint] = useState('');
  const [newRouteEndPoint, setNewRouteEndPoint] = useState('');

  const availableRoutes = getAvailableRoutes();

  // Load drivers from Firestore when dialog opens
  useEffect(() => {
    if (addDialogOpen) {
      loadDrivers();
    }
  }, [addDialogOpen]);

  const loadDrivers = async () => {
    setLoadingDrivers(true);
    try {
      const response = await api.getUsers({ role: 'driver', limit: 100 });
      const drivers = response.data.map(user => ({
        id: user.id,
        name: user.name
      }));
      setAvailableDrivers(drivers);
    } catch (error: any) {
      console.error('Error loading drivers:', error);
      toast.error('Error', {
        description: 'No se pudieron cargar los conductores. Por favor intenta de nuevo.'
      });
      // Fallback to empty array
      setAvailableDrivers([]);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const filteredBuses = buses.filter(bus =>
    (bus.licensePlate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bus.route || '').includes(searchTerm) ||
    (bus.driver || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRoute = () => {
    if (!newRouteName.trim() || !newRouteStartPoint.trim() || !newRouteEndPoint.trim()) {
      toast.error('Error', {
        description: 'Por favor completa todos los campos de la ruta'
      });
      return;
    }

    const newRoute: Route = {
      id: `route-${Date.now()}`,
      name: newRouteName.trim(),
      startPoint: newRouteStartPoint.trim(),
      endPoint: newRouteEndPoint.trim()
    };

    if (onAddRoute) {
      onAddRoute(newRoute);
    }

    toast.success('Ruta agregada exitosamente', {
      description: `Ruta ${newRouteName} ha sido creada`
    });

    // Reset form
    setNewRouteName('');
    setNewRouteStartPoint('');
    setNewRouteEndPoint('');
    setAddRouteDialogOpen(false);
  };

  const handleAddBus = async () => {
    if (!newBusPlate.trim() || !newBusDriver) {
      toast.error('Error', {
        description: 'Por favor completa todos los campos'
      });
      return;
    }

    const newBus: Bus = {
      id: (buses.length + 1).toString().padStart(3, '0'),
      licensePlate: newBusPlate.trim(),
      route: newBusRoute,
      status: 'parked',
      position: {
        lat: 20 + Math.random() * 60,
        lng: 15 + Math.random() * 70
      },
      driver: newBusDriver,
      parkedTime: 0,
      movingTime: 0,
      isFavorite: false
    };

    try {
      await onAddBus(newBus);
      toast.success('Bus agregado exitosamente', {
        description: `${newBusPlate} ha sido añadido a la flota`
      });

      // Reset form
      setNewBusPlate('');
      setNewBusRoute(getDefaultRoute());
      setNewBusDriver('');
      setAddDialogOpen(false);
    } catch (error: any) {
      console.error('Error agregando bus:', error);
      const message =
        error?.error ||
        error?.message ||
        'No se pudo agregar el bus. Revisa los datos e inténtalo de nuevo.';
      toast.error('Error al agregar', {
        description: message
      });
    }
  };

  const confirmDelete = (bus: Bus) => {
    setBusToDelete(bus);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (busToDelete) {
      onDeleteBus(busToDelete.id);
      toast.error('Bus eliminado', {
        description: `${busToDelete.licensePlate} ha sido removido de la flota`
      });
      setBusToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'moving':
        return <Badge className="bg-green-100 text-green-800">En Movimiento</Badge>;
      case 'parked':
        return <Badge className="bg-yellow-100 text-yellow-800">Estacionado</Badge>;
      case 'maintenance':
        return <Badge className="bg-red-100 text-red-800">Mantenimiento</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l shadow-lg z-50 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold">Gestión de Flota</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar buses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {user.role === 'admin' && (
            <>
              <Button onClick={() => setAddDialogOpen(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Nuevo Bus
              </Button>
              {onStartSelectingRoutePoints && (
                <Button 
                  onClick={() => {
                    if (onStartSelectingRoutePoints) {
                      onStartSelectingRoutePoints();
                    }
                  }} 
                  style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
                  className="w-full font-bold shadow-md hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Nueva Ruta
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3 pb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Total de buses: {buses.length}</span>
          </div>

          {filteredBuses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bus className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No se encontraron buses</p>
            </div>
          ) : (
            filteredBuses.map((bus) => (
              <Card key={bus.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{bus.licensePlate}</h3>
                      <p className="text-sm text-muted-foreground">Unidad {bus.id}</p>
                    </div>
                    {getStatusBadge(bus.status)}
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ruta:</span>
                      <span className="font-medium">{bus.route}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conductor:</span>
                      <span className="font-medium">{bus.driver}</span>
                    </div>
                  </div>

                  {user.role === 'admin' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmDelete(bus)}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Bus
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Add Bus Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Bus</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo bus para agregarlo a la flota
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plate">Placa del Bus</Label>
              <Input
                id="plate"
                placeholder="BUS-XXX"
                value={newBusPlate}
                onChange={(e) => setNewBusPlate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Ruta Asignada</Label>
              <Select value={newBusRoute} onValueChange={setNewBusRoute}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoutes.map((route) => (
                    <SelectItem key={route} value={route}>
                      Ruta {route}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Conductor Asignado</Label>
              <Select value={newBusDriver} onValueChange={setNewBusDriver} disabled={loadingDrivers}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingDrivers ? "Cargando conductores..." : "Selecciona un conductor"} />
                </SelectTrigger>
                <SelectContent>
                  {availableDrivers.length === 0 && !loadingDrivers ? (
                    <SelectItem value="" disabled>No hay conductores disponibles</SelectItem>
                  ) : (
                    availableDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.name}>
                        {driver.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddBus}>Agregar Bus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {busToDelete?.licensePlate}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el bus de la flota. El conductor{' '}
              {busToDelete?.driver} será desasignado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Bus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Route Dialog - Manual only */}
      <Dialog open={addRouteDialogOpen} onOpenChange={setAddRouteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nueva Ruta</DialogTitle>
            <DialogDescription>
              Ingresa los datos de la nueva ruta manualmente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="route-name">Nombre de la Ruta</Label>
              <Input
                id="route-name"
                placeholder="Ej: Ruta 102 - Centro a Cuscatlán"
                value={newRouteName}
                onChange={(e) => setNewRouteName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="route-start">Punto de Salida</Label>
              <Input
                id="route-start"
                placeholder="Ej: Terminal de Occidente"
                value={newRouteStartPoint}
                onChange={(e) => setNewRouteStartPoint(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="route-end">Punto de Llegada</Label>
              <Input
                id="route-end"
                placeholder="Ej: Terminal del Oriente"
                value={newRouteEndPoint}
                onChange={(e) => setNewRouteEndPoint(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRouteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddRoute}>Agregar Ruta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}