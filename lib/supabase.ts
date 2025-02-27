import { createBrowserClient } from '@supabase/ssr'

// Use default values for development if environment variables are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Check if we're using placeholder values and log a warning
if (supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')) {
  console.warn(
    'Using placeholder Supabase credentials. Please update your .env.local file with actual Supabase credentials.'
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export const getServiceSupabase = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-supabase-url.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  );
}; 