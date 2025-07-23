import { supabase } from '@/lib/supabase';

export interface CreateRideData {
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  destinationAddress: string;
  destinationLatitude: number;
  destinationLongitude: number;
  fare: number;
  distance: number;
  duration: number;
}

export interface NearbyDriver {
  driver_id: string;
  full_name: string;
  rating: number;
  latitude: number;
  longitude: number;
  distance_km: number;
  vehicle_info: string;
}

export const ridesService = {
  async createRide(passengerId: string, rideData: CreateRideData) {
    try {
      const { data, error } = await supabase
        .from('rides')
        .insert({
          passenger_id: passengerId,
          ...rideData,
          status: 'requested',
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getNearbyDrivers(latitude: number, longitude: number, radiusKm: number = 10) {
    try {
      const { data, error } = await supabase
        .rpc('nearby_drivers', {
          lat: latitude,
          lng: longitude,
          radius_km: radiusKm,
        });

      if (error) throw error;
      return { data: data as NearbyDriver[], error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getUserRides(userId: string) {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          driver:profiles!rides_driver_id_fkey(full_name, rating),
          passenger:profiles!rides_passenger_id_fkey(full_name, rating)
        `)
        .or(`passenger_id.eq.${userId},driver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async updateRideStatus(rideId: string, status: string, driverId?: string) {
    try {
      const updates: any = { status };
      
      if (status === 'accepted' && driverId) {
        updates.driver_id = driverId;
        updates.accepted_at = new Date().toISOString();
      } else if (status === 'in_progress') {
        updates.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updates.cancelled_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('rides')
        .update(updates)
        .eq('id', rideId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async rateRide(rideId: string, rating: number, review: string, isPassenger: boolean) {
    try {
      const updates = isPassenger 
        ? { passenger_rating: rating, passenger_review: review }
        : { driver_rating: rating, driver_review: review };

      const { data, error } = await supabase
        .from('rides')
        .update(updates)
        .eq('id', rideId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Real-time subscription for ride updates
  subscribeToRideUpdates(rideId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`ride-${rideId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rides',
          filter: `id=eq.${rideId}`,
        },
        callback
      )
      .subscribe();
  },
};