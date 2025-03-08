import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET(request: Request) {
  // This is just a test endpoint and should be removed or secured in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is not available in production' },
      { status: 404 }
    );
  }

  const { searchParams } = new URL(request.url);
  const testEmail = searchParams.get('email');

  if (!testEmail) {
    return NextResponse.json(
      { error: 'Please provide an email parameter' },
      { status: 400 }
    );
  }

  try {
    const success = await sendEmail({
      to: testEmail,
      subject: 'Test Email from ResumeCoach',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Hello from ResumeCoach!</h1>
          <p>This is a test email sent from the Vercel development environment.</p>
          <p>If you're seeing this, your Resend integration is working correctly!</p>
          <p>Environment: ${process.env.VERCEL_ENV || 'local'}</p>
          <hr />
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message, please do not reply.
          </p>
        </div>
      `
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
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 