import React, { useState } from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { Button } from '../components//ui/button';
import { Card } from '../components//ui/card';
import { Label } from '../components//ui/label';
import { Switch } from '../components//ui/switch';
import { Separator } from '../components//ui/separator';
import type { User as UserType } from './LoginPage';

interface SettingsProps {
  user: UserType;
  onBack: () => void;
}

interface NotificationSettings {
  busStatus: boolean;
  maintenance: boolean;
  routeAlerts: boolean;
  email: boolean;
  push: boolean;
}

export function Settings({ user, onBack }: SettingsProps) {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    busStatus: true,
    maintenance: true,
    routeAlerts: true,
    email: true,
    push: false,
  });

  const updateNotification = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications({
      ...notifications,
      [key]: value,
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
            <p className="text-sm text-muted-foreground">Personaliza tus notificaciones</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-3xl mx-auto">
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
                    checked={notifications.busStatus}
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
                    checked={notifications.maintenance}
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
                    checked={notifications.routeAlerts}
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
                    checked={notifications.email}
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
                    checked={notifications.push}
                    onCheckedChange={(checked) => updateNotification('push', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
