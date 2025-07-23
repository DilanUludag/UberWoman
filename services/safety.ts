import { supabase } from '@/lib/supabase';
import { Alert, Linking } from 'react-native';

export interface SafetyEventData {
  userId: string;
  rideId?: string;
  eventType: 'sos' | 'panic' | 'route_deviation' | 'emergency_contact' | 'location_share';
  latitude: number;
  longitude: number;
  description?: string;
}

export const safetyService = {
  async createSafetyEvent(eventData: SafetyEventData) {
    try {
      const { data, error } = await supabase
        .from('safety_events')
        .insert({
          user_id: eventData.userId,
          ride_id: eventData.rideId,
          event_type: eventData.eventType,
          latitude: eventData.latitude,
          longitude: eventData.longitude,
          description: eventData.description,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async triggerSOS(userId: string, latitude: number, longitude: number, rideId?: string) {
    try {
      // Create safety event
      const { data: safetyEvent, error: eventError } = await this.createSafetyEvent({
        userId,
        rideId,
        eventType: 'sos',
        latitude,
        longitude,
        description: 'Emergency SOS triggered',
      });

      if (eventError) throw eventError;

      // Get user profile with emergency contacts
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('emergency_contacts, full_name, phone')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // In a real app, this would send SMS/notifications to emergency contacts
      // For now, we'll simulate the process
      const emergencyContacts = profile.emergency_contacts as any[];
      
      if (emergencyContacts && emergencyContacts.length > 0) {
        // Simulate sending alerts to emergency contacts
        console.log('Sending SOS alerts to emergency contacts:', emergencyContacts);
        
        // In production, integrate with SMS service like Twilio
        // await this.sendEmergencyAlerts(emergencyContacts, profile, latitude, longitude);
      }

      return { data: safetyEvent, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async shareLocation(userId: string, latitude: number, longitude: number, rideId?: string) {
    try {
      const { data, error } = await this.createSafetyEvent({
        userId,
        rideId,
        eventType: 'location_share',
        latitude,
        longitude,
        description: 'Location shared with emergency contacts',
      });

      if (error) throw error;

      // Get emergency contacts and send location
      const { data: profile } = await supabase
        .from('profiles')
        .select('emergency_contacts, full_name')
        .eq('id', userId)
        .single();

      if (profile?.emergency_contacts) {
        // In production, send location via SMS/push notifications
        console.log('Sharing location with emergency contacts');
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async callEmergencyServices() {
    try {
      const emergencyNumber = '911';
      const url = `tel:${emergencyNumber}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return { success: true, error: null };
      } else {
        throw new Error('Cannot make phone calls on this device');
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getUserSafetyEvents(userId: string) {
    try {
      const { data, error } = await supabase
        .from('safety_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async resolveSafetyEvent(eventId: string) {
    try {
      const { data, error } = await supabase
        .from('safety_events')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Simulate emergency alert sending (in production, use SMS service)
  async sendEmergencyAlerts(contacts: any[], userProfile: any, latitude: number, longitude: number) {
    const message = `EMERGENCY ALERT: ${userProfile.full_name} has triggered an SOS. Location: https://maps.google.com/?q=${latitude},${longitude}`;
    
    // In production, integrate with Twilio or similar SMS service
    console.log('Emergency alert message:', message);
    console.log('Sending to contacts:', contacts);
    
    return Promise.resolve();
  },
};