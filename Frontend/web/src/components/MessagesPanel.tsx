import React, { useState } from 'react';
import { MessageSquare, Bell, AlertTriangle, X, User, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import type { User as UserType } from './LoginPage';

interface Message {
  id: string;
  type: 'notification' | 'warning' | 'message';
  busId: string;
  busPlate: string;
  from: string;
  fromRole: 'admin' | 'supervisor';
  content: string;
  timestamp: Date;
  read: boolean;
}

interface MessagesPanelProps {
  user: UserType;
  onClose: () => void;
}

// Mock messages data
const mockMessages: Message[] = [
  {
    id: '1',
    type: 'warning',
    busId: '001',
    busPlate: 'BUS-001',
    from: 'María Supervisora',
    fromRole: 'supervisor',
    content: 'Exceso de velocidad detectado en ruta 101. Conductor notificado.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false
  },
  {
    id: '2',
    type: 'notification',
    busId: '003',
    busPlate: 'BUS-003',
    from: 'María Supervisora',
    fromRole: 'supervisor',
    content: 'Bus requiere mantenimiento preventivo. Programar revisión.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false
  },
  {
    id: '3',
    type: 'message',
    busId: '005',
    busPlate: 'BUS-005',
    from: 'María Supervisora',
    fromRole: 'supervisor',
    content: 'Conductor reporta problema con sistema de frenos. Requiere atención inmediata.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: true
  },
  {
    id: '4',
    type: 'notification',
    busId: '007',
    busPlate: 'BUS-007',
    from: 'Carlos Administrador',
    fromRole: 'admin',
    content: 'Ruta modificada para evitar tráfico en centro. Actualización completada.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true
  }
];

export function MessagesPanel({ user, onClose }: MessagesPanelProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  
  const unreadCount = messages.filter(m => !m.read).length;
  const warningCount = messages.filter(m => m.type === 'warning' && !m.read).length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    return `Hace ${diffDays} días`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'notification':
        return <Bell className="h-4 w-4 text-blue-600" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'warning':
        return <Badge className="bg-orange-100 text-orange-800">Amonestación</Badge>;
      case 'notification':
        return <Badge className="bg-blue-100 text-blue-800">Notificación</Badge>;
      case 'message':
        return <Badge className="bg-purple-100 text-purple-800">Mensaje</Badge>;
      default:
        return null;
    }
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
  };

  const filterByType = (type?: string) => {
    if (!type) return messages;
    return messages.filter(m => m.type === type);
  };

  const MessageItem = ({ message }: { message: Message }) => (
    <Card 
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        !message.read ? 'bg-blue-50 border-blue-200' : ''
      }`}
      onClick={() => markAsRead(message.id)}
    >
      <div className="flex gap-3">
        <div className="mt-1">
          {getTypeIcon(message.type)}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {getTypeBadge(message.type)}
              <Badge variant="outline">{message.busPlate}</Badge>
              {!message.read && (
                <Badge className="bg-red-500 text-white">Nuevo</Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTime(message.timestamp)}
            </span>
          </div>
          
          <p className="text-sm">{message.content}</p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{message.from}</span>
            <span>•</span>
            <span>{message.fromRole === 'admin' ? 'Administrador' : 'Supervisor'}</span>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold">Mensajes y Notificaciones</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="secondary">
            {unreadCount} sin leer
          </Badge>
          {warningCount > 0 && (
            <Badge className="bg-orange-100 text-orange-800">
              {warningCount} amonestaciones
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <div className="px-4 pt-3 border-b">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="notification">
              <Bell className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="warning">
              <AlertTriangle className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="message">
              <MessageSquare className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="all" className="p-4 space-y-3 mt-0">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay mensajes</p>
              </div>
            ) : (
              messages.map(message => (
                <MessageItem key={message.id} message={message} />
              ))
            )}
          </TabsContent>

          <TabsContent value="notification" className="p-4 space-y-3 mt-0">
            {filterByType('notification').map(message => (
              <MessageItem key={message.id} message={message} />
            ))}
          </TabsContent>

          <TabsContent value="warning" className="p-4 space-y-3 mt-0">
            {filterByType('warning').map(message => (
              <MessageItem key={message.id} message={message} />
            ))}
          </TabsContent>

          <TabsContent value="message" className="p-4 space-y-3 mt-0">
            {filterByType('message').map(message => (
              <MessageItem key={message.id} message={message} />
            ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Footer info for admin */}
      {user.role === 'admin' && (
        <div className="p-4 border-t bg-blue-50">
          <p className="text-sm text-blue-800">
            <strong>Vista de administrador:</strong> Puedes ver todos los mensajes y acciones del equipo de supervisión.
          </p>
        </div>
      )}
    </div>
  );
}