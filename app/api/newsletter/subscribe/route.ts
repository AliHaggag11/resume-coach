import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

// Define validation schema for the email
const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const { email } = subscribeSchema.parse(body);

    // Check if email already exists and is subscribed
    const { data: existingSubscriber, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking for existing subscriber:', fetchError);
      return NextResponse.json(
        { error: 'Failed to process subscription' },
        { status: 500 }
      );
    }

    // If already subscribed, return success
    if (existingSubscriber && existingSubscriber.status === 'subscribed') {
      return NextResponse.json(
        { 
          success: true, 
          message: 'You are already subscribed to our newsletter!' 
        },
        { status: 200 }
      );
    }

    // If exists but unsubscribed, update status
    if (existingSubscriber && existingSubscriber.status === 'unsubscribed') {
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({ status: 'subscribed' })
        .eq('id', existingSubscriber.id);

      if (updateError) {
        console.error('Error resubscribing:', updateError);
        return NextResponse.json(
          { error: 'Failed to resubscribe' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { 
          success: true, 
          message: 'You have been resubscribed to our newsletter!' 
        },
        { status: 200 }
      );
    }

    // Otherwise, insert new subscriber
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email, source: 'footer' }]);

    if (insertError) {
      console.error('Error subscribing:', insertError);
      
      // Check for unique constraint error
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Thanks for subscribing to our newsletter!' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in newsletter subscription:', error);
    
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