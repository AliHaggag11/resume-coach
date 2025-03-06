-- Drop the existing function first
DROP FUNCTION IF EXISTS add_credits(uuid, integer, text);

-- Now create the function with the correct return type
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT
) RETURNS JSON AS $$
DECLARE
  current_credits INTEGER;
  new_credits INTEGER;
  result JSON;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits FROM user_credits WHERE user_id = p_user_id;

  -- If no record found, create one
  IF NOT FOUND THEN
    INSERT INTO user_credits (user_id, credits) VALUES (p_user_id, p_amount);
    new_credits := p_amount;
  ELSE
    -- Update existing record
    UPDATE user_credits SET credits = credits + p_amount WHERE user_id = p_user_id;
    new_credits := current_credits + p_amount;
  END IF;

  -- Insert transaction record
  INSERT INTO credit_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description,
    credits_before,
    credits_after
  ) VALUES (
    p_user_id, 
    p_amount, 
    'REFUND', 
    p_description,
    current_credits,
    new_credits
  );

  -- Return JSON result
  result := json_build_object(
    'success', true,
    'previous_credits', current_credits,
    'added_credits', p_amount,
    'new_balance', new_credits
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 