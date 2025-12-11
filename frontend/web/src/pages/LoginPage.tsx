import React, { useState } from 'react';
import { Bus, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components//ui/button';
import { Input } from '../components//ui/input';
import { Label } from '../components//ui/label';
import { Card } from '../components//ui/card';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onGoToRegister: () => void;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor';
  avatar?: string;
  department: string;
  phone: string;
  joinDate: string;
}

// Mock users for demo
const mockUsers: Record<string, User> = {
  'admin@bustrack.com': {
    id: '1',
    email: 'admin@bustrack.com',
    name: 'Carlos Administrador',
    role: 'admin',
    department: 'Gerencia General',
    phone: '+506 8888-0001',
    joinDate: '2020-01-15'
  },
  'supervisor@bustrack.com': {
    id: '2',
    email: 'supervisor@bustrack.com',
    name: 'María Supervisora',
    role: 'supervisor',
    department: 'Operaciones',
    phone: '+506 8888-0002',
    joinDate: '2021-03-20'
  }
};

export function LoginPage({ onLogin, onGoToRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simple validation
    const user = mockUsers[email];
    if (user && password === 'demo123') {
      onLogin(user);
    } else {
      setError('Credenciales incorrectas.');
    }
  };

  // Quick login removed from UI for production

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden md:block space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <Bus className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">BusTrack</h1>
              <p className="text-lg text-gray-600">Sistema de Gestión de Flotas</p>
            </div>
          </div>
          
          <div className="space-y-4 pl-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-gray-900">Monitoreo en Tiempo Real</h3>
                <p className="text-gray-600">Visualiza la ubicación y estado de toda tu flota en un solo lugar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-gray-900">Reportes Detallados</h3>
                <p className="text-gray-600">Accede a estadísticas y métricas de rendimiento de cada unidad</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-gray-900">Gestión Eficiente</h3>
                <p className="text-gray-600">Optimiza rutas y tiempos de mantenimiento</p>
              </div>
            </div>
          </div>

          
        </div>

        {/* Right side - Login form */}
        <Card className="p-8 shadow-xl">
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
              <p className="text-gray-600 mt-2">Ingresa a tu cuenta de BusTrack</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@bustrack.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full">
                Iniciar Sesión
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={onGoToRegister}
                className="text-sm text-blue-600 hover:underline"
              >
                ¿No tienes cuenta? Regístrate
              </button>
            </div>

            
          </div>
        </Card>
      </div>
    </div>
  );
}