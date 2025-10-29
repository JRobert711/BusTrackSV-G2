import React, { useState } from 'react';
import { X, Bus, Plus, Trash2, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import type { User as UserType } from './LoginPage';

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
  onAddBus: (bus: Bus) => void;
  onDeleteBus: (busId: string) => void;
}

export function FleetManagement({ user, buses, onClose, onAddBus, onDeleteBus }: FleetManagementProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [busToDelete, setBusToDelete] = useState<Bus | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // New bus form state
  const [newBusPlate, setNewBusPlate] = useState('');
  const [newBusRoute, setNewBusRoute] = useState('101');
  const [newBusDriver, setNewBusDriver] = useState('');

  const availableRoutes = ['101', '102', '201', '205', '301', '305', '401', '501'];
  const availableDrivers = [
    'Carlos Rodríguez', 'María González', 'José López', 'Ana Martínez',
    'Luis Hernández', 'Carmen Jiménez', 'Roberto Silva', 'Patricia Vargas',
    'Miguel Castillo', 'Laura Morales', 'Fernando Vega', 'Sofía Ramírez'
  ];

  const filteredBuses = buses.filter(bus =>
    bus.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.route.includes(searchTerm) ||
    bus.driver.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddBus = () => {
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

    onAddBus(newBus);
    toast.success('Bus agregado exitosamente', {
      description: `${newBusPlate} ha sido añadido a la flota`
    });

    // Reset form
    setNewBusPlate('');
    setNewBusRoute('101');
    setNewBusDriver('');
    setAddDialogOpen(false);
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
            <Button onClick={() => setAddDialogOpen(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Nuevo Bus
            </Button>
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
              <Select value={newBusDriver} onValueChange={setNewBusDriver}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un conductor" />
                </SelectTrigger>
                <SelectContent>
                  {availableDrivers.map((driver) => (
                    <SelectItem key={driver} value={driver}>
                      {driver}
                    </SelectItem>
                  ))}
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
    </div>
  );
}