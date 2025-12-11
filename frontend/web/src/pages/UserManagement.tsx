import React, { useEffect, useState } from 'react';
import { X, UserPlus, Trash2, Edit, Search, Users, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from '../utils/toast';
import type { User as UserType } from './LoginPage';
import { api, type Driver } from '../services/api';

interface UserManagementProps {
  user: UserType;
  onClose: () => void;
}

interface SupervisorUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'driver';
  phone?: string;
  department?: string;
  status?: 'active' | 'inactive';
  joinDate?: string;
}

export function UserManagement({ user, onClose }: UserManagementProps) {
  const [supervisors, setSupervisors] = useState<SupervisorUser[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('supervisors');
  const [loading, setLoading] = useState(false);

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SupervisorUser | Driver | null>(null);

  // Form states
  const [editForm, setEditForm] = useState<any>({});
  const [addForm, setAddForm] = useState<any>({});

  const loadSupervisors = async () => {
    try {
      const response = await api.getUsers();
      setSupervisors(
        response.data.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: 'active',
          joinDate: u.createdAt ? u.createdAt.split('T')[0] : '',
          phone: '',
          department: ''
        }))
      );
    } catch (err: any) {
      console.error('Error loading supervisors', err);
      toast.error('Error al cargar supervisores', { description: err.error || 'Revisa la conexión al backend' });
    }
  };

  const loadDrivers = async () => {
    try {
      const response = await api.getDrivers();
      setDrivers(response.data);
    } catch (err: any) {
      console.error('Error loading drivers', err);
      toast.error('Error al cargar conductores', { description: err.error || 'Revisa la conexión al backend' });
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadSupervisors(), loadDrivers()]).finally(() => setLoading(false));
  }, []);

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setLoading(true);

    try {
      if (selectedTab === 'supervisors') {
        await api.deleteUser(selectedUser.id);
        await loadSupervisors();
        toast.success('Supervisor eliminado', { description: `${selectedUser.name} ha sido eliminado del sistema` });
      } else {
        await api.deleteDriver(selectedUser.id);
        await loadDrivers();
        toast.success('Conductor eliminado', { description: `${selectedUser.name} ha sido eliminado del sistema` });
      }
    } catch (err: any) {
      console.error('Error deleting user/driver', err);
      toast.error('No se pudo eliminar', { description: err.error || 'Revisa permisos o conexión' });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    setLoading(true);

    try {
      if (selectedTab === 'supervisors') {
        const updates: { name?: string; role?: 'admin' | 'supervisor' } = {};
        if (editForm.name) updates.name = editForm.name;
        if (editForm.role) updates.role = editForm.role;
        await api.updateUser(selectedUser.id, updates);
        await loadSupervisors();
        toast.success('Supervisor actualizado', { description: 'Los cambios se han guardado correctamente' });
      } else {
        const updates: Partial<Omit<Driver, 'id'>> = {};
        if (editForm.name) updates.name = editForm.name;
        if (editForm.phone !== undefined) updates.phone = editForm.phone;
        if (editForm.licenseNumber) updates.licenseNumber = editForm.licenseNumber;
        if (editForm.experience !== undefined) updates.experience = Number(editForm.experience);
        if (editForm.status) updates.status = editForm.status;
        if (editForm.assignedBus !== undefined) updates.assignedBus = editForm.assignedBus;
        await api.updateDriver(selectedUser.id, updates);
        await loadDrivers();
        toast.success('Conductor actualizado', { description: 'Los cambios se han guardado correctamente' });
      }
    } catch (err: any) {
      console.error('Error updating user/driver', err);
      toast.error('No se pudo actualizar', { description: err.error || 'Revisa permisos o conexión' });
    } finally {
      setLoading(false);
      setEditDialogOpen(false);
      setSelectedUser(null);
      setEditForm({});
    }
  };

  const handleAddUser = async () => {
    setLoading(true);
    try {
      if (selectedTab === 'supervisors') {
        if (!addForm.email || !addForm.password) {
          toast.error('Email y contraseña son obligatorios para crear un supervisor');
          setLoading(false);
          return;
        }
        await api.createUser({
          email: addForm.email,
          name: addForm.name,
          password: addForm.password,
          role: (addForm.role as 'admin' | 'supervisor') || 'supervisor'
        });
        await loadSupervisors();
        toast.success('Supervisor agregado', { description: `${addForm.name} ha sido agregado al sistema` });
      } else {
        const newDriver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'> = {
          name: addForm.name,
          phone: addForm.phone || '',
          licenseNumber: addForm.licenseNumber,
          status: (addForm.status as Driver['status']) || 'active',
          experience: Number(addForm.experience) || 0,
          assignedBus: addForm.assignedBus || null
        };
        await api.createDriver(newDriver);
        await loadDrivers();
        toast.success('Conductor agregado', { description: `${addForm.name} ha sido agregado al sistema` });
      }
    } catch (err: any) {
      console.error('Error creating user/driver', err);
      toast.error('No se pudo crear', { description: err.error || 'Revisa validaciones o conexión' });
    } finally {
      setLoading(false);
      setAddDialogOpen(false);
      setAddForm({});
    }
  };

  const openEditDialog = (user: SupervisorUser | Driver) => {
    setSelectedUser(user);
    setEditForm(user);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (user: SupervisorUser | Driver) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const filteredSupervisors = supervisors.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDrivers = drivers.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-y-0 right-0 w-[600px] bg-white border-l shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold">Gestión de Usuarios</h2>
              <p className="text-sm text-muted-foreground">Administra supervisores y conductores</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="supervisors">
              Supervisores ({supervisors.length})
            </TabsTrigger>
            <TabsTrigger value="drivers">
              Conductores ({drivers.length})
            </TabsTrigger>
          </TabsList>

          {/* Supervisors Tab */}
          <TabsContent value="supervisors" className="space-y-3">
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="w-full"
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Supervisor
            </Button>

            {filteredSupervisors.map(supervisor => (
              <Card key={supervisor.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{supervisor.name}</h4>
                      <Badge
                        className={
                          (supervisor.status || 'active') === 'active'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }
                      >
                        {(supervisor.status || 'active') === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{supervisor.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Rol: {
                        supervisor.role === 'admin' ? 'Administrador' :
                        supervisor.role === 'supervisor' ? 'Supervisor' :
                        'Chofer'
                      }
                    </p>
                  </div>
                </div>
                <div className="space-y-1 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Departamento:</span>
                    <span className="font-medium">{supervisor.department || 'N/D'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha de ingreso:</span>
                    <span className="font-medium">{supervisor.joinDate || 'N/D'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(supervisor)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => openDeleteDialog(supervisor)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="space-y-3">
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="w-full"
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Conductor
            </Button>

            {filteredDrivers.map(driver => (
              <Card key={driver.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{driver.name}</h4>
                      <Badge
                        className={
                          driver.status === 'active'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : driver.status === 'on_leave'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }
                      >
                        {driver.status === 'active' ? 'Activo' : driver.status === 'on_leave' ? 'De Permiso' : 'Inactivo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{driver.phone}</p>
                    <p className="text-sm text-muted-foreground">Licencia: {driver.licenseNumber}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experiencia:</span>
                    <span className="font-medium">{driver.experience} años</span>
                  </div>
                  {driver.assignedBus && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bus asignado:</span>
                      <span className="font-medium">{driver.assignedBus}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(driver)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => openDeleteDialog(driver)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Editar {selectedTab === 'supervisors' ? 'Supervisor' : 'Conductor'}
            </DialogTitle>
            <DialogDescription>
              Actualiza la información del usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            {selectedTab === 'supervisors' ? (
              <>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editForm.email || ''}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select
                    value={editForm.role || 'supervisor'}
                    onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número de Licencia</Label>
                  <Input
                    value={editForm.licenseNumber || ''}
                    onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Experiencia (años)</Label>
                  <Input
                    type="number"
                    value={editForm.experience || ''}
                    onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={editForm.status || ''}
                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="on_leave">De Permiso</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Agregar {selectedTab === 'supervisors' ? 'Supervisor' : 'Conductor'}
            </DialogTitle>
            <DialogDescription>
              Ingresa la información del nuevo usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={addForm.name || ''}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            {selectedTab === 'supervisors' ? (
              <>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={addForm.email || ''}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="correo@bustrack.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contraseña</Label>
                  <Input
                    type="password"
                    value={addForm.password || ''}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="********"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select
                    value={addForm.role || 'supervisor'}
                    onValueChange={(value) => setAddForm({ ...addForm, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={addForm.phone || ''}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="+506 7777-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número de Licencia</Label>
                  <Input
                    value={addForm.licenseNumber || ''}
                    onChange={(e) => setAddForm({ ...addForm, licenseNumber: e.target.value })}
                    placeholder="DL-000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Experiencia (años)</Label>
                  <Input
                    type="number"
                    value={addForm.experience || ''}
                    onChange={(e) => setAddForm({ ...addForm, experience: e.target.value })}
                    placeholder="5"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddUser}>Agregar Usuario</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar {selectedTab === 'supervisors' ? 'Supervisor' : 'Conductor'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente a {selectedUser?.name} del sistema. 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
