import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, LogOut, Bus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Header } from '../components/layout/Header';
import { api, type Bus as ApiBus } from '../services/api';
import { toast } from '../utils/toast';
import type { User } from './LoginPage';

interface DriverPageProps {
  user: User;
  onLogout: () => void;
  onNavigate: (view: 'dashboard' | 'profile' | 'settings') => void;
}

interface BusInfo {
  id: string;
  licensePlate: string;
  unitName: string;
  route: string | null;
  status: 'parked' | 'moving' | 'maintenance';
}

interface LocationData {
  lat: number;
  lon: number;
  acc: number;
}

export function DriverPage({ user, onLogout, onNavigate }: DriverPageProps) {
  const [busInfo, setBusInfo] = useState<BusInfo | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Iniciando seguimiento...');
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const trackingIntervalRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar información del bus asignado
  useEffect(() => {
    const loadBusInfo = async () => {
      try {
        setLoading(true);
        // Try to find bus by user ID first, then by user name
        let bus = await api.getBusByDriver(user.id);
        if (!bus) {
          bus = await api.getBusByDriver(user.name);
        }
        
        if (bus) {
          setBusInfo({
            id: bus.id,
            licensePlate: bus.licensePlate,
            unitName: bus.unitName,
            route: bus.route,
            status: bus.status
          });
        } else {
          // Don't show error toast immediately, let the UI show the message
          console.warn('No bus assigned to user:', user.id, user.name);
        }
      } catch (err: any) {
        console.error('Error al cargar bus:', err);
        toast.error('Error al cargar información del bus', {
          description: err.error || 'No se pudo obtener la información del bus'
        });
      } finally {
        setLoading(false);
      }
    };

    loadBusInfo();
  }, [user.id, user.name]);

  // Iniciar tracking GPS
  useEffect(() => {
    if (!busInfo || !isTracking) return;

    if (!navigator.geolocation) {
      setLocationStatus('Tu navegador no soporta geolocalización');
      setIsTracking(false);
      return;
    }

    const startTracking = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const acc = pos.coords.accuracy;

          const locationData: LocationData = { lat, lon, acc };
          setCurrentLocation(locationData);
          setLocationStatus(
            `Lat: ${lat.toFixed(6)}\nLon: ${lon.toFixed(6)}\nAcc: (±${Math.round(acc)} m)`
          );

          // Enviar ubicación al backend
          if (busInfo) {
            api.sendLocation({
              idBus: busInfo.id,
              Lat: lat,
              Lon: lon,
              Acc: acc
            }).catch((err) => {
              console.error('Error al enviar ubicación:', err);
              // No mostrar toast para cada error, solo loguear
            });
          }
        },
        (err) => {
          console.error('Error GPS:', err);
          setLocationStatus(`Error al obtener GPS: ${err.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    };

    // Ejecutar inmediatamente
    startTracking();

    // Configurar intervalo de 2 segundos
    trackingIntervalRef.current = window.setInterval(startTracking, 2000);

    return () => {
      if (trackingIntervalRef.current !== null) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
    };
  }, [busInfo, isTracking]);

  // Iniciar tracking automáticamente cuando se carga el bus
  useEffect(() => {
    if (busInfo && !loading) {
      setIsTracking(true);
    }
  }, [busInfo, loading]);

  const handleStopTracking = () => {
    setIsTracking(false);
    if (trackingIntervalRef.current !== null) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    setLocationStatus('Seguimiento detenido');
  };

  const handleStartTracking = () => {
    setIsTracking(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700">Cargando información del bus...</div>
        </div>
      </div>
    );
  }

  if (!busInfo) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full">
            <div className="text-center">
              <Bus className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">No hay bus asignado</h2>
              <p className="text-gray-600 mb-4">
                No tienes un bus asignado. Por favor, contacta al administrador para que te asigne un bus.
              </p>
              <Button onClick={onLogout} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 p-4 max-w-4xl mx-auto w-full">
        <div className="space-y-4">
          {/* Información del usuario y bus */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-2">
              Bienvenido, <span className="text-blue-600">{user.name}</span>
            </h2>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Bus className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-gray-600">Bus: </span>
                  <strong className="text-lg">{busInfo.licensePlate}</strong>
                </div>
              </div>
              {busInfo.route && (
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-gray-500" />
                  <div>
                    <span className="text-gray-600">Ruta: </span>
                    <strong>{busInfo.route}</strong>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className={`w-3 h-3 rounded-full ${
                    busInfo.status === 'moving' ? 'bg-green-500' :
                    busInfo.status === 'parked' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                </div>
                <div>
                  <span className="text-gray-600">Estado: </span>
                  <strong className={
                    busInfo.status === 'moving' ? 'text-green-600' :
                    busInfo.status === 'parked' ? 'text-yellow-600' :
                    'text-red-600'
                  }>
                    {busInfo.status === 'moving' ? 'En movimiento' :
                     busInfo.status === 'parked' ? 'Estacionado' :
                     'En mantenimiento'}
                  </strong>
                </div>
              </div>
            </div>
          </Card>

          {/* Ubicación en tiempo real */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Ubicación en tiempo real
              </h3>
              {isTracking ? (
                <Button onClick={handleStopTracking} variant="destructive" size="sm">
                  Detener seguimiento
                </Button>
              ) : (
                <Button onClick={handleStartTracking} variant="default" size="sm">
                  Iniciar seguimiento
                </Button>
              )}
            </div>
            
            <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre-line">
              {locationStatus}
            </div>

            {currentLocation && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-700">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-semibold">Latitud:</span> {currentLocation.lat.toFixed(6)}
                    </div>
                    <div>
                      <span className="font-semibold">Longitud:</span> {currentLocation.lon.toFixed(6)}
                    </div>
                    <div className="col-span-2">
                      <span className="font-semibold">Precisión:</span> ±{Math.round(currentLocation.acc)} metros
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isTracking && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Enviando ubicación cada 2 segundos...</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

