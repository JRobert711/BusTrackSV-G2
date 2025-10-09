// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com' 
  : ''; // Use proxy in development

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  BUSES: `${API_BASE_URL}/api/buses`,
  BUS_FAVORITE: (busId) => `${API_BASE_URL}/api/buses/${busId}/favorite`,
  TEST: `${API_BASE_URL}/api/test`
};

export default API_BASE_URL;
