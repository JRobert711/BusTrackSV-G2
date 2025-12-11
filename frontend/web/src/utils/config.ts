/**
 * Utility functions for configuration and hardcoded data
 * 
 * TODO: These should ideally come from the backend API
 * For now, they can be configured via environment variables
 */

/**
 * Get available bus routes
 * In the future, this should fetch from an API endpoint
 */
export function getAvailableRoutes(): string[] {
  const routesEnv = import.meta.env.VITE_AVAILABLE_ROUTES;
  if (routesEnv) {
    try {
      return JSON.parse(routesEnv);
    } catch (e) {
      console.warn('Failed to parse VITE_AVAILABLE_ROUTES, using defaults', e);
    }
  }
  // Fallback to default routes
  return ['101', '102', '201', '205', '301', '305', '401', '501'];
}

/**
 * Get available drivers
 * In the future, this should fetch from an API endpoint (api.getDrivers())
 */
export function getAvailableDrivers(): string[] {
  const driversEnv = import.meta.env.VITE_AVAILABLE_DRIVERS;
  if (driversEnv) {
    try {
      return JSON.parse(driversEnv);
    } catch (e) {
      console.warn('Failed to parse VITE_AVAILABLE_DRIVERS, using defaults', e);
    }
  }
  // Fallback to default drivers (these should come from backend)
  return [
    'Carlos Rodríguez', 'María González', 'José López', 'Ana Martínez',
    'Luis Hernández', 'Carmen Jiménez', 'Roberto Silva', 'Patricia Vargas',
    'Miguel Castillo', 'Laura Morales', 'Fernando Vega', 'Sofía Ramírez'
  ];
}

/**
 * Get default route for new buses
 */
export function getDefaultRoute(): string {
  return import.meta.env.VITE_DEFAULT_ROUTE || '101';
}

