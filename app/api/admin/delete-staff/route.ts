import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Create a Supabase client with service role key
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          async getAll() {
            return (await cookies()).getAll();
          },
          async setAll(cookiesToSet) {
            const cookieStore = await cookies();
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Get the user ID from the request body
    const { userId } = await request.json();

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

    // Delete the user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      throw deleteError;
    }

    // The support_user_profile will be automatically deleted due to RLS cascade

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting staff user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete staff user' },
      { status: 500 }
    );
  }
}