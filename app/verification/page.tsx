"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

export default function Verification() {
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email address not found. Please try signing up again.');
      return;
    }

    setIsResending(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage('Verification email has been resent. Please check your inbox.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsResending(false);
    }
  };

  // If no email in URL, show error
  useEffect(() => {
    if (!email) {
      setError('Email address not found. Please try signing up again.');
    }
  }, [email]);

  return (
    <div className="relative isolate h-[calc(100vh-4rem)] overflow-x-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.15]" />
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-50 md:opacity-100" />
      </div>
      
      <main className="h-full flex items-center justify-center px-3 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[380px]"
        >
          <Card className="border-primary/20 shadow-2xl shadow-primary/10 backdrop-blur-sm">
            <CardHeader className="space-y-4 pt-6 px-3 md:pt-8 md:px-6">
              <div className="flex justify-center">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <CardTitle className="text-2xl font-bold tracking-tight">Check your email</CardTitle>
                <CardDescription className="text-base">
                  We sent you a verification link to {email}. Please check your email and click the link to verify your account.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-8 px-3 md:px-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/10 text-destructive p-3 rounded-md text-sm flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </motion.div>
              )}
              
              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/10 text-green-500 p-3 rounded-md text-sm flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  {successMessage}
                </motion.div>
              )}

              <p className="text-sm text-muted-foreground text-center">
                If you don't see the email, check your spam folder. The verification link will expire in 24 hours.
              </p>

              <Button
                variant="outline"
                className="w-full h-11"
                onClick={handleResendEmail}
                disabled={isResending || !email}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  'Resend verification email'
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
} 