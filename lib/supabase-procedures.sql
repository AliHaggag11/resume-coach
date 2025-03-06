-- Create tables for user credits system
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create table for credit transactions
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('PURCHASE', 'USAGE', 'REFUND', 'BONUS')),
  description TEXT NOT NULL,
  feature VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row level security for credits tables
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for user_credits
CREATE POLICY "Users can view their own credits"
  ON public.user_credits FOR SELECT
  USING (auth.uid() = user_id);

-- Policies for credit_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Function to use credits
CREATE OR REPLACE FUNCTION public.use_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_feature VARCHAR(50),
  p_description TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_credits INTEGER;
  v_balance_after INTEGER;
BEGIN
  -- Start transaction
  BEGIN
    -- Get current credits
    SELECT credits INTO v_current_credits
    FROM public.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;
    
    -- Check if user has enough credits
    IF v_current_credits IS NULL THEN
      RAISE EXCEPTION 'User does not have a credit account';
    END IF;
    
    IF v_current_credits < p_amount THEN
      RAISE EXCEPTION 'Insufficient credits. Required: %, Available: %', p_amount, v_current_credits;
    END IF;
    
    -- Update user credits
    v_balance_after := v_current_credits - p_amount;
    
    UPDATE public.user_credits
    SET 
      credits = v_balance_after,
      total_spent = total_spent + p_amount,
      updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Insert transaction record
    INSERT INTO public.credit_transactions (
      user_id,
      amount,
      balance_after,
      transaction_type,
      description,
      feature
    ) VALUES (
      p_user_id,
      -p_amount, -- negative for usage
      v_balance_after,
      'USAGE',
      p_description,
      p_feature
    );
    
    RETURN TRUE;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits (purchase or bonus)
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type VARCHAR(20) DEFAULT 'PURCHASE',
  p_description TEXT DEFAULT 'Credit purchase'
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_credits INTEGER;
  v_balance_after INTEGER;
  v_exists BOOLEAN;
BEGIN
  -- Validate transaction type
  IF p_transaction_type NOT IN ('PURCHASE', 'BONUS', 'REFUND') THEN
    RAISE EXCEPTION 'Invalid transaction type: %', p_transaction_type;
  END IF;
  
  -- Start transaction
  BEGIN
    -- Check if user has a credits record
    SELECT EXISTS(SELECT 1 FROM public.user_credits WHERE user_id = p_user_id) INTO v_exists;
    
    IF v_exists THEN
      -- Update existing record
      SELECT credits INTO v_current_credits
      FROM public.user_credits
      WHERE user_id = p_user_id
      FOR UPDATE;
      
      v_balance_after := v_current_credits + p_amount;
      
      UPDATE public.user_credits
      SET 
        credits = v_balance_after,
        total_earned = total_earned + p_amount,
        updated_at = NOW()
      WHERE user_id = p_user_id;
    ELSE
      -- Create new record
      INSERT INTO public.user_credits (
        user_id,
        credits,
        total_earned
      ) VALUES (
        p_user_id,
        p_amount,
        p_amount
      )
      RETURNING credits INTO v_balance_after;
    END IF;
    
    -- Insert transaction record
    INSERT INTO public.credit_transactions (
      user_id,
      amount,
      balance_after,
      transaction_type,
      description
    ) VALUES (
      p_user_id,
      p_amount,
      v_balance_after,
      p_transaction_type,
      p_description
    );
    
    RETURN TRUE;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 