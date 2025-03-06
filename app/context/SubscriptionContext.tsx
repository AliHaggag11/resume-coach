"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// Credit costs for various features
export const CREDIT_COSTS = {
  JOBS: {
    AI_ANALYSIS: 3,
    AI_SPECIALIZED_RESUME: 8,
    AI_PREPARATION_GUIDE: 3,
    PRACTICE_WITH_AI: 12
  },
  RESUME: {
    GENERATE_SUMMARY: 2,
    GENERATE_DESCRIPTION: 2,
    GENERATE_ACHIEVEMENTS: 2,
    SUGGEST_SKILLS: 2,
    GENERATE_PROJECT_DESCRIPTION: 2,
    GENERATE_PROJECT_TECH_STACK: 2,
    GENERATE_PROJECT_ACHIEVEMENTS: 2,
    GENERATE_AWARD_DESCRIPTION: 2,
    ATS_ANALYZE_RESUME: 3,
    DOWNLOAD_RESUME: 1
  },
  COVER_LETTER: {
    GENERATE_LETTER: 4
  }
};

// Credit purchase packages
export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  tag?: string;
  discount?: number;
  mostPopular?: boolean;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'basic',
    name: 'Basic',
    credits: 50,
    price: 4.99,
  },
  {
    id: 'standard',
    name: 'Standard',
    credits: 125,
    price: 9.99,
    tag: 'Most Popular',
    mostPopular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    credits: 300,
    price: 19.99,
    discount: 20,
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    credits: 700,
    price: 39.99,
    discount: 30,
  }
];

// Type for credit transaction records
export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  transaction_type: 'purchase' | 'usage' | 'refund' | 'bonus';
  description: string;
  feature: string;
  created_at: string;
}

type CreditsContextType = {
  credits: number;
  isLoading: boolean;
  creditHistory: CreditTransaction[];
  purchaseCredits: (amount: number) => Promise<{ success: boolean; error?: string }>;
  useCredits: (amount: number, feature: string, description: string) => Promise<boolean>;
  refreshCredits: () => Promise<void>;
};

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [credits, setCredits] = useState(0);
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCredits = async () => {
    if (!user) {
      setCredits(0);
      setCreditHistory([]);
      setIsLoading(false);
      return;
    }

    try {
      // Get user's current credit balance
      const { data: userData, error: userError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      if (userError) {
        // If no record exists, create one with default credits
        if (userError.code === 'PGRST116') {
          const { data: newUser, error: createError } = await supabase
            .from('user_credits')
            .insert([
              { user_id: user.id, credits: 50 } // Start with 50 free credits
            ])
            .select()
            .single();

          if (createError) {
            console.error('Error creating user credits:', createError);
            setCredits(0);
          } else {
            setCredits(newUser.credits);
          }
        } else {
          console.error('Error fetching user credits:', userError);
          setCredits(0);
        }
      } else {
        setCredits(userData.credits);
      }

      // Get credit transaction history
      const { data: history, error: historyError } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (historyError) {
        console.error('Error fetching credit history:', historyError);
        setCreditHistory([]);
      } else {
        setCreditHistory(history || []);
      }
    } catch (error) {
      console.error('Error in credits fetch:', error);
      setCredits(0);
      setCreditHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch credits when user changes
  useEffect(() => {
    fetchCredits();
  }, [user]);

  // Function to refresh credits (called after transactions)
  const refreshCredits = async () => {
    await fetchCredits();
  };

  // Function to use credits for a feature
  const useCredits = async (amount: number, feature: string, description: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to use this feature');
      return false;
    }

    if (credits < amount) {
      toast.error(`Not enough credits. This action requires ${amount} credits, but you only have ${credits}.`);
      return false;
    }

    try {
      // Start a transaction
      const { data, error } = await supabase.rpc('use_credits', {
        p_user_id: user.id,
        p_amount: amount,
        p_feature: feature,
        p_description: description
      });

      if (error) {
        console.error('Error using credits:', error);
        toast.error('Failed to process credits: ' + error.message);
        return false;
      }

      // Update local state
      await refreshCredits();
      toast.success(`Used ${amount} credits for ${description}`);
      return true;
    } catch (error) {
      console.error('Error in credit transaction:', error);
      toast.error('An unexpected error occurred');
      return false;
    }
  };

  // Function to purchase more credits
  const purchaseCredits = async (amount: number): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'You must be logged in to purchase credits' };
    }

    try {
      // This would typically integrate with a payment processor
      // For now, simulate adding credits directly
      const { data, error } = await supabase.rpc('add_credits', {
        p_user_id: user.id,
        p_amount: amount
      });

      if (error) {
        console.error('Error purchasing credits:', error);
        return { success: false, error: error.message };
      }

      // Update local state
      await refreshCredits();
      toast.success(`Added ${amount} credits to your account`);
      return { success: true };
    } catch (error: any) {
      console.error('Error in credit purchase:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  const value = {
    credits,
    isLoading,
    creditHistory,
    purchaseCredits,
    useCredits,
    refreshCredits,
  };

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
} 