const API_BASE_URL = '/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    name: string;
    role: string;
  };
}

export interface Bus {
  id: string;
  licensePlate: string;
  unitName: string;
  status: 'moving' | 'parked' | 'maintenance' | 'needs_urgent_maintenance' | 'usable';
  route: string;
  driver: string;
  movingTime: number;
  parkedTime: number;
  isFavorite: boolean;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('bustrack_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Save token to localStorage and instance
    this.token = response.token;
    localStorage.setItem('bustrack_token', response.token);

    return response;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('bustrack_token');
    localStorage.removeItem('bustrack_user');
  }

  async getBuses(): Promise<Bus[]> {
    return this.request<Bus[]>('/buses');
  }

  async updateBusFavorite(busId: string, isFavorite: boolean): Promise<Bus> {
    return this.request<Bus>(`/buses/${busId}/favorite`, {
      method: 'PATCH',
      body: JSON.stringify({ isFavorite }),
    });
  }

  async testConnection(): Promise<{ message: string; status: string; timestamp: string }> {
    return this.request('/test');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService();

