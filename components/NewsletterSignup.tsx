"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle2, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function NewsletterSignup() {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const email = emailInput.value;
    
    if (!email) return;
    
    // Add loading state
    setIsSubscribing(true);
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Show success toast
        toast.success(data.message || 'Subscribed successfully!');
        // Reset form
        emailInput.value = '';
        setSubscriptionStatus('success');
      } else {
        // Show error toast
        toast.error(data.error || 'Failed to subscribe. Please try again.');
        setSubscriptionStatus('error');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      setSubscriptionStatus('error');
    } finally {
      setIsSubscribing(false);
      
      // Reset status after delay
      setTimeout(() => {
        setSubscriptionStatus('idle');
      }, 5000);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold">Stay Updated</h4>
      <p className="text-sm text-muted-foreground">
        Get the latest updates, tips, and career resources delivered straight to your inbox.
      </p>
      <div className="flex flex-col gap-2">
        <form onSubmit={handleSubscribe} className="flex gap-2">
          <Input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="h-10 rounded-full bg-background"
            disabled={isSubscribing}
            required
            aria-label="Email for newsletter"
          />
          <Button 
            type="submit" 
            size="sm" 
            className="h-10 rounded-full px-4"
            disabled={isSubscribing}
          >
            {isSubscribing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            <span className="sr-only">Subscribe</span>
          </Button>
        </form>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {subscriptionStatus === 'success' ? (
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          ) : subscriptionStatus === 'error' ? (
            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
          )}
          <span>
            {subscriptionStatus === 'success'
              ? 'Subscribed! Thank you.'
              : subscriptionStatus === 'error'
              ? 'Subscription failed. Please try again.'
              : 'No spam, unsubscribe anytime'}
          </span>
        </div>
      </div>
    </div>
  );
} 