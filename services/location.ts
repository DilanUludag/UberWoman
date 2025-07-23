import { supabase } from '@/lib/supabase';

export interface LocationData {
  latitude: number;
  longitude: number;
  heading?: number;
}

export const locationService = {
  async updateDriverLocation(driverId: string, location: LocationData, isAvailable: boolean = true) {
    try {
      // First, try to update existing location
      const { data: existing } = await supabase
        .from('driver_locations')
        .select('id')
        .eq('driver_id', driverId)
        .single();

      if (existing) {
        // Update existing location
        const { data, error } = await supabase
          .from('driver_locations')
          .update({
            latitude: location.latitude,
            longitude: location.longitude,
            heading: location.heading || 0,
            is_available: isAvailable,
            last_updated: new Date().toISOString(),
          })
          .eq('driver_id', driverId)
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      } else {
        // Insert new location
        const { data, error } = await supabase
          .from('driver_locations')
          .insert({
            driver_id: driverId,
            latitude: location.latitude,
            longitude: location.longitude,
            heading: location.heading || 0,
            is_available: isAvailable,
          })
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      }
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getDriverLocation(driverId: string) {
    try {
      const { data, error } = await supabase
        .from('driver_locations')
        .select('*')
        .eq('driver_id', driverId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async setDriverAvailability(driverId: string, isAvailable: boolean) {
    try {
      const { data, error } = await supabase
        .from('driver_locations')
        .update({
          is_available: isAvailable,
          last_updated: new Date().toISOString(),
        })
        .eq('driver_id', driverId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  },

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  },

  // Calculate estimated fare based on distance and time
  calculateFare(distanceKm: number, durationMinutes: number): number {
    const baseFare = 3.50;
    const perKmRate = 1.25;
    const perMinuteRate = 0.35;
    const safetyFee = 1.00; // Additional safety fee for SafeRide
    
    const fare = baseFare + (distanceKm * perKmRate) + (durationMinutes * perMinuteRate) + safetyFee;
    return Math.round(fare * 100) / 100; // Round to 2 decimal places
  },

  // Estimate travel time (simplified)
  estimateTravelTime(distanceKm: number): number {
    const averageSpeedKmh = 30; // Average city driving speed
    const timeHours = distanceKm / averageSpeedKmh;
    return Math.ceil(timeHours * 60); // Convert to minutes and round up
  },
};