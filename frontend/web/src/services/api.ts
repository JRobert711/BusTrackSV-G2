/**
 * API Service for BusTrack SV
 * 
 * Handles all HTTP requests to the backend API
 */

// Backend API URL - configured via environment variable
// Default to localhost for development if not set
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Normalize the URL - ensure it doesn't end with a slash
API_BASE_URL = API_BASE_URL.trim().replace(/\/$/, '');

// Validate URL format
try {
  new URL(API_BASE_URL);
} catch (error) {
  console.error('Invalid API_BASE_URL format:', API_BASE_URL);
  API_BASE_URL = 'http://localhost:5000/api/v1';
  console.warn('Falling back to default:', API_BASE_URL);
}

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn(
    'VITE_API_BASE_URL is not defined. Using default: http://localhost:5000/api/v1\n' +
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
  role?: 'admin' | 'supervisor';
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'supervisor';
    createdAt: string;
    updatedAt: string;
  };
  token: string;
  refreshToken: string;
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
        throw {
          error: 'No se pudo conectar al servidor. Asegúrate de que el servidor backend esté ejecutándose en http://localhost:5000',
          type: 'NETWORK_ERROR',
          details: { url, message: error.message }
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

  // ============================================
  // Users
  // ============================================

  async getUsers(params?: {
    role?: 'admin' | 'supervisor';
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
    role?: 'admin' | 'supervisor';
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: string, updates: {
    name?: string;
    role?: 'admin' | 'supervisor';
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
  // Health Check
  // ============================================

  async healthCheck(): Promise<{ status: string; service: string; version: string }> {
    return fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`).then(r => r.json());
  }
}

export const api = new ApiService();
export type { Bus, BusesResponse, ApiError, AuthResponse, LoginRequest, RegisterRequest };
