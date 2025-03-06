-- Create table for mock interview sessions
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

-- Add RLS policies for mock_interview_sessions
ALTER TABLE mock_interview_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for selecting own sessions
CREATE POLICY select_own_sessions ON mock_interview_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for inserting own sessions
CREATE POLICY insert_own_sessions ON mock_interview_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating own sessions
CREATE POLICY update_own_sessions ON mock_interview_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for deleting own sessions
CREATE POLICY delete_own_sessions ON mock_interview_sessions
  FOR DELETE USING (auth.uid() = user_id); 