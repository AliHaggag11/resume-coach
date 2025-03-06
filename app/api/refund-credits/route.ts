import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId, amount, reason } = await request.json();
    
    if (!userId || !amount || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a Supabase client for the server
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify the authenticated user matches the requested refund user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get current credits
    const { data: creditData, error: creditError } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();
      
    if (creditError) {
      console.error('Error fetching credits:', creditError);
      return NextResponse.json(
        { error: 'Error fetching user credits' },
        { status: 500 }
      );
    }
    
    const currentCredits = creditData?.credits || 0;
    const newCredits = currentCredits + amount;
    
    // Update credits
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({ credits: newCredits })
      .eq('user_id', userId);
      
    if (updateError) {
      console.error('Error updating credits:', updateError);
      return NextResponse.json(
        { error: 'Error updating credits' },
        { status: 500 }
      );
    }
    
    // Log transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        transaction_type: 'API_REFUND',
        description: reason,
        credits_before: currentCredits,
        credits_after: newCredits
      });
      
    if (transactionError) {
      console.error('Error logging transaction:', transactionError);
      // Continue since credits were updated successfully
    }
    
    return NextResponse.json({
      success: true,
      previousCredits: currentCredits,
      newCredits: newCredits,
      refunded: amount
    });
  } catch (error) {
    console.error('Server error processing refund:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 