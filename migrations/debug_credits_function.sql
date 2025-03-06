-- Debug version of the add_credits function with extensive logging
CREATE OR REPLACE FUNCTION public.add_credits_debug(
  p_amount INTEGER,
  p_user_id UUID
) 
RETURNS JSONB AS $$
DECLARE
  v_current_credits INTEGER;
  v_balance_after INTEGER;
  v_exists BOOLEAN;
  v_result JSONB;
  v_transaction_id UUID;
BEGIN
  -- Create a result object to track execution
  v_result := jsonb_build_object(
    'success', false,
    'step', 'start',
    'message', 'Operation started',
    'timestamp', now()
  );

  -- Check if user ID is valid
  IF p_user_id IS NULL THEN
    v_result := jsonb_set(v_result, '{message}', '"User ID cannot be null"');
    v_result := jsonb_set(v_result, '{step}', '"validation_failed"');
    RETURN v_result;
  END IF;
  
  -- Log the request
  RAISE LOG 'ADD_CREDITS_DEBUG: Processing request for user % to add % credits', p_user_id, p_amount;
  v_result := jsonb_set(v_result, '{step}', '"checking_user"');
  
  -- Check if user has a credits record
  BEGIN
    SELECT EXISTS(SELECT 1 FROM public.user_credits WHERE user_id = p_user_id) INTO v_exists;
    v_result := jsonb_set(v_result, '{user_exists}', to_jsonb(v_exists));
  EXCEPTION WHEN OTHERS THEN
    v_result := jsonb_set(v_result, '{error}', to_jsonb(SQLERRM));
    v_result := jsonb_set(v_result, '{step}', '"user_check_failed"');
    RETURN v_result;
  END;
  
  -- Start a transaction block explicitly
  BEGIN
    v_result := jsonb_set(v_result, '{step}', '"updating_credits"');
    
    IF NOT v_exists THEN
      -- Create new record with initial credits
      RAISE LOG 'ADD_CREDITS_DEBUG: Creating new credits record for user % with % credits', p_user_id, p_amount;
      
      BEGIN
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
        v_result := jsonb_set(v_result, '{action}', '"insert"');
      EXCEPTION WHEN OTHERS THEN
        v_result := jsonb_set(v_result, '{error}', to_jsonb(SQLERRM));
        v_result := jsonb_set(v_result, '{step}', '"insert_failed"');
        RETURN v_result;
      END;
    ELSE
      -- Get current credits
      BEGIN
        SELECT credits INTO v_current_credits
        FROM public.user_credits
        WHERE user_id = p_user_id;
        
        v_result := jsonb_set(v_result, '{current_credits}', to_jsonb(v_current_credits));
        RAISE LOG 'ADD_CREDITS_DEBUG: Current credits for user % is %', p_user_id, v_current_credits;
      EXCEPTION WHEN OTHERS THEN
        v_result := jsonb_set(v_result, '{error}', to_jsonb(SQLERRM));
        v_result := jsonb_set(v_result, '{step}', '"select_failed"');
        RETURN v_result;
      END;
      
      -- Update existing record
      BEGIN
        v_balance_after := v_current_credits + p_amount;
        
        RAISE LOG 'ADD_CREDITS_DEBUG: Updating credits for user % from % to %', p_user_id, v_current_credits, v_balance_after;
        
        UPDATE public.user_credits
        SET
          credits = v_balance_after,
          updated_at = now()
        WHERE user_id = p_user_id;
        
        v_result := jsonb_set(v_result, '{action}', '"update"');
        v_result := jsonb_set(v_result, '{new_balance}', to_jsonb(v_balance_after));
      EXCEPTION WHEN OTHERS THEN
        v_result := jsonb_set(v_result, '{error}', to_jsonb(SQLERRM));
        v_result := jsonb_set(v_result, '{step}', '"update_failed"');
        RETURN v_result;
      END;
    END IF;
    
    -- Record the transaction
    BEGIN
      v_result := jsonb_set(v_result, '{step}', '"recording_transaction"');
      
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
        'Credit purchase (debug)',
        COALESCE(v_current_credits, 0),
        v_balance_after
      ) RETURNING id INTO v_transaction_id;
      
      v_result := jsonb_set(v_result, '{transaction_id}', to_jsonb(v_transaction_id));
    EXCEPTION WHEN OTHERS THEN
      v_result := jsonb_set(v_result, '{warning}', to_jsonb('Transaction log failed: ' || SQLERRM));
      -- Continue execution even if transaction logging fails
    END;
    
    -- Mark as successful
    v_result := jsonb_set(v_result, '{success}', 'true');
    v_result := jsonb_set(v_result, '{step}', '"completed"');
    v_result := jsonb_set(v_result, '{message}', '"Credits added successfully"');
    
    RAISE LOG 'ADD_CREDITS_DEBUG: Successfully added % credits for user %', p_amount, p_user_id;
    
    RETURN v_result;
  EXCEPTION WHEN OTHERS THEN
    -- Catch any other errors in the transaction block
    v_result := jsonb_set(v_result, '{error}', to_jsonb(SQLERRM));
    v_result := jsonb_set(v_result, '{step}', '"transaction_failed"');
    RAISE LOG 'ADD_CREDITS_DEBUG: Error adding credits: %', SQLERRM;
    RETURN v_result;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a policy to allow service role to access user_credits
DROP POLICY IF EXISTS "Service can manage all credits" ON user_credits;
CREATE POLICY "Service can manage all credits" 
ON user_credits 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Create a policy to allow service role to access credit_transactions
DROP POLICY IF EXISTS "Service can manage all transactions" ON credit_transactions;
CREATE POLICY "Service can manage all transactions" 
ON credit_transactions 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true); 