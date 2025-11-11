import React from 'react';
import { WifiOff, RefreshCw, Server, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

interface BackendErrorPageProps {
  onRetry: () => void;
}

export function BackendErrorPage({ onRetry }: BackendErrorPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-12 shadow-2xl">
        <div className="text-center space-y-8">
          {/* Icon Animation */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-red-500 rounded-full p-6">
              <WifiOff className="h-16 w-16 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-4xl text-gray-900">
              Servicio temporalmente no disponible
            </h1>
            <p className="text-xl text-gray-600">
              No se pudo establecer conexión con el sistema BusTrack
            </p>
          </div>

          {/* Error Details */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3 text-left">
              <Server className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Dirección del servicio:</strong> {import.meta.env?.VITE_API_URL || "http://localhost:3000/api"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-left">
              <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Posibles causas:</strong>
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside">
                  <li>El sistema está en mantenimiento</li>
                  <li>Problemas de conexión de red</li>
                  <li>El servicio no está disponible temporalmente</li>
                  <li>Error de configuración del sistema</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button 
              onClick={onRetry} 
              size="lg"
              className="w-full text-lg h-14"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Reintentar Conexión
            </Button>

            <div className="text-sm text-gray-500">
              <p>Si el problema persiste, contacta al administrador del sistema</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-3">
              Recomendaciones:
            </h3>
            <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
              <li>Verifica tu conexión a internet</li>
              <li>Intenta recargar la página en unos momentos</li>
              <li>Contacta al administrador del sistema si el error persiste</li>
              <li>Verifica que no haya restricciones de red o firewall</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}
