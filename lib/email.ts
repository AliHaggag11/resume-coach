import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Check if API key is set
if (!process.env.RESEND_API_KEY) {
  console.warn('Resend API key not set. Email functionality will not work.');
}

export interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = process.env.EMAIL_FROM,
  fromName = process.env.EMAIL_FROM_NAME
}: EmailData): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.error('Resend API key not configured');
    return false;
  }

  try {
    // For development/preview environments, use Resend's shared domain
    const isProd = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV?.includes('preview');
    
    // Use Resend's shared domain for development/preview
    const fromEmail = isProd 
      ? (from || 'noreply@resumecoach.com')
      : 'onboarding@resend.dev';
    
    const fromAddress = fromName 
      ? `${fromName} <${fromEmail}>` 
      : fromEmail;

    console.log('Sending email:', {
      from: fromAddress,
      to: Array.isArray(to) ? to : [to],
      subject,
      isProd,
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'Not in Vercel'
    });

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: Array.isArray(to) ? to : [to],
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback plain text version
      html
    });

    if (error) {
      console.error('Error sending email with Resend:', error);
      return false;
    }

    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send a newsletter to multiple recipients
 */
export async function sendNewsletter({
  subject,
  html,
  text,
  testEmail = null
}: {
  subject: string;
  html: string;
  text?: string;
  testEmail?: string | null;
}): Promise<boolean> {
  try {
    const email = {
      to: testEmail || process.env.EMAIL_FROM || 'noreply@resumecoach.com',
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
      from: process.env.EMAIL_FROM,
      fromName: process.env.EMAIL_FROM_NAME
    };
    
    // If it's a test send, just send to the test email
    if (testEmail) {
      return await sendEmail(email);
    }
    
    // For actual newsletters, we'll use the same interface but the batch sending
    // will be handled by the newsletter.ts module using Resend's API
    return await sendEmail(email);
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return false;
  }
} 