/**
 * GTFS TypeScript Types
 * 
 * Import: import { GTFSAgency, GTFSStop, etc } from '@/types/gtfs.types';
 */

/**
 * GTFS Agency
 * Represents a transit agency that operates routes
 */
export interface GTFSAgency {
  id: string;
  name: string;
  url: string;
  timezone: string;
  lang?: string;
  phone?: string | null;
  fareUrl?: string | null;
  email?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * GTFS Stop
 * Represents a bus stop or station
 */
export interface GTFSStop {
  id: string;
  code?: string | null;
  name: string;
  desc?: string | null;
  lat: number;
  lng: number;
  zoneId?: string | null;
  url?: string | null;
  locationType?: string;
  parentStation?: string | null;
  timezone?: string | null;
  wheelchairBoarding?: string;
  platformCode?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Location type enum
 */
export enum StopLocationType {
  STOP = '0',
  STATION = '1',
  ENTRANCE_EXIT = '2',
  GENERIC_NODE = '3',
  BOARDING_AREA = '4'
}

/**
 * Wheelchair boarding enum
 */
export enum WheelchairBoarding {
  NO_INFO = '0',
  ACCESSIBLE = '1',
  NOT_ACCESSIBLE = '2'
}

/**
 * GTFS Route
 * Represents a transit route
 */
export interface GTFSRoute {
  id: string;
  agencyId?: string | null;
  shortName: string;
  longName: string;
  desc?: string | null;
  type: string;
  url?: string | null;
  color?: string | null;
  textColor?: string | null;
  sortOrder?: number | null;
  continuousPickup?: string;
  continuousDropOff?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Route type enum (GTFS standard)
 */
export enum RouteType {
  TRAM = '0',
  SUBWAY = '1',
  RAIL = '2',
  BUS = '3',
  FERRY = '4',
  CABLE_TRAM = '5',
  AERIAL_LIFT = '6',
  FUNICULAR = '7',
  TROLLEYBUS = '11',
  MONORAIL = '12'
}

/**
 * GTFS Trip
 * Represents a specific journey along a route
 */
export interface GTFSTrip {
  id: string;
  routeId: string;
  serviceId: string;
  headsign?: string | null;
  shortName?: string | null;
  directionId?: string;
  blockId?: string | null;
  shapeId?: string | null;
  wheelchairAccessible?: string;
  bikesAllowed?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Direction ID enum
 */
export enum DirectionId {
  OUTBOUND = '0',
  INBOUND = '1'
}

/**
 * GTFS StopTime
 * Represents arrival/departure times at a stop
 */
export interface GTFSStopTime {
  id: string;
  tripId: string;
  arrivalTime: string; // HH:MM:SS format
  departureTime: string; // HH:MM:SS format
  stopId: string;
  stopSequence: number;
  stopHeadsign?: string | null;
  pickupType?: string;
  dropOffType?: string;
  shapeDistTraveled?: number | null;
  timepoint?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pickup type enum
 */
export enum PickupType {
  REGULAR = '0',
  NONE = '1',
  PHONE_AGENCY = '2',
  COORDINATE_WITH_DRIVER = '3'
}

/**
 * Drop-off type enum
 */
export enum DropOffType {
  REGULAR = '0',
  NONE = '1',
  PHONE_AGENCY = '2',
  COORDINATE_WITH_DRIVER = '3'
}

/**
 * Timepoint enum
 */
export enum Timepoint {
  APPROXIMATE = '0',
  EXACT = '1'
}

// ============================================
// API Response Types
// ============================================

/**
 * Paginated list response
 */
export interface GTFSListResponse<T> {
  data: T[];
  count: number;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

/**
 * Stop search query
 */
export interface StopSearchQuery {
  locationType?: StopLocationType;
  parentStation?: string;
  limit?: number;
}

/**
 * Nearby stops query
 */
export interface NearbyStopsQuery {
  lat: number;
  lng: number;
  radius?: number; // in kilometers
}

/**
 * Route search query
 */
export interface RouteSearchQuery {
  type?: RouteType;
  agencyId?: string;
  limit?: number;
}

/**
 * Trip search query
 */
export interface TripSearchQuery {
  routeId?: string;
  serviceId?: string;
  directionId?: DirectionId;
  limit?: number;
}

/**
 * Bulk stop times creation payload
 */
export interface BulkStopTimesPayload {
  stopTimes: Omit<GTFSStopTime, 'id' | 'tripId' | 'createdAt' | 'updatedAt'>[];
}

// ============================================
// Extended Types (with related data)
// ============================================

/**
 * Stop with related stop times
 */
export interface GTFSStopWithTimes extends GTFSStop {
  stopTimes?: GTFSStopTime[];
}

/**
 * Trip with stop times and route info
 */
export interface GTFSTripWithDetails extends GTFSTrip {
  route?: GTFSRoute;
  stopTimes?: GTFSStopTime[];
}

/**
 * Route with trips
 */
export interface GTFSRouteWithTrips extends GTFSRoute {
  trips?: GTFSTrip[];
}

