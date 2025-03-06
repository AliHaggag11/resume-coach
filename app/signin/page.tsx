"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Github, Loader2, Lock, Mail } from "lucide-react";

// Component to handle redirect parameters
function SignInWithRedirect({ onParamsReady }: { onParamsReady: (redirectPath: string) => void }) {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  
  useEffect(() => {
    onParamsReady(redirectPath);
  }, [redirectPath, onParamsReady]);
  
  return null;
}

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false); // Track the authentication state
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn, signInWithGithub, signInWithGoogle, user } = useAuth();
  const router = useRouter();
  const [redirectPath, setRedirectPath] = useState('/dashboard');

  // If user is already authenticated, redirect them
  useEffect(() => {
    if (user) {
      setIsAuthenticating(false); // Clear authentication state when complete
      router.push(redirectPath);
    }
  }, [user, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsAuthenticating(true); // Start authentication
    setError(null);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
        setIsAuthenticating(false); // Clear authentication state on error
        return;
      }
      
      // Redirection will happen in the useEffect hook when user state updates
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsAuthenticating(false); // Clear authentication state on error
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setIsAuthenticating(true); // Start authentication
      const { error } = await signInWithGithub();
      if (error) {
        setError(error.message);
        setIsAuthenticating(false); // Clear authentication state on error
      }
    } catch (err) {
      setError("Failed to sign in with GitHub");
      setIsAuthenticating(false); // Clear authentication state on error
      console.error(err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsAuthenticating(true); // Start authentication
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
        setIsAuthenticating(false); // Clear authentication state on error
      }
    } catch (err) {
      setError("Failed to sign in with Google");
      setIsAuthenticating(false); // Clear authentication state on error
      console.error(err);
    }
  };

  return (
    <div className="relative isolate h-[calc(100vh-4rem)] overflow-x-hidden">
      {/* Wrap useSearchParams in Suspense boundary */}
      <Suspense fallback={null}>
        <SignInWithRedirect onParamsReady={setRedirectPath} />
      </Suspense>
      
      {/* Full-page loading overlay */}
      {isAuthenticating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
        >
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute w-full h-full rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-foreground">Signing you in...</p>
          <p className="mt-2 text-sm text-muted-foreground">You'll be redirected to the dashboard shortly</p>
        </motion.div>
      )}
      
      {/* Background decorations */}
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
              <div className="space-y-2 text-center">
                <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                <CardDescription className="text-base">
                  Sign in to your account to continue
                </CardDescription>
              </div>
              <div className="grid gap-3">
                <Button 
                  variant="outline" 
                  className="relative h-11"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || isAuthenticating}
                >
                  <div className="absolute left-4 flex h-5 w-5">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" className="w-full h-auto" />
                  </div>
                  Continue with Google
                </Button>
                <Button 
                  variant="outline"
                  className="relative h-11"
                  onClick={handleGithubSignIn}
                  disabled={isLoading || isAuthenticating}
                >
                  <Github className="absolute left-4 h-5 w-5" />
                  Continue with GitHub
                </Button>
              </div>
            </CardHeader>
            
            <div className="px-3 md:px-6 flex items-center gap-2 my-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground px-2">OR</span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 px-3 md:px-6">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-destructive/10 text-destructive p-3 rounded-md text-sm flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    {error}
                  </motion.div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                    required
                    disabled={isAuthenticating}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Password
                    </label>
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                    required
                    disabled={isAuthenticating}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={isAuthenticating}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 px-3 pb-6 md:px-6 md:pb-8">
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium"
                  disabled={isLoading || isAuthenticating}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link 
                    href="/signup" 
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Create one
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </main>
    </div>
  );
} 