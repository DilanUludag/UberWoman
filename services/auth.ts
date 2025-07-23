import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  async signUp({ email, password, fullName, phone }: SignUpData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      });

      if (error) throw error;

      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            full_name: fullName,
            phone,
            is_verified: false,
            is_driver: false,
          });

        if (profileError) throw profileError;
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async updateProfile(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};