/**
 * API Service for BusTrack SV
 * 
 * Handles all HTTP requests to the backend API
 */

// Backend API URL - configured via environment variable
// In production, VITE_API_BASE_URL must be set
const normalizeApiBase = (raw?: string): string => {
  // In production, require the environment variable
  if (import.meta.env.PROD && !raw) {
    throw new Error(
      'VITE_API_BASE_URL environment variable is required in production. ' +
      'Please set it in your build environment.'
    );
  }
  
  // In development, use default if not set
  const defaultUrl = import.meta.env.DEV 
    ? 'http://localhost:5000/api/v1'
    : null;
  
  let base = (raw || defaultUrl || '').trim();
  
  if (!base) {
    throw new Error('API base URL is not configured');
  }
  
  // Strip trailing slash
  base = base.replace(/\/+$/, '');
  
  // If it does not end with /api/v1, append it
  if (!/\/api(\/v1)?$/.test(base)) {
    base = `${base}/api/v1`;
  }
  
  try {
    new URL(base);
  } catch (error) {
    console.error('Invalid API_BASE_URL format:', raw);
    throw new Error(`Invalid API base URL format: ${raw}`);
  }
  
  return base;
};

let API_BASE_URL: string;

try {
  API_BASE_URL = normalizeApiBase(import.meta.env.VITE_API_BASE_URL);
} catch (error) {
  console.error('Failed to configure API base URL:', error);
  throw error;
}

if (!import.meta.env.VITE_API_BASE_URL && import.meta.env.DEV) {
  console.warn(
    '⚠️  VITE_API_BASE_URL is not defined. Using development default: http://localhost:5000/api/v1\n' +
    'To set a custom URL, create a .env file in frontend/web/ with:\n' +
    'VITE_API_BASE_URL=http://localhost:5000/api/v1'
  );
}

console.log('API Base URL configured:', API_BASE_URL);

interface ApiError {
  error: string;
  type: string;
  details?: Record<string, string>;
}

