"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithGithub: () => Promise<{ error: any }>;
  signUpWithGoogle: () => Promise<{ error: any }>;
  signUpWithGithub: () => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseError, setSupabaseError] = useState<Error | null>(null);

  useEffect(() => {
    // Get session from Supabase
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setSupabaseError(error);
        }
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Failed to get session:', err);
        setSupabaseError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    try {
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.error('Failed to set up auth state change listener:', err);
      setSupabaseError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return () => {}; // Return empty cleanup function
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: name ? {
          data: { full_name: name }
        } : undefined
      });
      return { data, error };
    } catch (err) {
      console.error('Sign up error:', err);
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      return { error };
    } catch (err) {
      console.error('Google sign in error:', err);
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const signInWithGithub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      return { error };
    } catch (err) {
      console.error('GitHub sign in error:', err);
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  // Alias the social sign-in methods for sign-up
  const signUpWithGoogle = signInWithGoogle;
  const signUpWithGithub = signInWithGithub;

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // If there's a Supabase error, we still render the children but with a null user
  // This allows the app to function in a "not authenticated" state
  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithGithub,
    signUpWithGoogle,
    signUpWithGithub,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 