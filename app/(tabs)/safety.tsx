import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Phone, Users, MessageCircle, MapPin, TriangleAlert as AlertTriangle, Plus, CreditCard as Edit3 } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { safetyService } from '@/services/safety';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

const mockContacts: EmergencyContact[] = [
  {
    id: '1',
    name: 'Mom',
    phone: '+1 (555) 123-4567',
    relationship: 'Mother',
  },
  {
    id: '2',
    name: 'Best Friend',
    phone: '+1 (555) 987-6543',
    relationship: 'Friend',
  },
];

export default function SafetyScreen() {
  const { user, profile, updateProfile } = useAuth();
  const { location } = useLocation();
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(mockContacts);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });

  React.useEffect(() => {
    if (profile?.emergency_contacts) {
      setEmergencyContacts(profile.emergency_contacts);
    }
  }, [profile]);

  const handleSOSPress = async () => {
    if (!user || !location) {
      Alert.alert('Error', 'Unable to get your location. Please try again.');
      return;
    }

    Alert.alert(
      'Emergency SOS',
      'Are you in immediate danger? This will send your location to your emergency contacts and notify local authorities.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send SOS', 
          style: 'destructive',
          onPress: async () => {
            const { data, error } = await safetyService.triggerSOS(
              user.id,
              location.latitude,
              location.longitude
            );
            
            if (error) {
              Alert.alert('Error', 'Failed to send SOS. Please try again.');
            } else {
              Alert.alert('SOS Sent', 'Your emergency contacts have been notified and your location has been shared.');
            }
          }
        },
      ]
    );
  };

  const handleShareRide = async () => {
    if (!user || !location) {
      Alert.alert('Error', 'Unable to get your location. Please try again.');
      return;
    }

    Alert.alert(
      'Share Ride Details',
      'Your current ride details will be shared with your emergency contacts including driver info, route, and live location.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share', 
          onPress: async () => {
            const { data, error } = await safetyService.shareLocation(
              user.id,
              location.latitude,
              location.longitude
            );
            
            if (error) {
              Alert.alert('Error', 'Failed to share location. Please try again.');
            } else {
              Alert.alert('Shared', 'Ride details shared successfully!');
            }
          }
        },
      ]
    );
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      ...newContact,
    };

    const updatedContacts = [...emergencyContacts, contact];
    setEmergencyContacts(updatedContacts);
    setNewContact({ name: '', phone: '', relationship: '' });
    setIsAddingContact(false);

    // Update profile in database
    if (user) {
      const { error } = await updateProfile({ emergency_contacts: updatedContacts });
      if (error) {
        Alert.alert('Error', 'Failed to save contact. Please try again.');
        // Revert local state
        setEmergencyContacts(emergencyContacts);
      } else {
        Alert.alert('Success', 'Emergency contact added successfully!');
      }
    }
  };

  const handleCallSupport = async () => {
    const { success, error } = await safetyService.callEmergencyServices();
    if (!success && error) {
      Alert.alert('Error', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Safety Center</Text>
          <Text style={styles.subtitle}>Your safety is our top priority</Text>
        </View>

        {/* Emergency SOS */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sosContainer} onPress={handleSOSPress}>
            <View style={styles.sosIconContainer}>
              <AlertTriangle size={32} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View style={styles.sosContent}>
              <Text style={styles.sosTitle}>Emergency SOS</Text>
              <Text style={styles.sosSubtitle}>Press to alert emergency contacts</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Safety Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionCard} onPress={handleShareRide}>
            <MapPin size={24} color="#8B5CF6" strokeWidth={2} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Share Live Location</Text>
              <Text style={styles.actionSubtitle}>Share your current ride with trusted contacts</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <MessageCircle size={24} color="#14B8A6" strokeWidth={2} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Safety Messages</Text>
              <Text style={styles.actionSubtitle}>Quick messages for your driver</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleCallSupport}>
            <Phone size={24} color="#F59E0B" strokeWidth={2} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Call Support</Text>
              <Text style={styles.actionSubtitle}>24/7 SafeRide support hotline</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setIsAddingContact(true)}
            >
              <Plus size={20} color="#8B5CF6" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {emergencyContacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <Users size={20} color="#6B7280" strokeWidth={2} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
                <Text style={styles.contactRelationship}>{contact.relationship}</Text>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Edit3 size={16} color="#8B5CF6" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ))}

          {isAddingContact && (
            <View style={styles.addContactForm}>
              <Text style={styles.formTitle}>Add Emergency Contact</Text>
              
              <TextInput
                style={styles.formInput}
                placeholder="Contact Name *"
                value={newContact.name}
                onChangeText={(text) => setNewContact({...newContact, name: text})}
                placeholderTextColor="#9CA3AF"
              />
              
              <TextInput
                style={styles.formInput}
                placeholder="Phone Number *"
                value={newContact.phone}
                onChangeText={(text) => setNewContact({...newContact, phone: text})}
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
              />
              
              <TextInput
                style={styles.formInput}
                placeholder="Relationship (Optional)"
                value={newContact.relationship}
                onChangeText={(text) => setNewContact({...newContact, relationship: text})}
                placeholderTextColor="#9CA3AF"
              />

              <View style={styles.formButtons}>
                <TouchableOpacity 
                  style={[styles.formButton, styles.cancelButton]}
                  onPress={() => {
                    setIsAddingContact(false);
                    setNewContact({ name: '', phone: '', relationship: '' });
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.formButton, styles.saveButton]}
                  onPress={handleAddContact}
                >
                  <Text style={styles.saveButtonText}>Add Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          
          <View style={styles.tipCard}>
            <Shield size={20} color="#8B5CF6" strokeWidth={2} />
            <Text style={styles.tipText}>
              Always check driver photo and license plate before entering the vehicle
            </Text>
          </View>
          
          <View style={styles.tipCard}>
            <Shield size={20} color="#8B5CF6" strokeWidth={2} />
            <Text style={styles.tipText}>
              Share your ride details with friends or family members
            </Text>
          </View>
          
          <View style={styles.tipCard}>
            <Shield size={20} color="#8B5CF6" strokeWidth={2} />
            <Text style={styles.tipText}>
              Trust your instincts - if something feels wrong, use the SOS button
            </Text>
          </View>
          
          <View style={styles.tipCard}>
            <Shield size={20} color="#8B5CF6" strokeWidth={2} />
            <Text style={styles.tipText}>
              Keep your phone charged and location services enabled
            </Text>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sosContainer: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sosIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sosContent: {
    flex: 1,
  },
  sosTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sosSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 16,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  editButton: {
    padding: 8,
  },
  addContactForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginLeft: 12,
  },
});