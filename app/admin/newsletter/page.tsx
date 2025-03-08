"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Send, Mail, Info, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";

export default function NewsletterAdmin() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sendToAll, setSendToAll] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Check for admin permissions
  const isAdmin = user?.user_metadata?.role === 'admin';

  // Fetch subscriber count on mount
  useEffect(() => {
    const fetchSubscriberCount = async () => {
      if (!isAdmin) return;

      try {
        const { count, error } = await supabase
          .from('newsletter_subscribers')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'subscribed');

        if (error) throw error;
        setSubscriberCount(count || 0);
      } catch (error) {
        console.error('Error fetching subscriber count:', error);
        toast.error('Failed to fetch subscriber count');
      }
    };

    fetchSubscriberCount();
  }, [isAdmin]);

  // Handle form submission
  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast.error('Please fill in both subject and content fields');
      return;
    }

    if (!testEmail && !sendToAll) {
      toast.error('Please either enter a test email or select "Send to all subscribers"');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: emailSubject,
          html: emailContent,
          testEmail: testEmail || null,
          sendToAll
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Newsletter sent successfully');
        if (!testEmail) {
          // Clear the form if it was a real send
          setEmailSubject("");
          setEmailContent("");
          setSendToAll(false);
        }
      } else {
        toast.error(data.error || 'Failed to send newsletter');
      }
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // If not admin, show access denied
  if (!authLoading && !isAdmin) {
    return (
      <div className="container max-w-5xl py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-red-500">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-8">Newsletter Management</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Newsletter Statistics
          </CardTitle>
          <CardDescription>
            Overview of your newsletter subscribers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Subscribers</p>
              <p className="text-3xl font-bold mt-1">
                {subscriberCount === null ? (
                  <Loader2 className="h-6 w-6 animate-spin inline-block" />
                ) : (
                  subscriberCount
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            Compose Newsletter
          </CardTitle>
          <CardDescription>
            Create and send a newsletter to your subscribers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="compose" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="compose" onClick={() => setPreviewMode(false)}>Compose</TabsTrigger>
              <TabsTrigger value="preview" onClick={() => setPreviewMode(true)}>Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="compose">
              <form onSubmit={handleSendNewsletter} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Email Content (HTML)</Label>
                  <Textarea
                    id="content"
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    placeholder="Enter email content (HTML supported)"
                    className="min-h-[200px]"
                    required
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="testEmail">Test Email (optional)</Label>
                    <Input
                      id="testEmail"
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="Enter an email to test before sending to all"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendToAll"
                      checked={sendToAll}
                      onCheckedChange={(checked) => 
                        setSendToAll(checked === true)
                      }
                      disabled={subscriberCount === 0}
                    />
                    <Label htmlFor="sendToAll" className="cursor-pointer">
                      Send to all subscribers ({subscriberCount || 0})
                    </Label>
                  </div>
                  
                  {sendToAll && (
                    <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">
                        <p>This will send the newsletter to all {subscriberCount} active subscribers.</p>
                        <p className="mt-1">Make sure you've tested the email first!</p>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="preview">
              <div className="border rounded-md p-6 min-h-[400px] bg-white">
                {emailContent ? (
                  <div>
                    <h2 className="text-xl font-bold mb-4">{emailSubject || "Email Subject"}</h2>
                    <div dangerouslySetInnerHTML={{ __html: emailContent }} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Enter content in the compose tab to see a preview
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/admin')}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={handleSendNewsletter}
            disabled={isLoading || (!testEmail && !sendToAll) || !emailSubject || !emailContent}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {testEmail && !sendToAll ? "Send Test" : "Send Newsletter"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 