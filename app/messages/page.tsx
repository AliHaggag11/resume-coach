"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MessageSquare, Loader2, RefreshCcw } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  created_at: string;
}

interface Reply {
  id: string;
  message_id: string;
  content: string;
  created_at: string;
  support_user_id: string;
  support_user?: {
    full_name: string;
  };
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data as Message[]);
    } catch (error: any) {
      toast.error("Failed to load messages", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReplies = async (messageId: string) => {
    try {
      // First fetch replies
      const { data: replyData, error: replyError } = await supabase
        .from("message_replies")
        .select("*")
        .eq("message_id", messageId)
        .order("created_at", { ascending: true });

      if (replyError) throw replyError;

      if (!replyData?.length) {
        setReplies([]);
        return;
      }

      // Then fetch support user profiles
      const { data: profileData, error: profileError } = await supabase
        .from("support_user_profiles")
        .select("user_id, full_name")
        .in("user_id", replyData.map(reply => reply.support_user_id));

      if (profileError) throw profileError;

      // Map profiles to replies
      const profileMap = Object.fromEntries(
        (profileData || []).map(profile => [profile.user_id, profile])
      );

      const repliesWithProfiles = replyData.map(reply => ({
        ...reply,
        support_user: profileMap[reply.support_user_id] || { full_name: "Support Agent" }
      }));

      setReplies(repliesWithProfiles);
    } catch (error: any) {
      toast.error("Failed to load replies", {
        description: error.message,
      });
    }
  };

  const handleMessageSelect = async (message: Message) => {
    setSelectedMessage(message);
    setReplies([]);
    await fetchReplies(message.id);
  };

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-24">
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-semibold">Sign in to view messages</h2>
              <p className="text-muted-foreground">
                Please sign in to view your support messages and replies
              </p>
              <Link href="/signin">
                <Button>Sign In</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: Message["status"]) => {
    switch (status) {
      case "unread":
        return "bg-red-500/10 text-red-500";
      case "read":
        return "bg-yellow-500/10 text-yellow-500";
      case "replied":
        return "bg-green-500/10 text-green-500";
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Support Messages</h1>
          <p className="text-muted-foreground mt-1">
            View your support tickets and responses
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchMessages}
          disabled={isLoading}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ) : messages.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                <h2 className="text-xl font-semibold">No messages yet</h2>
                <p className="text-muted-foreground">
                  You haven't sent any support messages yet
                </p>
                <Link href="/contact">
                  <Button>Contact Support</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => (
            <Card key={message.id} className="overflow-hidden">
              <CardHeader className="pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-medium">
                      {message.subject}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className={getStatusColor(message.status)}>
                    {message.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="mt-4 p-4 rounded-lg bg-muted/50">
                  <p className="whitespace-pre-wrap">{message.message}</p>
                </div>

                {selectedMessage?.id === message.id && (
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center">
                      <div className="h-px flex-1 bg-border" />
                      <span className="px-4 text-sm text-muted-foreground">Replies</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    {replies.length > 0 ? (
                      replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="p-4 rounded-lg border bg-card"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">
                              {reply.support_user?.full_name || "Support Agent"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(reply.created_at).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        No replies yet
                      </p>
                    )}
                  </div>
                )}

                {selectedMessage?.id !== message.id && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => handleMessageSelect(message)}
                  >
                    View Replies
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 