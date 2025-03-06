-- Create a simplified direct credit adding function (emergency backup)
CREATE OR REPLACE FUNCTION add_credits_direct(
  user_id UUID, 
  amount INTEGER, 
  description TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits FROM user_credits WHERE user_id = user_id;
  
  -- Update credits
  UPDATE user_credits 
  SET credits = credits + amount
  WHERE user_id = user_id;
  
  -- Insert transaction record (without trying to check previous amount)
  INSERT INTO credit_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description
  ) VALUES (
    user_id, 
    amount, 
    'EMERGENCY_REFUND', 
    description
  );
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 