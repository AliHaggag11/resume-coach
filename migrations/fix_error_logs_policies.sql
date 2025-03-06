-- Drop existing policies if they exist
DROP POLICY IF EXISTS admin_select_all_logs ON ai_error_logs;
DROP POLICY IF EXISTS select_own_logs ON ai_error_logs;
DROP POLICY IF EXISTS insert_own_logs ON ai_error_logs;

-- Create user-specific policies (without admin policy)
CREATE POLICY select_own_logs ON ai_error_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY insert_own_logs ON ai_error_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id); 