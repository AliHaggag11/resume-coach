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