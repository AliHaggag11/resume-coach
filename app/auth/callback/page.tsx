"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get('code');
      const next = searchParams.get('next') ?? '/builder';

      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            router.push(next);
          }
        } catch (error) {
          console.error('Error exchanging code for session:', error);
        }
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-pulse text-center">
        <h2 className="text-2xl font-bold mb-2">Verifying...</h2>
        <p className="text-muted-foreground">Please wait while we verify your account.</p>
      </div>
    </div>
  );
} 