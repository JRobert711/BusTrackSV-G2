import React from 'react';
import { Bell, Settings, LogOut, User, ChevronDown, Bus, MessageSquare, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import type { User as UserType } from '../../pages/LoginPage';

interface HeaderProps {
  user: UserType;
  onNavigate: (view: 'dashboard' | 'profile' | 'settings') => void;
  onLogout: () => void;
  onOpenMessages?: () => void;
  onOpenFleetManagement?: () => void;
  onOpenUserManagement?: () => void;
}

export function Header({ user, onNavigate, onLogout, onOpenMessages, onOpenFleetManagement, onOpenUserManagement }: HeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: 'admin' | 'supervisor') => {
    return role === 'admin' ? (
      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
        Administrador
      </Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
        Supervisor
      </Badge>
    );
  };

  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Bus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">BusTrack</h1>
            <p className="text-sm text-gray-600">Sistema de Gestión de Flotas</p>
          </div>
        </div>

        {/* Right side - User actions */}
        <div className="flex items-center gap-4">
          {/* Notifications and Messages */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative"
            onClick={onOpenMessages}
            title="Mensajes y Notificaciones"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Fleet Management - Only for admin */}
          {user.role === 'admin' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenFleetManagement}
                title="Gestión de Flota"
              >
                <Bus className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenUserManagement}
                title="Gestión de Supervisores y Conductores"
              >
                <Users className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role === 'admin' ? 'Administrador' : 'Supervisor'}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <div className="mt-1">
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onNavigate('profile')}>
                <User className="mr-2 h-4 w-4" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}