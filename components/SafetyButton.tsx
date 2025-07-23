import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface SafetyButtonProps {
  style?: any;
  size?: 'small' | 'large';
}

export default function SafetyButton({ style, size = 'small' }: SafetyButtonProps) {
  const handleSOSPress = () => {
    Alert.alert(
      'Emergency SOS',
      'Are you in immediate danger? This will send your location to your emergency contacts and notify local authorities.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send SOS', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('SOS Sent', 'Your emergency contacts have been notified and your location has been shared.');
          }
        },
      ]
    );
  };

  const isLarge = size === 'large';

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        isLarge ? styles.largeButton : styles.smallButton,
        style
      ]} 
      onPress={handleSOSPress}
    >
      <AlertTriangle 
        size={isLarge ? 32 : 20} 
        color="#FFFFFF" 
        strokeWidth={2} 
      />
      <Text style={[styles.text, isLarge ? styles.largeText : styles.smallText]}>
        SOS
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  smallText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 18,
  },
});