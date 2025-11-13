/*
 * GTFS API Service (Commented - Ready to activate)
 *
 * To activate:
 * 1. Uncomment all content in this file
 * 2. Ensure GTFS routes are active in backend
 *
 * Usage:
 * import { fetchStops, fetchNearbyStops } from '@/services/gtfsApi';
 * const stops = await fetchStops({ limit: 50 });
 */

/*
import {
  GTFSAgency,
  GTFSStop,
  GTFSRoute,
  GTFSTrip,
  GTFSStopTime,
  GTFSListResponse,
  StopSearchQuery,
  NearbyStopsQuery,
  RouteSearchQuery,
  TripSearchQuery,
  BulkStopTimesPayload
} from '../types/gtfs.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// ============================================
// Helper function to get auth token
// ============================================

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

// ============================================
// AGENCIES API
// ============================================

export async function fetchAgencies(): Promise<GTFSListResponse<GTFSAgency>> {
  const response = await fetch(`${API_URL}/gtfs/agencies`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch agencies: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchAgency(id: string): Promise<GTFSAgency> {
  const response = await fetch(`${API_URL}/gtfs/agencies/${id}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch agency: ${response.statusText}`);
  }

  return response.json();
}

export async function createAgency(agency: Omit<GTFSAgency, 'id' | 'createdAt' | 'updatedAt'>): Promise<GTFSAgency> {
  const response = await fetch(`${API_URL}/gtfs/agencies`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(agency)
  });

  if (!response.ok) {
    throw new Error(`Failed to create agency: ${response.statusText}`);
  }

  return response.json();
}

export async function updateAgency(id: string, updates: Partial<GTFSAgency>): Promise<GTFSAgency> {
  const response = await fetch(`${API_URL}/gtfs/agencies/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    throw new Error(`Failed to update agency: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteAgency(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/gtfs/agencies/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to delete agency: ${response.statusText}`);
  }
}

// ============================================
// STOPS API
// ============================================

export async function fetchStops(query?: StopSearchQuery): Promise<GTFSListResponse<GTFSStop>> {
  const params = new URLSearchParams();
  if (query?.locationType) params.append('locationType', query.locationType);
  if (query?.parentStation) params.append('parentStation', query.parentStation);
  if (query?.limit) params.append('limit', query.limit.toString());

  const response = await fetch(`${API_URL}/gtfs/stops?${params}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch stops: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchStop(id: string): Promise<GTFSStop> {
  const response = await fetch(`${API_URL}/gtfs/stops/${id}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch stop: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchNearbyStops(query: NearbyStopsQuery): Promise<GTFSListResponse<GTFSStop>> {
  const params = new URLSearchParams({
    lat: query.lat.toString(),
    lng: query.lng.toString()
  });
  if (query.radius) params.append('radius', query.radius.toString());

  const response = await fetch(`${API_URL}/gtfs/stops/nearby?${params}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch nearby stops: ${response.statusText}`);
  }

  return response.json();
}

export async function createStop(stop: Omit<GTFSStop, 'id' | 'createdAt' | 'updatedAt'>): Promise<GTFSStop> {
  const response = await fetch(`${API_URL}/gtfs/stops`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(stop)
  });

  if (!response.ok) {
    throw new Error(`Failed to create stop: ${response.statusText}`);
  }

  return response.json();
}

export async function updateStop(id: string, updates: Partial<GTFSStop>): Promise<GTFSStop> {
  const response = await fetch(`${API_URL}/gtfs/stops/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    throw new Error(`Failed to update stop: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteStop(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/gtfs/stops/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to delete stop: ${response.statusText}`);
  }
}

// ============================================
// ROUTES API
// ============================================

export async function fetchRoutes(query?: RouteSearchQuery): Promise<GTFSListResponse<GTFSRoute>> {
  const params = new URLSearchParams();
  if (query?.type) params.append('type', query.type);
  if (query?.agencyId) params.append('agencyId', query.agencyId);
  if (query?.limit) params.append('limit', query.limit.toString());

  const response = await fetch(`${API_URL}/gtfs/routes?${params}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch routes: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchRoute(id: string): Promise<GTFSRoute> {
  const response = await fetch(`${API_URL}/gtfs/routes/${id}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch route: ${response.statusText}`);
  }

  return response.json();
}

export async function createRoute(route: Omit<GTFSRoute, 'id' | 'createdAt' | 'updatedAt'>): Promise<GTFSRoute> {
  const response = await fetch(`${API_URL}/gtfs/routes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(route)
  });

  if (!response.ok) {
    throw new Error(`Failed to create route: ${response.statusText}`);
  }

  return response.json();
}

export async function updateRoute(id: string, updates: Partial<GTFSRoute>): Promise<GTFSRoute> {
  const response = await fetch(`${API_URL}/gtfs/routes/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    throw new Error(`Failed to update route: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteRoute(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/gtfs/routes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to delete route: ${response.statusText}`);
  }
}

// ============================================
// TRIPS API
// ============================================

export async function fetchTrips(query?: TripSearchQuery): Promise<GTFSListResponse<GTFSTrip>> {
  const params = new URLSearchParams();
  if (query?.routeId) params.append('routeId', query.routeId);
  if (query?.serviceId) params.append('serviceId', query.serviceId);
  if (query?.directionId) params.append('directionId', query.directionId);
  if (query?.limit) params.append('limit', query.limit.toString());

  const response = await fetch(`${API_URL}/gtfs/trips?${params}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch trips: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchTrip(id: string): Promise<GTFSTrip> {
  const response = await fetch(`${API_URL}/gtfs/trips/${id}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch trip: ${response.statusText}`);
  }

  return response.json();
}

export async function createTrip(trip: Omit<GTFSTrip, 'id' | 'createdAt' | 'updatedAt'>): Promise<GTFSTrip> {
  const response = await fetch(`${API_URL}/gtfs/trips`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(trip)
  });

  if (!response.ok) {
    throw new Error(`Failed to create trip: ${response.statusText}`);
  }

  return response.json();
}

export async function updateTrip(id: string, updates: Partial<GTFSTrip>): Promise<GTFSTrip> {
  const response = await fetch(`${API_URL}/gtfs/trips/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    throw new Error(`Failed to update trip: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteTrip(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/gtfs/trips/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to delete trip: ${response.statusText}`);
  }
}

// ============================================
// STOP TIMES API
// ============================================

export async function fetchTripStopTimes(tripId: string): Promise<GTFSListResponse<GTFSStopTime>> {
  const response = await fetch(`${API_URL}/gtfs/trips/${tripId}/stop-times`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch trip stop times: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchStopStopTimes(stopId: string): Promise<GTFSListResponse<GTFSStopTime>> {
  const response = await fetch(`${API_URL}/gtfs/stops/${stopId}/stop-times`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch stop times: ${response.statusText}`);
  }

  return response.json();
}

export async function createStopTime(stopTime: Omit<GTFSStopTime, 'id' | 'createdAt' | 'updatedAt'>): Promise<GTFSStopTime> {
  const response = await fetch(`${API_URL}/gtfs/stop-times`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(stopTime)
  });

  if (!response.ok) {
    throw new Error(`Failed to create stop time: ${response.statusText}`);
  }

  return response.json();
}

export async function bulkCreateStopTimes(tripId: string, payload: BulkStopTimesPayload): Promise<GTFSListResponse<GTFSStopTime>> {
  const response = await fetch(`${API_URL}/gtfs/trips/${tripId}/stop-times/bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Failed to bulk create stop times: ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function formatTime(time: string): string {
  // Convert HH:MM:SS to readable format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function getRouteColor(route: GTFSRoute): string {
  return route.color ? `#${route.color}` : '#000000';
}

export function getRouteTextColor(route: GTFSRoute): string {
  return route.textColor ? `#${route.textColor}` : '#FFFFFF';
}

export function isWheelchairAccessible(stop: GTFSStop | GTFSTrip): boolean {
  return stop.wheelchairBoarding === '1' || stop.wheelchairAccessible === '1';
}
*/

// Placeholder export to prevent import errors
export {};

