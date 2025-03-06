"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { TermsDialog } from "@/components/TermsDialog";
import { PrivacyDialog } from "@/components/PrivacyDialog";
import { ArrowRight, Github, Loader2, Lock, Mail, User, AlertCircle } from "lucide-react";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const { signUp, signUpWithGithub, signUpWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!acceptTerms) {
      setError("Please accept the terms and conditions");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password, name);
      
      if (error) {
        setError(error.message);
        return;
      }
      
      router.push(`/verification?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = provider === 'google' 
        ? await signUpWithGoogle()
        : await signUpWithGithub();

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
                <div className="space-y-2 text-center">
                  <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
                  <CardDescription className="text-base">
                    Get started with your free resume builder account
                  </CardDescription>
                </div>
                <div className="grid gap-3">
                  <Button 
                    variant="outline" 
                    className="relative h-11"
                    onClick={() => handleOAuthSignUp('google')}
                    disabled={isLoading}
                  >
                    <div className="absolute left-4 flex h-5 w-5">
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" className="w-full h-auto" />
                    </div>
                    {isLoading ? 'Connecting...' : 'Continue with Google'}
                  </Button>
                  <Button 
                    variant="outline"
                    className="relative h-11"
                    onClick={() => handleOAuthSignUp('github')}
                    disabled={isLoading}
                  >
                    <Github className="absolute left-4 h-5 w-5" />
                    {isLoading ? 'Connecting...' : 'Continue with GitHub'}
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
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Full name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  
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
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirm-password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Confirm password
                    </label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <Checkbox 
                      id="terms" 
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-muted-foreground"
                    >
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setIsTermsOpen(true)}
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        Terms of Service
                      </button>
                      {" "}and{" "}
                      <button
                        type="button"
                        onClick={() => setIsPrivacyOpen(true)}
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 px-3 pb-6 md:px-6 md:pb-8">
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <div className="text-center text-sm">
                    Already have an account?{" "}
                    <Link 
                      href="/signin" 
                      className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Sign in
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </main>
      </div>
      
      <TermsDialog isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PrivacyDialog isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </>
  );
} 