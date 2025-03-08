import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';

// Batch size for sending emails
const BATCH_SIZE = 50;

interface Subscriber {
  email: string;
}

interface NewsletterOptions {
  subject: string;
  html: string;
  text?: string;
  fromEmail?: string;
  fromName?: string;
}

/**
 * Send a newsletter to all subscribers in batches
 */
export async function sendNewsletterToAllSubscribers({
  subject,
  html,
  text,
  fromEmail = process.env.EMAIL_FROM,
  fromName = process.env.EMAIL_FROM_NAME
}: NewsletterOptions): Promise<{ success: boolean; total: number; sent: number }> {
  let totalSubscribers = 0;
  let sentCount = 0;
  
  try {
    // First, count total subscribers
    const { count, error: countError } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'subscribed');
    
    if (countError) {
      console.error('Error counting subscribers:', countError);
      return { success: false, total: 0, sent: 0 };
    }
    
    totalSubscribers = count || 0;
    
    if (totalSubscribers === 0) {
      return { success: true, total: 0, sent: 0 };
    }
    
    // Process in batches
    let page = 0;
    let hasMore = true;
    
    while (hasMore) {
      const from = page * BATCH_SIZE;
      const to = from + BATCH_SIZE - 1;
      
      const { data: subscribers, error: fetchError } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('status', 'subscribed')
        .range(from, to);
      
      if (fetchError) {
        console.error(`Error fetching subscribers batch ${page}:`, fetchError);
        break;
      }
      
      if (!subscribers || subscribers.length === 0) {
        hasMore = false;
        break;
      }
      
      // Process this batch
      const batchEmails = subscribers.map((sub: Subscriber) => sub.email);
      const batchSuccess = await sendBatchEmails({
        emails: batchEmails,
        subject,
        html,
        text,
        fromEmail,
        fromName
      });
      
      if (batchSuccess) {
        sentCount += batchEmails.length;
      }
      
      // Prepare for next batch
      page++;
      hasMore = subscribers.length === BATCH_SIZE;
      
      // Add a small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return {
      success: sentCount > 0,
      total: totalSubscribers,
      sent: sentCount
    };
  } catch (error) {
    console.error('Error sending newsletter to all subscribers:', error);
    return { 
      success: false, 
      total: totalSubscribers, 
      sent: sentCount 
    };
  }
}

/**
 * Send emails to a batch of subscribers
 */
async function sendBatchEmails({
  emails,
  subject,
  html,
  text,
  fromEmail,
  fromName
}: {
  emails: string[];
  subject: string;
  html: string;
  text?: string;
  fromEmail?: string;
  fromName?: string;
}): Promise<boolean> {
  try {
    // For production, you would typically use a dedicated email service
    // that supports batch sending or use BCC for small batches
    
    // This is a simple implementation - in production, you'd want to:
    // 1. Use a proper email service with bulk sending capabilities
    // 2. Handle failures and retries
    // 3. Track which emails were sent successfully
    
    // For some email providers like SendGrid, you can use their API for batch sending
    // Here, we're just calling our sendEmail function for simplicity
    
    const result = await sendEmail({
      to: emails,
      subject,
      html,
      text,
      from: fromEmail,
      fromName
    });
    
    return result;
  } catch (error) {
    console.error('Error sending batch emails:', error);
    return false;
  }
} 