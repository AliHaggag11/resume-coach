-- Create resumes table
create table public.resumes (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    content jsonb not null default '{}'::jsonb,
    status text not null default 'draft' check (status in ('draft', 'completed')),
    shared boolean not null default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    last_modified timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.resumes enable row level security;

-- Create policies
create policy "Users can view their own resumes"
    on public.resumes for select
    using (auth.uid() = user_id);

create policy "Users can create their own resumes"
    on public.resumes for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own resumes"
    on public.resumes for update
    using (auth.uid() = user_id);

create policy "Users can delete their own resumes"
    on public.resumes for delete
    using (auth.uid() = user_id);

-- Create function to automatically update last_modified
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.last_modified = timezone('utc'::text, now());
    return new;
end;
$$;

-- Create trigger for last_modified
create trigger set_updated_at
    before update
    on public.resumes
    for each row
    execute function public.handle_updated_at();

-- Create contact_messages table
create table public.contact_messages (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    email text not null,
    subject text not null,
    message text not null,
    user_id uuid references auth.users(id),
    status text not null default 'unread' check (status in ('unread', 'read', 'replied')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
alter table public.contact_messages enable row level security;

-- Create trigger for updated_at on contact_messages
create trigger set_contact_messages_updated_at
    before update
    on public.contact_messages
    for each row
    execute function public.handle_updated_at();

-- Create policies
create policy "Anyone can create contact messages"
    on public.contact_messages for insert
    with check (true);

create policy "Authenticated users can view their own messages"
    on public.contact_messages for select
    using (auth.uid() = user_id);

-- Create policy for support users to view all messages
create policy "Support users can view all messages"
    on public.contact_messages for select
    using (
        auth.uid() in (
            select id from auth.users 
            where raw_user_meta_data->>'role' = 'support'
        )
        or auth.uid() = user_id
    );

-- Drop existing admin policy before replacing it
drop policy if exists "Only admins can update messages" on public.contact_messages;

-- Create new policy for both admin and support users
create policy "Support users can update messages"
    on public.contact_messages for update
    using (
        auth.uid() in (
            select id from auth.users 
            where raw_user_meta_data->>'role' in ('admin', 'support')
        )
    );

-- Create replies table for message responses
create table public.message_replies (
    id uuid default gen_random_uuid() primary key,
    message_id uuid references public.contact_messages(id) on delete cascade not null,
    support_user_id uuid references auth.users(id) on delete set null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.message_replies enable row level security;

-- Create policies for replies
create policy "Support users can create replies"
    on public.message_replies for insert
    with check (
        auth.uid() in (
            select id from auth.users 
            where raw_user_meta_data->>'role' in ('admin', 'support')
        )
    );

create policy "Support users can view replies"
    on public.message_replies for select
    using (
        auth.uid() in (
            select id from auth.users 
            where raw_user_meta_data->>'role' in ('admin', 'support')
        )
        or auth.uid() in (
            select user_id from public.contact_messages
            where id = message_replies.message_id
        )
    );

-- Create support_user_profiles table
CREATE TABLE public.support_user_profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.support_user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for support_user_profiles
CREATE POLICY "Allow admins full access to support profiles"
ON public.support_user_profiles
FOR ALL
TO authenticated
USING (auth.jwt()->>'role' = 'admin')
WITH CHECK (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Allow users to view their own profile"
ON public.support_user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'role' = 'authenticated' AND 
    auth.jwt() ->> 'email' IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is support or admin
CREATE OR REPLACE FUNCTION public.is_support_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(
      current_setting('request.jwt.claims', true)::json->>'role' IN ('support', 'admin'),
      false
    );
$$;

-- Create your first admin user (replace with your email)
-- Run this in SQL editor:
/*
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'your.email@example.com',
  crypt('your_secure_password', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Then create the support profile
INSERT INTO public.support_user_profiles (user_id, full_name)
SELECT id, 'Admin User'
FROM auth.users
WHERE email = 'your.email@example.com';
*/

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.support_user_profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Update auth.users policies to allow admin access
CREATE POLICY "Allow admins to view user data"
ON auth.users
FOR SELECT
TO authenticated
USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

-- Update existing policies for contact_messages and message_replies
ALTER POLICY "Support users can view all messages" ON public.contact_messages
USING (is_support_or_admin());

ALTER POLICY "Support users can reply to messages" ON public.message_replies
USING (is_support_or_admin())
WITH CHECK (is_support_or_admin());

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_staff_users();

-- Create new function with exact return type
CREATE OR REPLACE FUNCTION public.get_staff_users()
RETURNS TABLE (
  id text,
  email text,
  role text,
  full_name text,
  created_at text
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    u.id::text,
    u.email,
    (CASE 
      WHEN u.raw_user_meta_data->>'role' = 'admin' THEN 'admin'
      WHEN u.raw_user_meta_data->>'role' = 'support' THEN 'support'
      ELSE 'support'
    END)::text as role,
    COALESCE(sp.full_name, u.raw_user_meta_data->>'full_name', 'Unknown')::text as full_name,
    u.created_at::text
  FROM auth.users u
  LEFT JOIN public.support_user_profiles sp ON sp.user_id = u.id
  WHERE u.raw_user_meta_data->>'role' IN ('support', 'admin')
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_staff_users() TO authenticated;

-- Function to update a user's role
CREATE OR REPLACE FUNCTION public.update_user_role(user_id uuid, new_role text)
RETURNS void AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF new_role NOT IN ('support', 'admin') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object('role', new_role)
      ELSE
        raw_user_meta_data || jsonb_build_object('role', new_role)
    END
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_role TO authenticated;

-- Create index for better query performance
CREATE INDEX idx_contact_messages_assigned_to ON public.contact_messages(assigned_to);

-- Update policies for contact_messages to include assignment access
DROP POLICY IF EXISTS "Support users can view all messages" ON public.contact_messages;
CREATE POLICY "Support users can view assigned or unassigned messages"
    ON public.contact_messages FOR SELECT
    USING (
        (auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE raw_user_meta_data->>'role' = 'admin'
        ))
        OR
        (auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE raw_user_meta_data->>'role' = 'support'
            AND (
                contact_messages.assigned_to IS NULL 
                OR contact_messages.assigned_to = auth.uid()
            )
        ))
        OR auth.uid() = user_id
    );

-- Create policy for updating assignments (admin only)
CREATE POLICY "Only admins can assign tickets"
    ON public.contact_messages
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE raw_user_meta_data->>'role' = 'admin'
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Function to assign ticket to staff
CREATE OR REPLACE FUNCTION public.assign_ticket(
    ticket_id uuid,
    staff_id uuid
)
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only administrators can assign tickets';
    END IF;

    IF staff_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = staff_id 
        AND raw_user_meta_data->>'role' IN ('support', 'admin')
    ) THEN
        RAISE EXCEPTION 'Invalid staff member';
    END IF;

    UPDATE public.contact_messages
    SET assigned_to = staff_id
    WHERE id = ticket_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the new function
GRANT EXECUTE ON FUNCTION public.assign_ticket TO authenticated;

-- Function to get tickets for staff member
CREATE OR REPLACE FUNCTION public.get_staff_tickets(
    staff_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    subject text,
    message text,
    status text,
    created_at timestamptz,
    updated_at timestamptz,
    user_id uuid,
    assigned_to uuid,
    user_email text,
    assigned_to_name text
) AS $$
BEGIN
    -- Check if user is authorized
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'role' IN ('support', 'admin')
    ) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- For admin, show all tickets if staff_id is null
    -- For support, only show their assigned tickets
    RETURN QUERY
    SELECT 
        cm.id,
        cm.subject,
        cm.message,
        cm.status,
        cm.created_at,
        cm.updated_at,
        cm.user_id,
        cm.assigned_to,
        u.email as user_email,
        sp.full_name as assigned_to_name
    FROM public.contact_messages cm
    LEFT JOIN auth.users u ON u.id = cm.user_id
    LEFT JOIN public.support_user_profiles sp ON sp.user_id = cm.assigned_to
    WHERE 
        CASE 
            WHEN (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin' THEN
                staff_id IS NULL OR cm.assigned_to = staff_id
            ELSE
                cm.assigned_to = auth.uid()
        END
    ORDER BY cm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the new function
GRANT EXECUTE ON FUNCTION public.get_staff_tickets TO authenticated; 