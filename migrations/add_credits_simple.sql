-- Simple function to add credits with the parameter order expected by the application
CREATE OR REPLACE FUNCTION public.add_credits_alt(
  p_amount INTEGER,
  p_user_id UUID
) 
RETURNS BOOLEAN AS $$
DECLARE
  v_current_credits INTEGER;
  v_balance_after INTEGER;
  v_exists BOOLEAN;
BEGIN
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
    'PURCHASE',
    p_amount,
    'Credit purchase',
    COALESCE(v_current_credits, 0),
    v_balance_after
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in add_credits_alt: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 