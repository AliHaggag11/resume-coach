-- Create table for mock interview sessions (if not exists already)
CREATE TABLE IF NOT EXISTS mock_interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interview_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  interview_type TEXT NOT NULL,
  session_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, interview_id)
);

-- Add RLS policies for mock_interview_sessions (drop first if they exist)
ALTER TABLE mock_interview_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS select_own_sessions ON mock_interview_sessions;
DROP POLICY IF EXISTS insert_own_sessions ON mock_interview_sessions;
DROP POLICY IF EXISTS update_own_sessions ON mock_interview_sessions;
DROP POLICY IF EXISTS delete_own_sessions ON mock_interview_sessions;

-- Create policies
CREATE POLICY select_own_sessions ON mock_interview_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY insert_own_sessions ON mock_interview_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_own_sessions ON mock_interview_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY delete_own_sessions ON mock_interview_sessions
  FOR DELETE USING (auth.uid() = user_id);
  
-- Create table for error logging (if not exists already)
CREATE TABLE IF NOT EXISTS ai_error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL,
  context JSONB NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for ai_error_logs (drop first if they exist)
ALTER TABLE ai_error_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS admin_select_all_logs ON ai_error_logs;
DROP POLICY IF EXISTS select_own_logs ON ai_error_logs;
DROP POLICY IF EXISTS insert_own_logs ON ai_error_logs;

-- Create policies
CREATE POLICY admin_select_all_logs ON ai_error_logs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

CREATE POLICY select_own_logs ON ai_error_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY insert_own_logs ON ai_error_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create or replace the add_credits function (for refunds)
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