/**
 * API Service for BusTrack SV
 * 
 * Handles all HTTP requests to the backend API
 */

// Backend API URL - configured for local development
// TODO: Update this URL for production deployment
const API_BASE_URL = 'http://localhost:5000/api/v1';

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
    const url = `${API_BASE_URL}${endpoint}`;
    
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
    } catch (error) {
      if (error instanceof TypeError) {
        // Network error
        throw {
          error: 'No se pudo conectar al servidor',
          type: 'NETWORK_ERROR',
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
  // Health Check
  // ============================================

  async healthCheck(): Promise<{ status: string; service: string; version: string }> {
    return fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`).then(r => r.json());
  }
}

export const api = new ApiService();
export type { Bus, BusesResponse, ApiError, AuthResponse, LoginRequest, RegisterRequest };
