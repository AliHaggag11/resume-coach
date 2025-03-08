-- Create the saved_jobs table
CREATE TABLE saved_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    user_id UUID REFERENCES auth.users(id),
    company_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    location TEXT,
    remote_type TEXT,
    job_description TEXT,
    job_id TEXT NOT NULL,
    job_apply_link TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own saved jobs
CREATE POLICY "Users can manage their own saved jobs"
    ON saved_jobs
    FOR ALL
    USING (auth.uid() = user_id);

-- Create index on user_id for better performance
CREATE INDEX saved_jobs_user_id_idx ON saved_jobs(user_id);

-- Create index on job_id for faster lookups
CREATE INDEX saved_jobs_job_id_idx ON saved_jobs(job_id); 