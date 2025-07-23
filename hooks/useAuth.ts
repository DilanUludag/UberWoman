import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { authService } from '@/services/auth';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  is_verified: boolean;
  is_driver: boolean;
  rating: number;
  total_rides: number;
  member_since: string;
  emergency_contacts: any[];
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await authService.getUserProfile(userId);
      if (error) {
        console.error('Error loading profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await authService.signIn({ email, password });
    setLoading(false);
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    setLoading(true);
    const { data, error } = await authService.signUp({ email, password, fullName, phone });
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await authService.signOut();
    setLoading(false);
    return { error };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'No user logged in' };
    
    const { data, error } = await authService.updateProfile(user.id, updates);
    if (!error && data) {
      setProfile(data);
    }
    return { data, error };
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };
}