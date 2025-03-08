import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendNewsletter } from '@/lib/email';
import { sendNewsletterToAllSubscribers } from '@/lib/newsletter';
import { z } from 'zod';

// Define validation schema
const sendNewsletterSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  html: z.string().min(1, 'Email content is required'),
  testEmail: z.string().email().optional().nullable(),
  sendToAll: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    // Verify admin permissions
    const authResponse = await supabase.auth.getUser();
    if (authResponse.error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: userData } = authResponse;
    const userRole = userData.user?.user_metadata?.role || 'user';
    
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { subject, html, testEmail, sendToAll } = sendNewsletterSchema.parse(body);

    // If it's a test email, just send to the test email
    if (testEmail) {
      const success = await sendNewsletter({
        subject,
        html,
        testEmail
      });

      if (success) {
        return NextResponse.json(
          { message: `Test email sent to ${testEmail}` },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: 'Failed to send test email' },
          { status: 500 }
        );
      }
    }

    // If not sending to all, return an error
    if (!sendToAll) {
      return NextResponse.json(
        { error: 'Please specify a test email or set sendToAll to true' },
        { status: 400 }
      );
    }

    // Send to all subscribers using our batch function
    // Note: In a production app, this would typically be a background job
    // For this example, we'll run it directly in the API route
    const result = await sendNewsletterToAllSubscribers({
      subject,
      html
    });

    if (result.success) {
      return NextResponse.json(
        { 
          message: `Newsletter sent to ${result.sent} of ${result.total} subscribers`,
          sent: result.sent,
          total: result.total
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to send newsletter to all subscribers',
          sent: result.sent,
          total: result.total
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in sending newsletter:', error);
    
    // Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 