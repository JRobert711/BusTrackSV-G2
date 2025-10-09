import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Bus as BusIcon, Route, User, Clock } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { API_ENDPOINTS } from '../config/api';

function HomePage({ user, onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.BUSES, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBuses(data);
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onLogout();
      } else {
        setError('Error al cargar los datos de los buses');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (busId) => {
    try {
      const token = localStorage.getItem('token');
      const bus = buses.find(b => b.id === busId);
      const newFavoriteStatus = !bus.isFavorite;

      const response = await fetch(API_ENDPOINTS.BUS_FAVORITE(busId), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFavorite: newFavoriteStatus }),
      });

      if (response.ok) {
        setBuses(prevBuses =>
          prevBuses.map(b =>
            b.id === busId ? { ...b, isFavorite: newFavoriteStatus } : b
          )
        );
      } else {
        setError('Error al actualizar favorito');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const filteredBuses = buses.filter((bus) => {
    const matchesSearch = 
      bus.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.driver.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || bus.status === statusFilter;
    const matchesFavorites = !showFavoritesOnly || bus.isFavorite;

    return matchesSearch && matchesStatus && matchesFavorites;
  });

  const getStatusCounts = () => {
    return {
      total: buses.length,
      moving: buses.filter(b => b.status === 'moving').length,
      parked: buses.filter(b => b.status === 'parked').length,
      favorites: buses.filter(b => b.isFavorite).length
    };
  };

  const counts = getStatusCounts();

  const getStatusText = (status) => {
    switch (status) {
      case 'moving': return 'En Movimiento';
      case 'parked': return 'Estacionado';
      case 'maintenance': return 'Mantenimiento';
      default: return 'Desconocido';
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de buses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BusIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">BusTrack</h1>
            <p className="text-base text-gray-600">Flota de Buses</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por placa, ruta o conductor"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="moving">En Movimiento</option>
              <option value="parked">Estacionado</option>
              <option value="maintenance">Mantenimiento</option>
            </select>
            
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="px-3"
            >
              <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Fleet Summary */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="text-sm font-medium">{counts.total}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Favoritos:</span>
              <span className="text-sm font-medium">{counts.favorites}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">En mov:</span>
              <span className="text-sm font-medium text-green-600">{counts.moving}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Parados:</span>
              <span className="text-sm font-medium text-yellow-600">{counts.parked}</span>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <BusIcon className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setError('')}
              className="mt-2"
            >
              Cerrar
            </Button>
          </div>
        )}

        {/* User info and logout */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Bienvenido, {user?.username || 'Usuario'}</span>
            <Button variant="outline" size="sm" onClick={onLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Bus List */}
        <div className="space-y-4">
          {filteredBuses.length === 0 ? (
            <div className="text-center py-12">
              <BusIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No se encontraron buses</p>
              <p className="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            filteredBuses.map((bus) => (
              <div key={bus.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(bus.id)}
                      className="p-1 h-auto"
                    >
                      <Star 
                        className={`h-4 w-4 ${
                          bus.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                        }`}
                      />
                    </Button>
                    <div>
                      <h3 className="font-bold text-xl text-black">{bus.licensePlate}</h3>
                      <p className="text-base text-gray-600">{bus.unitName}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base text-gray-600">{getStatusText(bus.status)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-base text-gray-600">
                    <Route className="h-4 w-4" />
                    <span>Ruta {bus.route}</span>
                  </div>

                  <div className="flex items-center gap-2 text-base text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{bus.driver}</span>
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-1 text-base">
                      <Clock className="h-3 w-3 text-green-600" />
                      <span className="text-gray-600">En mov:</span>
                      <span className="font-medium">{formatTime(bus.movingTime)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-base">
                      <Clock className="h-3 w-3 text-yellow-600" />
                      <span className="text-gray-600">Parado:</span>
                      <span className="font-medium">{formatTime(bus.parkedTime)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export { HomePage };
