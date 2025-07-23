import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Mail, Lock, User, Phone, FileText } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const { signIn, signUp, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleAuth = async () => {
    if (isLogin) {
      if (!email || !password) {
        Alert.alert('Missing Information', 'Please enter both email and password.');
        return;
      }

      const { data, error } = await signIn(email, password);
      if (error) {
        Alert.alert('Sign In Error', error);
      } else {
        onAuthSuccess();
      }
    } else {
      if (!email || !password || !name || !phone) {
        Alert.alert('Missing Information', 'Please fill in all required fields.');
        return;
      }

      if (!acceptedTerms) {
        Alert.alert('Terms Required', 'Please accept the terms and conditions to continue.');
        return;
      }

      const { data, error } = await signUp(email, password, name, phone);
      if (error) {
        Alert.alert('Sign Up Error', error);
      } else {
        Alert.alert(
          'Account Created',
          'Your account has been created successfully! Please check your email for verification.',
          [{ text: 'OK', onPress: onAuthSuccess }]
        );
      }
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Reset Password', 'Password reset link has been sent to your email.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Shield size={48} color="#8B5CF6" strokeWidth={2} />
            </View>
            <Text style={styles.appName}>SafeRide</Text>
            <Text style={styles.tagline}>
              {isLogin ? 'Welcome back!' : 'Join our safe community'}
            </Text>
            <Text style={styles.subtitle}>
              Exclusive ride-sharing platform for women, by women
            </Text>
          </View>

          {/* Auth Form */}
          <View style={styles.formContainer}>
            {!isLogin && (
              <>
                <View style={styles.inputContainer}>
                  <User size={20} color="#8B5CF6" strokeWidth={2} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name *"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Phone size={20} color="#8B5CF6" strokeWidth={2} />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number *"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </>
            )}

            <View style={styles.inputContainer}>
              <Mail size={20} color="#8B5CF6" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Email Address * (any email works for demo)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#8B5CF6" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Password * (any password works for demo)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {!isLogin && (
              <View style={styles.verificationNotice}>
                <FileText size={16} color="#F59E0B" strokeWidth={2} />
                <Text style={styles.verificationText}>
                  Identity verification required for account activation. We'll guide you through this process after registration.
                </Text>
              </View>
            )}

            {!isLogin && (
              <TouchableOpacity 
                style={styles.termsContainer}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                  {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  I agree to the Terms of Service and Privacy Policy
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
              <Text style={styles.authButtonText}>
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Text>
            </TouchableOpacity>

            {isLogin && (
              <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
                <Text style={styles.forgotButtonText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.switchButtonText}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Safety Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Why SafeRide?</Text>
            
            <View style={styles.featureItem}>
              <Shield size={20} color="#8B5CF6" strokeWidth={2} />
              <Text style={styles.featureText}>Women-only verified community</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Shield size={20} color="#14B8A6" strokeWidth={2} />
              <Text style={styles.featureText}>24/7 safety monitoring</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Shield size={20} color="#F59E0B" strokeWidth={2} />
              <Text style={styles.featureText}>Emergency SOS features</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
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
  verificationNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  verificationText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  authButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  forgotButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotButtonText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  switchText: {
    fontSize: 14,
    color: '#6B7280',
  },
  switchButtonText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  featuresContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
});