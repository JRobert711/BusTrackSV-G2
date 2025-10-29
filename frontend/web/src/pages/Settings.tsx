import React, { useState } from 'react';
import { ArrowLeft, Bell, Lock, Globe, Moon, Monitor, Smartphone, Shield, Database, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import type { User as UserType } from './LoginPage';

interface SettingsProps {
  user: UserType;
  onBack: () => void;
}

interface AppSettings {
  notifications: {
    busStatus: boolean;
    maintenance: boolean;
    routeAlerts: boolean;
    email: boolean;
    push: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    mapStyle: string;
  };
  updates: {
    autoRefresh: boolean;
    refreshInterval: number;
  };
}

export function Settings({ user, onBack }: SettingsProps) {
  const [settings, setSettings] = useState<AppSettings>({
    notifications: {
      busStatus: true,
      maintenance: true,
      routeAlerts: true,
      email: true,
      push: false,
    },
    display: {
      theme: 'light',
      language: 'es',
      mapStyle: 'default',
    },
    updates: {
      autoRefresh: true,
      refreshInterval: 5,
    },
  });

  const updateNotification = (key: keyof AppSettings['notifications'], value: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    });
  };

  const updateDisplay = (key: keyof AppSettings['display'], value: string) => {
    setSettings({
      ...settings,
      display: {
        ...settings.display,
        [key]: value,
      },
    });
  };

  const updateUpdates = (key: keyof AppSettings['updates'], value: boolean | number) => {
    setSettings({
      ...settings,
      updates: {
        ...settings.updates,
        [key]: value,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Configuración</h1>
            <p className="text-sm text-muted-foreground">Personaliza tu experiencia en BusTrack</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-5xl mx-auto">
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="display">Visualización</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Preferencias de Notificaciones</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Configura qué notificaciones deseas recibir
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Alertas de Flota</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Cambios de estado de buses</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibe alertas cuando un bus cambie de estado
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.busStatus}
                        onCheckedChange={(checked) => updateNotification('busStatus', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alertas de mantenimiento</Label>
                        <p className="text-sm text-muted-foreground">
                          Notificaciones sobre mantenimientos programados
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.maintenance}
                        onCheckedChange={(checked) => updateNotification('maintenance', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alertas de ruta</Label>
                        <p className="text-sm text-muted-foreground">
                          Desvíos o cambios en las rutas programadas
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.routeAlerts}
                        onCheckedChange={(checked) => updateNotification('routeAlerts', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Canales de Notificación</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificaciones por correo</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibe resúmenes diarios en tu correo
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) => updateNotification('email', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificaciones push</Label>
                        <p className="text-sm text-muted-foreground">
                          Alertas instantáneas en el navegador
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) => updateNotification('push', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Display Tab */}
          <TabsContent value="display" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Preferencias de Visualización</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Personaliza la apariencia de la aplicación
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select value={settings.display.theme} onValueChange={(value) => updateDisplay('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          Claro
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Oscuro
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          Automático (Sistema)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Selecciona el tema de color de la interfaz
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select value={settings.display.language} onValueChange={(value) => updateDisplay('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Español
                        </div>
                      </SelectItem>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          English
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Idioma de la interfaz
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Estilo de mapa</Label>
                  <Select value={settings.display.mapStyle} onValueChange={(value) => updateDisplay('mapStyle', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Predeterminado
                        </div>
                      </SelectItem>
                      <SelectItem value="satellite">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Satélite
                        </div>
                      </SelectItem>
                      <SelectItem value="terrain">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Terreno
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Vista del mapa de rastreo
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Seguridad y Privacidad</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Gestiona la seguridad de tu cuenta
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Cambiar Contraseña</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Contraseña Actual</Label>
                      <Input id="current-password" type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nueva Contraseña</Label>
                      <Input id="new-password" type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                      <Input id="confirm-password" type="password" placeholder="••••••••" />
                    </div>
                    <Button>
                      <Lock className="h-4 w-4 mr-2" />
                      Actualizar Contraseña
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Sesiones Activas</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium">Navegador Actual</p>
                          <p className="text-sm text-muted-foreground">Chrome en Windows • Ahora</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Sesión Actual
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Configuración del Sistema</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Ajustes avanzados de la aplicación
              </p>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Actualización automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Actualizar datos del mapa automáticamente
                    </p>
                  </div>
                  <Switch
                    checked={settings.updates.autoRefresh}
                    onCheckedChange={(checked) => updateUpdates('autoRefresh', checked)}
                  />
                </div>

                {settings.updates.autoRefresh && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Intervalo de actualización</Label>
                      <Select 
                        value={settings.updates.refreshInterval.toString()} 
                        onValueChange={(value) => updateUpdates('refreshInterval', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">Cada 3 segundos</SelectItem>
                          <SelectItem value="5">Cada 5 segundos</SelectItem>
                          <SelectItem value="10">Cada 10 segundos</SelectItem>
                          <SelectItem value="30">Cada 30 segundos</SelectItem>
                          <SelectItem value="60">Cada minuto</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Frecuencia con la que se actualizan las posiciones de los buses
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Información del Sistema</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p>Versión: 2.1.0</p>
                    <p>Última actualización: Octubre 2025</p>
                    <p>Rol: {user.role === 'admin' ? 'Administrador' : 'Supervisor'}</p>
                  </div>
                </div>
              </div>
            </Card>

            {user.role === 'admin' && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Configuración de Administrador</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Opciones avanzadas disponibles solo para administradores
                </p>

                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Gestionar Usuarios
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Configurar Rutas
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Administrar Permisos
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Ver Logs del Sistema
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}