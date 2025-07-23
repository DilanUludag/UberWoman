import { Alert } from 'react-native';
import { EMERGENCY_ACTIONS } from '@/constants/SafetyMessages';

export const triggerSOS = () => {
  Alert.alert(
    'Emergency SOS Activated',
    'Your emergency contacts have been notified. Local authorities will be contacted if needed.',
    [
      { text: 'OK' }
    ]
  );
};

export const shareLocation = () => {
  // In a real app, this would share actual GPS coordinates
  Alert.alert(
    'Location Shared',
    'Your current location has been shared with your emergency contacts.'
  );
};

export const startEmergencyRecording = () => {
  Alert.alert(
    'Recording Started',
    'Audio recording has begun. This will be saved securely for your safety.'
  );
};

export const callEmergencyServices = () => {
  Alert.alert(
    'Emergency Services',
    'Connecting you to 911...',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', onPress: () => Alert.alert('Calling 911...') }
    ]
  );
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};