-- Create newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  status TEXT DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
  source TEXT DEFAULT 'footer'
);

-- Add RLS policies
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow inserts from client for subscribing
CREATE POLICY newsletter_insert_policy ON newsletter_subscribers
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- Only allow viewing of full list to admins
CREATE POLICY newsletter_select_policy ON newsletter_subscribers
    FOR SELECT
    TO authenticated
    USING (auth.uid() IN (
        SELECT id FROM auth.users 
        WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- Create unsubscribe function
CREATE OR REPLACE FUNCTION unsubscribe_from_newsletter(email_address TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  UPDATE newsletter_subscribers
  SET status = 'unsubscribed'
  WHERE email = email_address
  RETURNING TRUE INTO result;
  
  RETURN COALESCE(result, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 