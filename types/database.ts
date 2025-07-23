export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string;
          avatar_url?: string;
          is_verified: boolean;
          is_driver: boolean;
          rating: number;
          total_rides: number;
          member_since: string;
          emergency_contacts: EmergencyContact[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone: string;
          avatar_url?: string;
          is_verified?: boolean;
          is_driver?: boolean;
          rating?: number;
          total_rides?: number;
          member_since?: string;
          emergency_contacts?: EmergencyContact[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string;
          avatar_url?: string;
          is_verified?: boolean;
          is_driver?: boolean;
          rating?: number;
          total_rides?: number;
          member_since?: string;
          emergency_contacts?: EmergencyContact[];
          created_at?: string;
          updated_at?: string;
        };
      };
      rides: {
        Row: {
          id: string;
          passenger_id: string;
          driver_id?: string;
          pickup_address: string;
          pickup_latitude: number;
          pickup_longitude: number;
          destination_address: string;
          destination_latitude: number;
          destination_longitude: number;
          status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
          fare: number;
          distance: number;
          duration: number;
          requested_at: string;
          accepted_at?: string;
          started_at?: string;
          completed_at?: string;
          cancelled_at?: string;
          passenger_rating?: number;
          driver_rating?: number;
          passenger_review?: string;
          driver_review?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          passenger_id: string;
          driver_id?: string;
          pickup_address: string;
          pickup_latitude: number;
          pickup_longitude: number;
          destination_address: string;
          destination_latitude: number;
          destination_longitude: number;
          status?: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
          fare: number;
          distance: number;
          duration: number;
          requested_at?: string;
          accepted_at?: string;
          started_at?: string;
          completed_at?: string;
          cancelled_at?: string;
          passenger_rating?: number;
          driver_rating?: number;
          passenger_review?: string;
          driver_review?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          passenger_id?: string;
          driver_id?: string;
          pickup_address?: string;
          pickup_latitude?: number;
          pickup_longitude?: number;
          destination_address?: string;
          destination_latitude?: number;
          destination_longitude?: number;
          status?: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
          fare?: number;
          distance?: number;
          duration?: number;
          requested_at?: string;
          accepted_at?: string;
          started_at?: string;
          completed_at?: string;
          cancelled_at?: string;
          passenger_rating?: number;
          driver_rating?: number;
          passenger_review?: string;
          driver_review?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      driver_locations: {
        Row: {
          id: string;
          driver_id: string;
          latitude: number;
          longitude: number;
          heading: number;
          is_available: boolean;
          last_updated: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          latitude: number;
          longitude: number;
          heading?: number;
          is_available?: boolean;
          last_updated?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          driver_id?: string;
          latitude?: number;
          longitude?: number;
          heading?: number;
          is_available?: boolean;
          last_updated?: string;
          created_at?: string;
        };
      };
      safety_events: {
        Row: {
          id: string;
          user_id: string;
          ride_id?: string;
          event_type: 'sos' | 'panic' | 'route_deviation' | 'emergency_contact' | 'location_share';
          latitude: number;
          longitude: number;
          description?: string;
          is_resolved: boolean;
          resolved_at?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ride_id?: string;
          event_type: 'sos' | 'panic' | 'route_deviation' | 'emergency_contact' | 'location_share';
          latitude: number;
          longitude: number;
          description?: string;
          is_resolved?: boolean;
          resolved_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ride_id?: string;
          event_type?: 'sos' | 'panic' | 'route_deviation' | 'emergency_contact' | 'location_share';
          latitude?: number;
          longitude?: number;
          description?: string;
          is_resolved?: boolean;
          resolved_at?: string;
          created_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          driver_id: string;
          make: string;
          model: string;
          year: number;
          color: string;
          license_plate: string;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          make: string;
          model: string;
          year: number;
          color: string;
          license_plate: string;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          driver_id?: string;
          make?: string;
          model?: string;
          year?: number;
          color?: string;
          license_plate?: string;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      nearby_drivers: {
        Args: {
          lat: number;
          lng: number;
          radius_km: number;
        };
        Returns: {
          driver_id: string;
          full_name: string;
          rating: number;
          latitude: number;
          longitude: number;
          distance_km: number;
          vehicle_info: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}