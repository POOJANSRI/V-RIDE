export type Role = 'ADMIN' | 'FACULTY' | 'DRIVER' | 'PARENT';

export interface User {
  id: string;
  name: string;
  role: Role;
  mobile?: string;
  password?: string;
}

export interface RideRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  role: Role;
  pickupLocation: string;
  requesterLocation?: {
    lat: number;
    lng: number;
  };
  driverId?: string;
  status: 'PENDING' | 'ON_THE_WAY' | 'PLEASE_WAIT' | 'NOT_POSSIBLE' | 'COMPLETED';
  timestamp: any;
}

export interface DriverState {
  driverId: string;
  isAvailable: boolean;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface AppState {
  users: User[];
  requests: RideRequest[];
  drivers: Record<string, DriverState>;
}