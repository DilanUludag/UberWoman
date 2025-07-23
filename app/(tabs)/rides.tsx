import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, MapPin, Star, Clock, Filter } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { ridesService } from '@/services/rides';
import { useEffect } from 'react';


export default function RidesScreen() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'completed' | 'upcoming'>('all');
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRides();
    }
  }, [user]);

  const loadRides = async () => {
    if (!user) return;

    try {
      const { data, error } = await ridesService.getUserRides(user.id);
      if (!error && data) {
        const formattedRides = data.map(ride => ({
          ...ride,
          date: formatDate(ride.created_at),
          time: formatTime(ride.created_at),
          from: ride.pickup_address,
          to: ride.destination_address,
          driver: ride.driver?.full_name || 'Driver',
          fare: `$${ride.fare.toFixed(2)}`,
          rating: ride.passenger_rating || 0,
        }));
        setRides(formattedRides);
      }
    } catch (error) {
      console.error('Error loading rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const filteredRides = rides.filter(ride => {
    if (filter === 'all') return true;
    return ride.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'upcoming':
        return '#8B5CF6';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Text key={index} style={{ color: index < rating ? '#F59E0B' : '#E5E7EB' }}>
        ★
      </Text>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ride History</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#8B5CF6" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterTabText, filter === 'all' && styles.activeFilterTabText]}>
            All Rides
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'completed' && styles.activeFilterTab]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterTabText, filter === 'completed' && styles.activeFilterTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'upcoming' && styles.activeFilterTab]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[styles.filterTabText, filter === 'upcoming' && styles.activeFilterTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your rides...</Text>
          </View>
        ) : filteredRides.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No rides found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' 
                ? 'You haven\'t taken any rides yet.' 
                : `No ${filter} rides found.`}
            </Text>
          </View>
        ) : (
          filteredRides.map((ride) => (
          <View key={ride.id} style={styles.rideCard}>
            <View style={styles.rideHeader}>
              <View style={styles.dateTimeContainer}>
                <Calendar size={16} color="#6B7280" strokeWidth={2} />
                <Text style={styles.dateText}>{ride.date}</Text>
                <Clock size={16} color="#6B7280" strokeWidth={2} />
                <Text style={styles.timeText}>{ride.time}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(ride.status)}20` }]}>
                <Text style={[styles.statusText, { color: getStatusColor(ride.status) }]}>
                  {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.routeContainer}>
              <View style={styles.routeItem}>
                <View style={[styles.routeDot, { backgroundColor: '#8B5CF6' }]} />
                <Text style={styles.locationText}>{ride.from}</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routeItem}>
                <View style={[styles.routeDot, { backgroundColor: '#14B8A6' }]} />
                <Text style={styles.locationText}>{ride.to}</Text>
              </View>
            </View>

            <View style={styles.rideFooter}>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>Driver: {ride.driver}</Text>
                {ride.status === 'completed' && (
                  <View style={styles.ratingContainer}>
                    {renderStars(ride.rating)}
                  </View>
                )}
              </View>
              <Text style={styles.fareText}>{ride.fare}</Text>
            </View>

            {ride.status === 'completed' && (
              <TouchableOpacity style={styles.rebookButton}>
                <Text style={styles.rebookButtonText}>Book Again</Text>
              </TouchableOpacity>
            )}
          </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  rideCard: {
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
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  routeContainer: {
    marginBottom: 16,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 3,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  fareText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  rebookButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  rebookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});