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
    const { userId, newRole } = await request.json();

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

    // Update the user's role
    const { error: updateError } = await supabaseAdmin
      .auth.admin.updateUserById(userId, {
        user_metadata: { role: newRole }
      });

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating staff role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update staff role' },
      { status: 500 }
    );
  }
} 