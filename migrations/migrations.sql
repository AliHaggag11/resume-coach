-- Create resume_ats_analysis table to store ATS analysis results
CREATE TABLE IF NOT EXISTS resume_ats_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  job_specific BOOLEAN NOT NULL DEFAULT false
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS resume_ats_analysis_resume_id_idx ON resume_ats_analysis(resume_id);

-- Add RLS policies
ALTER TABLE resume_ats_analysis ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own analyses
CREATE POLICY resume_ats_analysis_select_policy ON resume_ats_analysis
  FOR SELECT USING (
    resume_id IN (SELECT id FROM resumes WHERE user_id = auth.uid())
  );

-- Policy to allow users to insert their own analyses
CREATE POLICY resume_ats_analysis_insert_policy ON resume_ats_analysis
  FOR INSERT WITH CHECK (
    resume_id IN (SELECT id FROM resumes WHERE user_id = auth.uid())
  );

-- Policy to allow users to update their own analyses
CREATE POLICY resume_ats_analysis_update_policy ON resume_ats_analysis
  FOR UPDATE USING (
    resume_id IN (SELECT id FROM resumes WHERE user_id = auth.uid())
  );

-- Policy to allow users to delete their own analyses
CREATE POLICY resume_ats_analysis_delete_policy ON resume_ats_analysis
  FOR DELETE USING (
    resume_id IN (SELECT id FROM resumes WHERE user_id = auth.uid())
  );

-- Function to compute expiry date (7 days after creation)
CREATE OR REPLACE FUNCTION get_ats_analysis_expiry(analysis_date TIMESTAMP WITH TIME ZONE)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
  RETURN analysis_date + INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql; 