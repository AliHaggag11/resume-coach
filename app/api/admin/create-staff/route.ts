import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    
    // Create a Supabase client with service role key
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', options);
          },
        },
      }
    );

    // Get the request body
    const { email, password, fullName, role } = await request.json();

    // Verify the current user is an admin
    const {
      data: { session },
    } = await supabaseAdmin.auth.getSession();

    if (session?.user?.user_metadata?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Create the new user
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
      },
    });

    if (userError) {
      throw userError;
    }

    // Create support user profile
    const { error: profileError } = await supabaseAdmin
      .from('support_user_profiles')
      .insert({
        user_id: userData.user.id,
        full_name: fullName,
      });

    if (profileError) {
      // If profile creation fails, delete the user to maintain consistency
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      throw profileError;
    }

    return NextResponse.json({ success: true, user: userData.user });
  } catch (error: any) {
    console.error('Error creating staff user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create staff user' },
      { status: 500 }
    );
  }
} 