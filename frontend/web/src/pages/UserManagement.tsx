import React, { useState } from 'react';
import { X, UserPlus, Trash2, Edit, Search, Users, User } from 'lucide-react';
import { Button } from '../components//ui/button';
import { Card } from '../components//ui/card';
import { Input } from '../components//ui/input';
import { Label } from '../components//ui/label';
import { Badge } from '../components//ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components//ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components//ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components//ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components//ui/tabs';
import { toast } from 'sonner';
import type { User as UserType } from './LoginPage';

interface UserManagementProps {
  user: UserType;
  onClose: () => void;
}

interface SupervisorUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: 'active' | 'inactive' | 'on_leave';
  experience: number;
  assignedBus?: string;
}

const mockSupervisors: SupervisorUser[] = [
  {
    id: '2',
    name: 'María Supervisora',
    email: 'supervisor@bustrack.com',
    phone: '+506 8888-0002',
    department: 'Operaciones',
    status: 'active',
    joinDate: '2021-03-20'
  },
  {
    id: '3',
    name: 'Pedro Ramírez',
    email: 'pedro.ramirez@bustrack.com',
    phone: '+506 8888-0003',
    department: 'Logística',
    status: 'active',
    joinDate: '2022-05-15'
  },
  {
    id: '4',
    name: 'Laura Sánchez',
    email: 'laura.sanchez@bustrack.com',
    phone: '+506 8888-0004',
    department: 'Mantenimiento',
    status: 'inactive',
    joinDate: '2023-01-10'
  },
];

const mockDrivers: Driver[] = [
  {
    id: 'd1',
    name: 'Carlos Rodríguez',
    phone: '+506 7777-0001',
    licenseNumber: 'DL-001234',
    status: 'active',
    experience: 8,
    assignedBus: 'BUS-001'
  },
  {
    id: 'd2',
    name: 'José López',
    phone: '+506 7777-0002',
    licenseNumber: 'DL-001235',
    status: 'active',
    experience: 5,
    assignedBus: 'BUS-003'
  },
  {
    id: 'd3',
    name: 'Ana Martínez',
    phone: '+506 7777-0003',
    licenseNumber: 'DL-001236',
    status: 'active',
    experience: 6,
    assignedBus: 'BUS-004'
  },
  {
    id: 'd4',
    name: 'Luis Hernández',
    phone: '+506 7777-0004',
    licenseNumber: 'DL-001237',
    status: 'on_leave',
    experience: 10,
  },
  {
    id: 'd5',
    name: 'Roberto Silva',
    phone: '+506 7777-0005',
    licenseNumber: 'DL-001238',
    status: 'active',
    experience: 4,
  },
];

export function UserManagement({ user, onClose }: UserManagementProps) {
  const [supervisors, setSupervisors] = useState<SupervisorUser[]>(mockSupervisors);
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('supervisors');

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SupervisorUser | Driver | null>(null);

  // Form states
  const [editForm, setEditForm] = useState<any>({});
  const [addForm, setAddForm] = useState<any>({});

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    if (selectedTab === 'supervisors') {
      setSupervisors(prev => prev.filter(s => s.id !== selectedUser.id));
      toast.error('Supervisor eliminado', { description: `${selectedUser.name} ha sido eliminado del sistema` });
    } else {
      setDrivers(prev => prev.filter(d => d.id !== selectedUser.id));
      toast.error('Conductor eliminado', { description: `${selectedUser.name} ha sido eliminado del sistema` });
    }

    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    if (selectedTab === 'supervisors') {
      setSupervisors(prev => prev.map(s => 
        s.id === selectedUser.id ? { ...s, ...editForm } : s
      ));
      toast.success('Supervisor actualizado', { description: 'Los cambios se han guardado correctamente' });
    } else {
      setDrivers(prev => prev.map(d => 
        d.id === selectedUser.id ? { ...d, ...editForm } : d
      ));
      toast.success('Conductor actualizado', { description: 'Los cambios se han guardado correctamente' });
    }

    setEditDialogOpen(false);
    setSelectedUser(null);
    setEditForm({});
  };

  const handleAddUser = () => {
    if (selectedTab === 'supervisors') {
      const newSupervisor: SupervisorUser = {
        id: `s${supervisors.length + 1}`,
        ...addForm,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0]
      };
      setSupervisors(prev => [...prev, newSupervisor]);
      toast.success('Supervisor agregado', { description: `${addForm.name} ha sido agregado al sistema` });
    } else {
      const newDriver: Driver = {
        id: `d${drivers.length + 1}`,
        ...addForm,
        status: 'active',
        experience: parseInt(addForm.experience) || 0
      };
      setDrivers(prev => [...prev, newDriver]);
      toast.success('Conductor agregado', { description: `${addForm.name} ha sido agregado al sistema` });
    }

    setAddDialogOpen(false);
    setAddForm({});
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
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
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
                          supervisor.status === 'active'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }
                      >
                        {supervisor.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{supervisor.email}</p>
                    <p className="text-sm text-muted-foreground">{supervisor.phone}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Departamento:</span>
                    <span className="font-medium">{supervisor.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha de ingreso:</span>
                    <span className="font-medium">{supervisor.joinDate}</span>
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
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Select
                    value={editForm.department || ''}
                    onValueChange={(value) => setEditForm({ ...editForm, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operaciones">Operaciones</SelectItem>
                      <SelectItem value="Logística">Logística</SelectItem>
                      <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="Seguridad">Seguridad</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="inactive">Inactivo</SelectItem>
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
                  <Label>Teléfono</Label>
                  <Input
                    value={addForm.phone || ''}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="+506 8888-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Select
                    value={addForm.department || ''}
                    onValueChange={(value) => setAddForm({ ...addForm, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operaciones">Operaciones</SelectItem>
                      <SelectItem value="Logística">Logística</SelectItem>
                      <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="Seguridad">Seguridad</SelectItem>
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
