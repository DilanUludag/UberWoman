import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Phone, MapPin, Star, Shield, Bell, CreditCard, CircleHelp as HelpCircle, Settings, LogOut } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';


export default function ProfileScreen() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [editedProfile, setEditedProfile] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  React.useEffect(() => {
    if (profile) {
      setEditedProfile({
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!editedProfile.full_name || !editedProfile.email || !editedProfile.phone) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const { error } = await updateProfile(editedProfile);
    if (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } else {
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditedProfile({
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
      });
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        },
      ]
    );
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Settings size={20} color="#8B5CF6" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <User size={40} color="#8B5CF6" strokeWidth={2} />
          </View>
          
          <View style={styles.profileInfo}>
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={editedProfile.full_name}
                onChangeText={(text) => setEditedProfile({...editedProfile, full_name: text})}
              />
            ) : (
              <Text style={styles.userName}>{profile.full_name}</Text>
            )}
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Star size={16} color="#F59E0B" strokeWidth={2} />
                <Text style={styles.statText}>{profile.rating} Rating</Text>
              </View>
              <View style={styles.statItem}>
                <MapPin size={16} color="#14B8A6" strokeWidth={2} />
                <Text style={styles.statText}>{profile.total_rides} Rides</Text>
              </View>
            </View>
            
            <Text style={styles.memberSince}>Member since {profile.member_since}</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.infoCard}>
            <Mail size={20} color="#6B7280" strokeWidth={2} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              {isEditing ? (
                <TextInput
                  style={styles.infoInput}
                  value={editedProfile.email}
                  onChangeText={(text) => setEditedProfile({...editedProfile, email: text})}
                />
              ) : (
                <Text style={styles.infoValue}>{profile.email}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoCard}>
            <Phone size={20} color="#6B7280" strokeWidth={2} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              {isEditing ? (
                <TextInput
                  style={styles.infoInput}
                  value={editedProfile.phone}
                  onChangeText={(text) => setEditedProfile({...editedProfile, phone: text})}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoValue}>{profile.phone}</Text>
              )}
            </View>
          </View>

          {isEditing && (
            <View style={styles.editButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Privacy & Safety */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Safety</Text>
          
          <View style={styles.settingCard}>
            <Shield size={20} color="#8B5CF6" strokeWidth={2} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Location Sharing</Text>
              <Text style={styles.settingSubtitle}>Share location with emergency contacts during rides</Text>
            </View>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
              thumbColor={locationSharing ? '#8B5CF6' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingCard}>
            <Bell size={20} color="#14B8A6" strokeWidth={2} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingSubtitle}>Receive ride updates and safety alerts</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
              thumbColor={notifications ? '#14B8A6' : '#9CA3AF'}
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.actionCard}>
            <CreditCard size={20} color="#F59E0B" strokeWidth={2} />
            <Text style={styles.actionText}>Payment Methods</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <HelpCircle size={20} color="#6B7280" strokeWidth={2} />
            <Text style={styles.actionText}>Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" strokeWidth={2} />
            <Text style={[styles.actionText, { color: '#EF4444' }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Verification Badge */}
        {profile.is_verified && (
          <View style={styles.verificationSection}>
          <View style={styles.verificationBadge}>
            <Shield size={24} color="#10B981" strokeWidth={2} />
            <View style={styles.verificationContent}>
              <Text style={styles.verificationTitle}>Verified Female User</Text>
              <Text style={styles.verificationSubtitle}>
                Your identity has been verified through our secure process
              </Text>
            </View>
          </View>
        </View>
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
  scrollView: {
    flex: 1,
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
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  memberSince: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
  },
  infoInput: {
    fontSize: 16,
    color: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 4,
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 12,
    flex: 1,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    flex: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 16,
  },
  verificationSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  verificationBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verificationContent: {
    flex: 1,
    marginLeft: 16,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  verificationSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});