-- Fix for the function with swapped parameter order
-- First, we'll create a function with a temporary name to avoid naming conflicts
CREATE OR REPLACE FUNCTION public.add_credits_fixed(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type VARCHAR(20) DEFAULT 'PURCHASE',
  p_description TEXT DEFAULT 'Credit purchase'
) 
RETURNS BOOLEAN AS $$
DECLARE
  v_current_credits INTEGER;
  v_balance_after INTEGER;
  v_exists BOOLEAN;
BEGIN
  -- Validate transaction type
  IF p_transaction_type NOT IN ('PURCHASE', 'BONUS', 'REFUND') THEN
    RAISE EXCEPTION 'Invalid transaction type: %', p_transaction_type;
  END IF;
  
  -- Check if user has a credits record
  SELECT EXISTS(SELECT 1 FROM public.user_credits WHERE user_id = p_user_id) INTO v_exists;
  
  IF NOT v_exists THEN
    -- Create new record with initial credits
    INSERT INTO public.user_credits (
      user_id,
      credits,
      updated_at
    ) VALUES (
      p_user_id,
      p_amount,
      now()
    );
    v_balance_after := p_amount;
  ELSE
    -- Get current credits
    SELECT credits INTO v_current_credits
    FROM public.user_credits
    WHERE user_id = p_user_id;
    
    -- Update existing record
    v_balance_after := v_current_credits + p_amount;
    
    UPDATE public.user_credits
    SET
      credits = v_balance_after,
      updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Record the transaction
  INSERT INTO public.credit_transactions (
    user_id,
    transaction_type,
    amount,
    description,
    credits_before,
    credits_after
  ) VALUES (
    p_user_id,
    p_transaction_type,
    p_amount,
    p_description,
    COALESCE(v_current_credits, 0),
    v_balance_after
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in add_credits_fixed: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create a wrapper function with the parameter order the application is expecting
CREATE OR REPLACE FUNCTION public.add_credits_alt(
  p_amount INTEGER,
  p_user_id UUID,
  p_transaction_type VARCHAR(20) DEFAULT 'PURCHASE',
  p_description TEXT DEFAULT 'Credit purchase'
) 
RETURNS BOOLEAN AS $$
BEGIN
  -- Call our fixed function but with the parameters in the correct order
  RETURN public.add_credits_fixed(p_user_id, p_amount, p_transaction_type, p_description);
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in add_credits_alt: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 