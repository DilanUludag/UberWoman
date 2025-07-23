import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, Clock, MapPin } from 'lucide-react-native';

interface RideCardProps {
  driver: {
    id: string;
    name: string;
    rating: number;
    vehicle: string;
    eta: string;
    price: string;
    distance: string;
  };
  onSelect: () => void;
}

export default function RideCard({ driver, onSelect }: RideCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Text key={index} style={{ color: index < rating ? '#F59E0B' : '#E5E7EB' }}>
        ★
      </Text>
    ));
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onSelect}>
      <View style={styles.header}>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{driver.name}</Text>
          <View style={styles.ratingContainer}>
            {renderStars(Math.floor(driver.rating))}
            <Text style={styles.ratingText}>{driver.rating}</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{driver.price}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.vehicle}>{driver.vehicle}</Text>
        <Text style={styles.distance}>{driver.distance}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.etaContainer}>
          <Clock size={16} color="#6B7280" strokeWidth={2} />
          <Text style={styles.eta}>{driver.eta} away</Text>
        </View>
        <TouchableOpacity style={styles.selectButton} onPress={onSelect}>
          <Text style={styles.selectButtonText}>Select</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  details: {
    marginBottom: 12,
  },
  vehicle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eta: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});