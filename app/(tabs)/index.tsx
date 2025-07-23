import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MapPin, Search, Car, Clock, DollarSign } from 'lucide-react-native';
import { Shield } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { ridesService, NearbyDriver } from '@/services/rides';
import { locationService } from '@/services/location';


export default function HomeScreen() {
  const { user, profile } = useAuth();
  const { location } = useLocation();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [showDrivers, setShowDrivers] = useState(false);
  const [drivers, setDrivers] = useState<NearbyDriver[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearchRide = async () => {
    if (!pickup || !destination) {
      Alert.alert('Missing Information', 'Please enter both pickup and destination locations.');
      return;
    }

    if (!location) {
      Alert.alert('Location Error', 'Unable to get your current location. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await ridesService.getNearbyDrivers(
        location.latitude,
        location.longitude,
        10 // 10km radius
      );

      if (error) {
        Alert.alert('Error', 'Unable to find nearby drivers. Please try again.');
        return;
      }

      if (!data || data.length === 0) {
        Alert.alert('No Drivers', 'No drivers available in your area right now. Please try again later.');
        return;
      }

      // Calculate fare and ETA for each driver
      const driversWithDetails = data.map(driver => {
        const distanceKm = driver.distance_km;
        const estimatedTime = locationService.estimateTravelTime(distanceKm);
        const fare = locationService.calculateFare(distanceKm * 2, estimatedTime); // Round trip estimate
        
        return {
          ...driver,
          eta: `${Math.ceil(estimatedTime / 2)} min`, // ETA to pickup
          price: `$${fare.toFixed(2)}`,
          distance: `${distanceKm.toFixed(1)} km away`,
        };
      });

      setDrivers(driversWithDetails);
      setShowDrivers(true);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDriver = async (driver: any) => {
    if (!user || !location) return;

    Alert.alert(
      'Confirm Ride',
      `Book ride with ${driver.full_name}?\n\nVehicle: ${driver.vehicle_info}\nETA: ${driver.eta}\nFare: ${driver.price}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book Ride', onPress: () => handleBookRide(driver) },
      ]
    );
  };

  const handleBookRide = async (driver: any) => {
    if (!user || !location) return;

    try {
      // In a real app, you'd geocode the addresses to get coordinates
      // For now, we'll use mock coordinates
      const mockDestinationCoords = {
        latitude: location.latitude + 0.01,
        longitude: location.longitude + 0.01,
      };

      const rideData = {
        pickupAddress: pickup,
        pickupLatitude: location.latitude,
        pickupLongitude: location.longitude,
        destinationAddress: destination,
        destinationLatitude: mockDestinationCoords.latitude,
        destinationLongitude: mockDestinationCoords.longitude,
        fare: parseFloat(driver.price.replace('$', '')),
        distance: driver.distance_km,
        duration: locationService.estimateTravelTime(driver.distance_km),
      };

      const { data, error } = await ridesService.createRide(user.id, rideData);
      
      if (error) {
        Alert.alert('Booking Error', 'Unable to book ride. Please try again.');
        return;
      }

      // Update ride with selected driver
      await ridesService.updateRideStatus(data.id, 'accepted', driver.driver_id);

      Alert.alert(
        'Ride Booked!', 
        `${driver.full_name} is on the way. You'll receive a notification when she arrives.`
      );
      
      setShowDrivers(false);
      setPickup('');
      setDestination('');
      setDrivers([]);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while booking your ride.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!</Text>
          <Text style={styles.subText}>Book your safe ride with trusted women drivers</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.sosButton}>
            <Shield size={24} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Clock size={20} color="#8B5CF6" strokeWidth={2} />
            <Text style={styles.actionText}>Schedule</Text>
          </TouchableOpacity>
        </View>

        {/* Location Inputs */}
        <View style={styles.locationSection}>
          <View style={styles.inputContainer}>
            <MapPin size={20} color="#8B5CF6" strokeWidth={2} />
            <TextInput
              style={styles.input}
              placeholder="Pickup location"
              value={pickup}
              onChangeText={setPickup}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputContainer}>
            <MapPin size={20} color="#14B8A6" strokeWidth={2} />
            <TextInput
              style={styles.input}
              placeholder="Where to?"
              value={destination}
              onChangeText={setDestination}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity style={styles.searchButton} onPress={handleSearchRide}>
            <Search size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.searchButtonText}>
              {loading ? 'Searching...' : 'Find Drivers'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Available Drivers */}
        {showDrivers && (
          <View style={styles.driversSection}>
            <Text style={styles.sectionTitle}>Available Drivers</Text>
            {drivers.map((driver) => (
              <TouchableOpacity
                key={driver.driver_id}
                style={styles.driverCard}
                onPress={() => handleSelectDriver(driver)}
              >
                <View style={styles.driverInfo}>
                  <View style={styles.driverHeader}>
                    <Text style={styles.driverName}>{driver.full_name}</Text>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.rating}>★ {driver.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.vehicleInfo}>{driver.vehicle_info}</Text>
                  <Text style={styles.distanceInfo}>{driver.distance}</Text>
                </View>
                <View style={styles.rideDetails}>
                  <View style={styles.detailRow}>
                    <Clock size={16} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.detailText}>{driver.eta}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <DollarSign size={16} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.detailText}>{driver.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Safety Tips */}
        <View style={styles.safetySection}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          <View style={styles.safetyTip}>
            <Shield size={16} color="#8B5CF6" strokeWidth={2} />
            <Text style={styles.tipText}>Always verify driver details before getting in</Text>
          </View>
          <View style={styles.safetyTip}>
            <Shield size={16} color="#8B5CF6" strokeWidth={2} />
            <Text style={styles.tipText}>Share your ride details with trusted contacts</Text>
          </View>
          <View style={styles.safetyTip}>
            <Shield size={16} color="#8B5CF6" strokeWidth={2} />
            <Text style={styles.tipText}>Use the SOS button if you feel unsafe</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  sosButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
  locationSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  searchButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  driversSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  driverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  driverInfo: {
    marginBottom: 12,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  ratingContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  vehicleInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  distanceInfo: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  rideDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  safetySection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  safetyTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});