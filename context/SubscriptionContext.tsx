"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export type SubscriptionTier = 'free' | 'premium' | 'professional';

type SubscriptionContextType = {
  tier: SubscriptionTier;
  isLoading: boolean;
  features: {
    maxResumes: number;
    maxCoverLetters: number;
    aiImprovements: boolean;
    customTemplates: boolean;
    jobMatching: boolean;
    downloadFormats: string[];
  };
  checkoutSession: (priceId: string) => Promise<{ sessionId: string | null; error: any }>;
};

const tierFeatures = {
  free: {
    maxResumes: 1,
    maxCoverLetters: 2,
    aiImprovements: false,
    customTemplates: false,
    jobMatching: false,
    downloadFormats: ['PDF'],
  },
  premium: {
    maxResumes: 5,
    maxCoverLetters: 10,
    aiImprovements: true,
    customTemplates: true,
    jobMatching: false,
    downloadFormats: ['PDF', 'DOCX'],
  },
  professional: {
    maxResumes: 10,
    maxCoverLetters: 25,
    aiImprovements: true,
    customTemplates: true,
    jobMatching: true,
    downloadFormats: ['PDF', 'DOCX', 'TXT', 'JSON'],
  },
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setTier('free');
        setIsLoading(false);
        return;
      }

      try {
        // First, check if the subscriptions table exists
        const { error: tableError } = await supabase
          .from('subscriptions')
          .select('count')
          .limit(1)
          .single();

        // If table doesn't exist or there's an error, default to free tier
        if (tableError) {
          console.log('Subscriptions table not set up yet, defaulting to free tier');
          setTier('free');
          setIsLoading(false);
          return;
        }

        // If table exists, try to fetch the subscription
        const { data, error } = await supabase
          .from('subscriptions')
          .select('tier, status')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.log('No subscription found for user, defaulting to free tier');
          setTier('free');
        } else if (data && data.status === 'active') {
          setTier(data.tier as SubscriptionTier);
        } else {
          setTier('free');
        }
      } catch (error) {
        console.log('Error checking subscription, defaulting to free tier:', error);
        setTier('free');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const checkoutSession = async (priceId: string) => {
    if (!user) {
      return { sessionId: null, error: 'User not authenticated' };
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { sessionId: null, error: `API error: ${errorText}` };
      }

      const { sessionId, error } = await response.json();
      return { sessionId, error };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return { 
        sessionId: null, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  };

  const value = {
    tier,
    isLoading,
    features: tierFeatures[tier],
    checkoutSession,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
} 