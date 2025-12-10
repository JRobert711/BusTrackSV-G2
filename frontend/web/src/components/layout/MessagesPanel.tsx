import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, X, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import type { User as UserType } from '../../pages/LoginPage';
import { api, type NotificationItem } from '../../services/api';

type Message = NotificationItem & { timestamp: Date };

interface MessagesPanelProps {
  user: UserType;
  onClose: () => void;
}

export function MessagesPanel({ user, onClose }: MessagesPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await api.getNotifications({ limit: 50 });
        const notifications = response.data.map((item) => ({
          ...item,
          timestamp: item.timestamp ? new Date(item.timestamp as any) : new Date()
        }));
        setMessages(notifications);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching notifications:', err);
        setError(err.error || 'No se pudo conectar al servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

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

  const getTypeIcon = (type: string, severity: string) => {
    if (severity === 'critical' || type === 'warning' || type === 'alert') {
      return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    }
    return <Bell className="h-4 w-4 text-blue-600" />;
  };

  const getTypeBadge = (type: string, severity: string) => {
    const label = type === 'warning' || type === 'alert' ? 'Alerta' : 'Notificación';
    const className =
      severity === 'critical'
        ? 'bg-red-100 text-red-800'
        : type === 'warning' || type === 'alert'
          ? 'bg-orange-100 text-orange-800'
          : 'bg-blue-100 text-blue-800';
    return <Badge className={className}>{label}</Badge>;
  };

  const markAsRead = async (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
    try {
      await api.markNotificationRead(messageId, true);
    } catch (err) {
      console.error('Error marking notification as read', err);
    }
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
          {getTypeIcon(message.type, message.severity)}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {getTypeBadge(message.type, message.severity)}
              {message.busPlate && <Badge variant="outline">{message.busPlate}</Badge>}
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
            <span>{message.fromName || 'Sistema'}</span>
            <span>•</span>
            <span>{message.fromRole === 'admin' ? 'Administrador' : message.fromRole || 'Alerta'}</span>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l shadow-lg z-50 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold">Notificaciones</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3 pb-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50 animate-pulse" />
              <p>Cargando notificaciones...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
              <p className="font-semibold">Error al cargar notificaciones</p>
              <p className="text-sm mt-2">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay notificaciones</p>
              <p className="text-sm mt-2">Todos los buses operan normalmente</p>
            </div>
          ) : (
            messages.map(message => (
              <MessageItem key={message.id} message={message} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}