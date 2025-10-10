import React, { useState } from 'react';
import { Trash2, Route, User, AlertTriangle, MessageSquare, Bell, Wrench } from 'lucide-react';
import { Button } from './ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { Separator } from './ui/separator';

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

interface AdminActionsProps {
  bus: Bus;
  userRole: 'admin' | 'supervisor';
  onDeleteBus?: (busId: string) => void;
  onChangeRoute?: (busId: string, newRoute: string) => void;
  onChangeDriver?: (busId: string, newDriver: string) => void;
  onChangeStatus?: (busId: string, newStatus: Bus['status']) => void;
  onNotify?: (busId: string, message: string) => void;
  onWarning?: (busId: string, reason: string) => void;
  onMessage?: (busId: string, message: string) => void;
}

export function AdminActions({
  bus,
  userRole,
  onDeleteBus,
  onChangeRoute,
  onChangeDriver,
  onChangeStatus,
  onNotify,
  onWarning,
  onMessage,
}: AdminActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  const [newRoute, setNewRoute] = useState(bus.route);
  const [newDriver, setNewDriver] = useState(bus.driver);
  const [newStatus, setNewStatus] = useState<Bus['status']>(bus.status);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [warningReason, setWarningReason] = useState('');
  const [messageText, setMessageText] = useState('');

  const availableRoutes = ['101', '102', '201', '205', '301', '305', '401', '501'];
  const availableDrivers = [
    'Carlos Rodríguez', 'María González', 'José López', 'Ana Martínez',
    'Luis Hernández', 'Carmen Jiménez', 'Roberto Silva', 'Patricia Vargas',
    'Miguel Castillo', 'Laura Morales', 'Fernando Vega', 'Sofía Ramírez'
  ];

  const handleDelete = () => {
    onDeleteBus?.(bus.id);
    toast.error(`Bus ${bus.licensePlate} eliminado`, {
      description: 'El bus ha sido removido del sistema'
    });
    setDeleteDialogOpen(false);
  };

  const handleRouteChange = () => {
    onChangeRoute?.(bus.id, newRoute);
    toast.success('Ruta actualizada', {
      description: `Bus ${bus.licensePlate} ahora en ruta ${newRoute}`
    });
    setRouteDialogOpen(false);
  };

  const handleDriverChange = () => {
    onChangeDriver?.(bus.id, newDriver);
    toast.success('Conductor actualizado', {
      description: `${newDriver} asignado al bus ${bus.licensePlate}`
    });
    setDriverDialogOpen(false);
  };

  const handleNotify = () => {
    onNotify?.(bus.id, notifyMessage);
    toast.info('Notificación enviada', {
      description: `Notificación enviada al conductor de ${bus.licensePlate}`
    });
    setNotifyMessage('');
    setNotifyDialogOpen(false);
  };

  const handleWarning = () => {
    onWarning?.(bus.id, warningReason);
    toast.warning('Amonestación registrada', {
      description: `Amonestación enviada al conductor de ${bus.licensePlate}`
    });
    setWarningReason('');
    setWarningDialogOpen(false);
  };

  const handleMessage = () => {
    onMessage?.(bus.id, messageText);
    toast.success('Mensaje enviado', {
      description: `Mensaje enviado al conductor de ${bus.licensePlate}`
    });
    setMessageText('');
    setMessageDialogOpen(false);
  };

  const handleStatusChange = () => {
    onChangeStatus?.(bus.id, newStatus);
    const statusText = {
      'maintenance': 'En Mantenimiento',
      'needs_urgent_maintenance': 'Necesita Mantenimiento Urgente',
      'usable': 'Usable',
      'moving': 'En Movimiento',
      'parked': 'Estacionado'
    }[newStatus];
    
    toast.success('Estado actualizado', {
      description: `Bus ${bus.licensePlate} ahora está: ${statusText}`
    });
    setStatusDialogOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Supervisor-only actions */}
      {userRole === 'supervisor' && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusDialogOpen(true)}
            className="w-full"
          >
            <Wrench className="h-4 w-4 mr-2" />
            Cambiar Estado de Mantenimiento
          </Button>
          <Separator />
        </>
      )}

      {/* Admin-only actions */}
      {userRole === 'admin' && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRouteDialogOpen(true)}
              className="w-full"
            >
              <Route className="h-4 w-4 mr-1" />
              Ruta
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDriverDialogOpen(true)}
              className="w-full"
            >
              <User className="h-4 w-4 mr-1" />
              Conductor
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </div>
          <Separator />
        </>
      )}

      {/* Actions available to both admin and supervisor */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setNotifyDialogOpen(true)}
          className="w-full"
        >
          <Bell className="h-4 w-4 mr-1" />
          Notificar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWarningDialogOpen(true)}
          className="w-full"
        >
          <AlertTriangle className="h-4 w-4 mr-1" />
          Amonestar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMessageDialogOpen(true)}
          className="w-full"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Mensaje
        </Button>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Bus {bus.licensePlate}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el bus del sistema. Esta acción no se puede deshacer.
              El conductor {bus.driver} será desasignado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar Bus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Route Dialog */}
      <Dialog open={routeDialogOpen} onOpenChange={setRouteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Ruta - {bus.licensePlate}</DialogTitle>
            <DialogDescription>
              Selecciona la nueva ruta para este bus. El cambio será efectivo inmediatamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ruta Actual</Label>
              <Input value={bus.route} disabled />
            </div>
            <div className="space-y-2">
              <Label>Nueva Ruta</Label>
              <Select value={newRoute} onValueChange={setNewRoute}>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRouteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRouteChange}>Cambiar Ruta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Driver Dialog */}
      <Dialog open={driverDialogOpen} onOpenChange={setDriverDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Conductor - {bus.licensePlate}</DialogTitle>
            <DialogDescription>
              Asigna un nuevo conductor a este bus. El conductor anterior será notificado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Conductor Actual</Label>
              <Input value={bus.driver} disabled />
            </div>
            <div className="space-y-2">
              <Label>Nuevo Conductor</Label>
              <Select value={newDriver} onValueChange={setNewDriver}>
                <SelectTrigger>
                  <SelectValue />
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
            <Button variant="outline" onClick={() => setDriverDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDriverChange}>Cambiar Conductor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notify Dialog */}
      <Dialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notificar Conductor - {bus.licensePlate}</DialogTitle>
            <DialogDescription>
              Envía una notificación al conductor {bus.driver}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mensaje de Notificación</Label>
              <Textarea
                placeholder="Escribe el mensaje de notificación..."
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifyDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleNotify} disabled={!notifyMessage.trim()}>
              Enviar Notificación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning Dialog */}
      <Dialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Amonestar Conductor - {bus.licensePlate}</DialogTitle>
            <DialogDescription>
              Registra una amonestación para el conductor {bus.driver}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motivo de la Amonestación</Label>
              <Textarea
                placeholder="Describe el motivo de la amonestación..."
                value={warningReason}
                onChange={(e) => setWarningReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Esta amonestación quedará registrada en el historial del conductor.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarningDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleWarning} disabled={!warningReason.trim()} variant="destructive">
              Registrar Amonestación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Mensaje - {bus.licensePlate}</DialogTitle>
            <DialogDescription>
              Envía un mensaje directo al conductor {bus.driver}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mensaje</Label>
              <Textarea
                placeholder="Escribe tu mensaje..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleMessage} disabled={!messageText.trim()}>
              Enviar Mensaje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog - Supervisor Only */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado de Mantenimiento - {bus.licensePlate}</DialogTitle>
            <DialogDescription>
              Actualiza el estado de mantenimiento del bus
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Estado Actual</Label>
              <Input 
                value={
                  bus.status === 'maintenance' ? 'En Mantenimiento' :
                  bus.status === 'needs_urgent_maintenance' ? 'Necesita Mantenimiento Urgente' :
                  bus.status === 'usable' ? 'Usable' :
                  bus.status === 'moving' ? 'En Movimiento' :
                  'Estacionado'
                } 
                disabled 
              />
            </div>
            <div className="space-y-2">
              <Label>Nuevo Estado</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as Bus['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usable">Usable</SelectItem>
                  <SelectItem value="maintenance">En Mantenimiento</SelectItem>
                  <SelectItem value="needs_urgent_maintenance">Necesita Mantenimiento Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Este cambio será notificado al administrador y quedará registrado en el sistema.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStatusChange}>Actualizar Estado</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
