export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  rating: number;
  totalRides: number;
  memberSince: string;
  emergencyContacts: EmergencyContact[];
}

export interface Driver extends User {
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  isAvailable: boolean;
  eta: string;
  distance: string;
}

export interface Ride {
  id: string;
  passengerId: string;
  driverId: string;
  pickupLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    address: string;
    latitude: number;
    longitude: number;
  };
  fare: number;
  status: 'requested' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  requestedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  rating?: number;
  review?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface SafetyEvent {
  id: string;
  userId: string;
  type: 'sos' | 'panic' | 'route_deviation' | 'emergency_contact';
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
  };
  resolved: boolean;
}

export interface Message {
  id: string;
  rideId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'predefined_safety' | 'location';
}