interface Bus {
  id: string;
  licensePlate: string;
  unitName: string;
  status: 'parked' | 'moving' | 'maintenance';
  route: string;
  driver: string | null;
  movingTime: number;
  parkedTime: number;
  isFavorite: boolean;
  position: {
    lat: number;
    lng: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface BusesResponse {
  data: Bus[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  role?: 'admin' | 'supervisor' | 'driver';
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'supervisor' | 'driver';
    createdAt: string;
    updatedAt: string;
  };
  token: string;
  refreshToken: string;
  firebaseCustomToken?: string | null;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: 'active' | 'inactive' | 'on_leave';
  experience: number;
  assignedBus: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  type: 'notification' | 'warning' | 'alert';
  busId: string | null;
  busPlate: string | null;
  route: string | null;
  fromUserId: string | null;
  fromName: string | null;
  fromRole: string | null;
  content: string;
  severity: 'info' | 'warning' | 'critical';
  metadata: Record<string, unknown>;
  read: boolean;
  timestamp?: string | Date | null;
  createdAt?: string;
  updatedAt?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${normalizedEndpoint}`;
    
    // Validate URL before making request
    try {
      new URL(url);
    } catch (error) {
      console.error('Invalid URL constructed:', url);
      throw {
        error: `URL inválida: ${url}`,
        type: 'INVALID_URL',
        details: { url, endpoint, apiBaseUrl: API_BASE_URL }
      };
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token inválido/expirado: limpiamos y propagamos
          this.clearToken();
        }
        throw {
          status: response.status,
          ...data,
        };
      }

      return data;
    } catch (error: any) {
      if (error instanceof TypeError) {
        // Network error - connection refused, etc.
        console.error('Network error:', error.message, 'URL:', url);
        const apiBase = API_BASE_URL.replace('/api/v1', '').replace(/\/+$/, '');
        throw {
          error: `No se pudo conectar al servidor. Asegúrate de que el servidor backend esté ejecutándose en ${apiBase}`,
          type: 'NETWORK_ERROR',
          details: { url, message: error.message, apiBaseUrl: API_BASE_URL }
        };
      }
      throw error;
    }
  }

  // ============================================
  // Authentication
  // ============================================

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.setToken(response.token);
    return response;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    this.setToken(response.token);
    return response;
  }

  async getCurrentUser(): Promise<AuthResponse['user']> {
    return this.request<AuthResponse['user']>('/auth/me');
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    
    this.setToken(response.token);
    return response;
  }

  // ============================================
  // Buses
  // ============================================

  async getBuses(params?: {
    page?: number;
    pageSize?: number;
    status?: 'parked' | 'moving' | 'maintenance';
    route?: string;
    sort?: 'createdAt' | 'licensePlate' | 'unitName' | 'status';
    order?: 'asc' | 'desc';
  }): Promise<BusesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const query = queryParams.toString();
    const endpoint = query ? `/buses?${query}` : '/buses';
    
    return this.request<BusesResponse>(endpoint);
  }

  async getBusById(id: string): Promise<{ bus: Bus }> {
    return this.request<{ bus: Bus }>(`/buses/${id}`);
  }

  async createBus(bus: Omit<Bus, 'id' | 'createdAt' | 'updatedAt' | 'movingTime' | 'parkedTime' | 'isFavorite' | 'position'>): Promise<{ bus: Bus }> {
    return this.request<{ bus: Bus }>('/buses', {
      method: 'POST',
      body: JSON.stringify(bus),
    });
  }

  async updateBus(id: string, updates: Partial<Bus>): Promise<{ bus: Bus }> {
    return this.request<{ bus: Bus }>(`/buses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async toggleFavorite(id: string): Promise<{ bus: Bus }> {
    return this.request<{ bus: Bus }>(`/buses/${id}/favorite`, {
      method: 'PATCH',
    });
  }

  async updateBusPosition(id: string, position: { lat: number; lng: number }): Promise<{ bus: Bus }> {
    return this.request<{ bus: Bus }>(`/buses/${id}/position`, {
      method: 'PATCH',
      body: JSON.stringify(position),
    });
  }

  async deleteBus(id: string): Promise<void> {
    await this.request<void>(`/buses/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get bus assigned to a driver by user ID or name
   * Used by drivers to get their assigned bus
   */
  async getBusByDriver(userIdOrName: string): Promise<Bus | null> {
    try {
      // Get all buses and find one where driver matches user ID or name
      const response = await this.getBuses({ pageSize: 100 });
      const bus = response.data.find(b => {
        if (!b.driver) return false;
        // Match by exact ID, exact name, or case-insensitive name
        return b.driver === userIdOrName || 
               b.driver.toLowerCase() === userIdOrName.toLowerCase();
      });
      return bus || null;
    } catch (err) {
      console.error('Error getting bus by driver:', err);
      return null;
    }
  }

  /**
   * Send GPS location from driver device
   * @param payload - GPS data with idBus, Lat, Lon, Acc
   */
  async sendLocation(payload: {
    idBus: string;
    Lat: number;
    Lon: number;
    Acc: number;
  }): Promise<{ bus: Bus }> {
    // Convert to API format (Lat -> lat, Lon -> lng)
    return this.updateBusPosition(payload.idBus, {
      lat: payload.Lat,
      lng: payload.Lon
    });
  }

  // ============================================
  // Users
  // ============================================

  async getUsers(params?: {
    role?: 'admin' | 'supervisor' | 'driver';
    limit?: number;
  }): Promise<{ data: Array<AuthResponse['user']> }> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const query = queryParams.toString();
    const endpoint = query ? `/users?${query}` : '/users';
    
    return this.request<{ data: Array<AuthResponse['user']> }>(endpoint);
  }

  async getUserById(id: string): Promise<{ user: AuthResponse['user'] }> {
    return this.request<{ user: AuthResponse['user'] }>(`/users/${id}`);
  }

  async createUser(user: {
    email: string;
    name: string;
    password: string;
    role?: 'admin' | 'supervisor' | 'driver';
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: string, updates: {
    name?: string;
    role?: 'admin' | 'supervisor' | 'driver';
  }): Promise<{ user: AuthResponse['user'] }> {
    return this.request<{ user: AuthResponse['user'] }>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // Drivers
  // ============================================

  async getDrivers(params?: { status?: Driver['status']; assignedBus?: string }): Promise<{ data: Driver[] }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    const endpoint = query ? `/drivers?${query}` : '/drivers';
    return this.request<{ data: Driver[] }>(endpoint);
  }

  async createDriver(data: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ driver: Driver }> {
    return this.request<{ driver: Driver }>('/drivers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDriver(id: string, updates: Partial<Omit<Driver, 'id'>>): Promise<{ driver: Driver }> {
    return this.request<{ driver: Driver }>(`/drivers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteDriver(id: string): Promise<void> {
    await this.request<void>(`/drivers/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // Notifications
  // ============================================

  async getNotifications(params?: { read?: boolean; type?: NotificationItem['type']; limit?: number }): Promise<{ data: NotificationItem[] }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    const endpoint = query ? `/notifications?${query}` : '/notifications';
    return this.request<{ data: NotificationItem[] }>(endpoint);
  }

  async markNotificationRead(id: string, read = true): Promise<{ notification: NotificationItem }> {
    return this.request<{ notification: NotificationItem }>(`/notifications/${id}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ read }),
    });
  }

  async deleteNotification(id: string): Promise<void> {
    await this.request<void>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // Health Check
  // ============================================

  async healthCheck(): Promise<{ status: string; service: string; version: string }> {
    return fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`).then(r => r.json());
  }
}

export const api = new ApiService();
export type { Bus, BusesResponse, ApiError, AuthResponse, LoginRequest, RegisterRequest, Driver, NotificationItem };
