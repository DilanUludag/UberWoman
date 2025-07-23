import React, { useState } from 'react';
import { View } from 'react-native';
import AuthScreen from '@/components/AuthScreen';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function IndexScreen() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: '#F9FAFB' }} />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <AuthScreen onAuthSuccess={() => {}} />
    </View>
  );
}