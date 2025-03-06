"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserCheck, UserMinus, Trash2, Mail, Users, HeadphonesIcon, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Ticket = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  user_id: string;
  status: string;
  created_at: string;
  assigned_to: string | null;
  replies?: Reply[];
};

type Reply = {
  id: string;
  message_id: string;
  content: string;
  created_at: string;
  support_user_id: string;
  support_user_profiles?: {
    full_name: string;
  };
};

type Message = {
  id: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  created_at: string;
};

type StaffUser = {
  id: string;
  email: string;
  role: string;
  full_name: string;
  created_at: string;
};

type ConversationItem = {
  id: string;
  content: string;
  created_at: string;
  is_staff: boolean;
  sender_name: string;
};

type TicketStatus = 'unread' | 'read' | 'replied' | 'closed';

function TicketReplyForm({ ticketId, onReplyAdded }: { ticketId: string; onReplyAdded: () => void }) {
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('message_replies')
        .insert({
          message_id: ticketId,
          content: replyContent.trim(),
        });

      if (error) throw error;

      setReplyContent('');
      onReplyAdded();
      toast.success('Reply sent successfully');
    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast.error(error.message || 'Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <Textarea
        placeholder="Type your reply..."
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        className="min-h-[100px]"
      />
      <Button
        type="submit"
        className="mt-2"
        disabled={isSubmitting || !replyContent.trim()}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Send Reply'
        )}
      </Button>
    </form>
  );
}

function StaffManagement() {
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffUser | null>(null);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'support' | 'admin'>('support');
  const [isAddingStaff, setIsAddingStaff] = useState(false);

  const fetchStaffUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_staff_users');
      if (error) throw error;
      setStaffUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching staff users:', error);
      toast.error(error.message || 'Failed to load staff users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail.trim() || !newStaffName.trim() || !newStaffPassword.trim()) return;

    setIsAddingStaff(true);
    try {
      const response = await fetch('/api/admin/create-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newStaffEmail.trim(),
          password: newStaffPassword.trim(),
          fullName: newStaffName.trim(),
          role: newStaffRole
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add staff member');
      }

      setNewStaffEmail('');
      setNewStaffName('');
      setNewStaffPassword('');
      setNewStaffRole('support');
      fetchStaffUsers();
      toast.success('Staff member added successfully');
    } catch (error: any) {
      console.error('Error adding staff:', error);
      toast.error(error.message || 'Failed to add staff member');
    } finally {
      setIsAddingStaff(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'support' | 'admin') => {
    try {
      const { error } = await supabase.rpc('update_user_role', {
        user_id: userId,
        new_role: newRole
      });

      if (error) throw error;

      fetchStaffUsers();
      toast.success('Role updated successfully');
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Failed to update role');
    }
  };

  const handleDeleteClick = (staffUser: StaffUser) => {
    setStaffToDelete(staffUser);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!staffToDelete) return;

    setIsDeleting(staffToDelete.id);
    try {
      const { error } = await supabase.rpc('delete_staff_user', {
        user_id: staffToDelete.id
      });

      if (error) throw error;

      fetchStaffUsers();
      toast.success('Staff member removed successfully');
    } catch (error: any) {
      console.error('Error deleting staff:', error);
      toast.error(error.message || 'Failed to remove staff member');
    } finally {
      setIsDeleting(null);
      setDeleteConfirmOpen(false);
      setStaffToDelete(null);
    }
  };

  useEffect(() => {
    fetchStaffUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Add New Staff Member</CardTitle>
          <CardDescription>
            Add support agents or administrators to help manage customer inquiries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddStaff} className="space-y-4">
            <div className="space-y-4">
              <Input
                placeholder="Email address"
                type="email"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                required
              />
              <Input
                placeholder="Full name"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                required
              />
              <Input
                placeholder="Password"
                type="password"
                value={newStaffPassword}
                onChange={(e) => setNewStaffPassword(e.target.value)}
                required
                minLength={8}
              />
              <Select
                value={newStaffRole}
                onValueChange={(value: 'support' | 'admin') => setNewStaffRole(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="support">Support Agent</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full sm:w-auto" disabled={isAddingStaff}>
              {isAddingStaff ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Staff Member'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Staff Members</CardTitle>
          <CardDescription>
            Manage existing support staff and administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {staffUsers.map((staffUser) => (
              <div
                key={staffUser.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border gap-3"
              >
                <div className="w-full sm:w-auto">
                  <div className="font-medium truncate">{staffUser.full_name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {staffUser.email}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Select
                    value={staffUser.role}
                    onValueChange={(value: 'support' | 'admin') =>
                      handleUpdateRole(staffUser.id, value)
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteClick(staffUser)}
                    disabled={isDeleting === staffUser.id}
                    className="h-10 w-10 shrink-0"
                  >
                    {isDeleting === staffUser.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {staffToDelete?.full_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting === staffToDelete?.id}
            >
              {isDeleting === staffToDelete?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Staff Member'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Update the TicketReplies component to show the full conversation history
function TicketReplies({ ticket }: { ticket: Ticket }) {
  const conversationHistory: ConversationItem[] = [
    {
      id: ticket.id,
      content: ticket.message,
      created_at: ticket.created_at,
      is_staff: false,
      sender_name: ticket.name
    },
    ...(ticket.replies?.map(reply => ({
      id: reply.id,
      content: reply.content,
      created_at: reply.created_at,
      is_staff: true,
      sender_name: reply.support_user_profiles?.full_name || 'Support Agent'
    })) || [])
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <div className="mt-6 space-y-6">
      <h3 className="font-medium">Conversation History</h3>
      <div className="space-y-4">
        {conversationHistory.map((item) => (
          <div 
            key={item.id} 
            className={`flex ${item.is_staff ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                rounded-lg p-4 max-w-[95%] sm:max-w-[80%] break-words
                ${item.is_staff 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
                }
              `}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 mb-2">
                <span className="text-sm font-medium truncate">
                  {item.sender_name}
                </span>
                <span className="text-xs opacity-75">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap break-words overflow-hidden">{item.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TicketManagement() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assigningTicket, setAssigningTicket] = useState<string | null>(null);
  const isAdmin = user?.user_metadata?.role === 'admin';

  const fetchTickets = async () => {
    try {
      const { data: staffTickets, error } = await supabase
        .rpc('get_staff_tickets')
        .throwOnError();
      
      if (error) throw error;

      const transformedData = (staffTickets || []).map((ticket: any) => ({
        ...ticket,
        id: ticket.id.toString(),
        user_id: ticket.user_id?.toString() || null,
        assigned_to: ticket.assigned_to?.toString() || null,
        created_at: new Date(ticket.created_at).toISOString(),
        replies: ticket.replies || []
      }));
      
      setTickets(transformedData);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast.error(error.message || 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStaffUsers = async () => {
    if (!isAdmin) return;
    try {
      const { data, error } = await supabase.rpc('get_staff_users');
      if (error) throw error;
      setStaffUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching staff users:', error);
      toast.error(error.message || 'Failed to load staff users');
    }
  };

  const handleAssignTicket = async (ticketId: string, staffId: string | null) => {
    try {
      setAssigningTicket(ticketId);
      const { error } = await supabase.rpc('assign_ticket', {
        ticket_id: ticketId,
        staff_id: staffId
      });

      if (error) throw error;

      await fetchTickets();
      toast.success(staffId ? 'Ticket assigned successfully' : 'Ticket unassigned successfully');
    } catch (error: any) {
      console.error('Error assigning ticket:', error);
      toast.error(error.message || 'Failed to assign ticket');
    } finally {
      setAssigningTicket(null);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      const { error } = await supabase.rpc('update_ticket_status', {
        ticket_id: ticketId,
        new_status: newStatus
      });

      if (error) throw error;

      await fetchTickets();
      toast.success(`Ticket ${newStatus === 'closed' ? 'closed' : 'reopened'} successfully`);
    } catch (error: any) {
      console.error('Error updating ticket status:', error);
      toast.error(error.message || 'Failed to update ticket status');
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchStaffUsers();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              No tickets found
            </div>
          </CardContent>
        </Card>
      ) : (
        tickets.map((ticket) => (
          <Card key={ticket.id} className={ticket.status === 'closed' ? 'opacity-75' : ''}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base sm:text-lg">{ticket.subject}</CardTitle>
                  <CardDescription>
                    From: {ticket.email}
                    <span className="block sm:inline sm:ml-2 text-xs text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleString()}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge 
                    variant={
                      ticket.status === 'unread' 
                        ? 'destructive' 
                        : ticket.status === 'closed'
                        ? 'outline'
                        : ticket.status === 'replied'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {ticket.status}
                  </Badge>
                  
                  {(isAdmin || ticket.assigned_to === user?.id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateTicketStatus(
                        ticket.id, 
                        ticket.status === 'closed' ? 'read' : 'closed'
                      )}
                    >
                      {ticket.status === 'closed' ? 'Reopen' : 'Close'}
                    </Button>
                  )}
                  
                  {isAdmin && (
                    <Select
                      value={ticket.assigned_to || 'unassigned'}
                      onValueChange={(value) => handleAssignTicket(
                        ticket.id, 
                        value === 'unassigned' ? null : value
                      )}
                      disabled={assigningTicket === ticket.id || ticket.status === 'closed'}
                    >
                      <SelectTrigger className="w-[160px] sm:w-[200px]">
                        <SelectValue>
                          {ticket.assigned_to ? (
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4" />
                              <span className="truncate">
                                {staffUsers.find(staff => staff.id === ticket.assigned_to)?.full_name || 'Unknown'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <UserMinus className="h-4 w-4" />
                              Unassigned
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">
                          <div className="flex items-center gap-2">
                            <UserMinus className="h-4 w-4" />
                            Unassigned
                          </div>
                        </SelectItem>
                        {staffUsers.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4" />
                              {staff.full_name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {!isAdmin && ticket.assigned_to && (
                    <Badge variant="outline" className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      {staffUsers.find(staff => staff.id === ticket.assigned_to)?.full_name || 'Assigned Staff'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TicketReplies ticket={ticket} />
              
              {(isAdmin || ticket.assigned_to === user?.id) && 
               ticket.status !== 'closed' && (
                <TicketReplyForm 
                  ticketId={ticket.id} 
                  onReplyAdded={fetchTickets} 
                />
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function UserMessages() {
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
      const { data: replyData, error: replyError } = await supabase
        .from("message_replies")
        .select(`
          *,
          support_user_profiles(full_name)
        `)
        .eq("message_id", messageId)
        .order("created_at", { ascending: true });

      if (replyError) throw replyError;
      setReplies(replyData || []);
    } catch (error: any) {
      toast.error("Failed to load replies", {
        description: error.message,
      });
    }
  };

  const handleMessageSelect = async (message: Message) => {
    setSelectedMessage(message);
    await fetchReplies(message.id);
  };

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
    <div className="space-y-6">
      {messages.length === 0 ? (
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
          <Card key={message.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{message.subject}</CardTitle>
                  <CardDescription>
                    {new Date(message.created_at).toLocaleString()}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className={getStatusColor(message.status)}>
                  {message.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 p-4 rounded-lg bg-muted/50">
                <p className="whitespace-pre-wrap break-words overflow-hidden">{message.message}</p>
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
                            {reply.support_user_profiles?.full_name || "Support Agent"}
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

              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={() => handleMessageSelect(message)}
              >
                View Replies
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export default function SupportDashboard() {
  const { user } = useAuth();
  const role = user?.user_metadata?.role;

  if (!user || !role || !['support', 'admin'].includes(role)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-[400px]">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Support Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage support tickets and staff members
          </p>
        </div>
        <Badge variant="outline" className="self-start sm:self-center text-sm">
          {role === 'admin' ? 'Admin' : 'Support Staff'}
        </Badge>
      </div>

      <Tabs defaultValue="tickets" className="flex-1">
        <TabsList className="mb-4 w-full grid grid-cols-3 gap-2">
          <TabsTrigger value="tickets" className="flex items-center justify-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Tickets</span>
            <span className="sm:hidden">Tix</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center justify-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">User Messages</span>
            <span className="sm:hidden">Msgs</span>
          </TabsTrigger>
          {role === 'admin' && (
            <TabsTrigger value="staff" className="flex items-center justify-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Staff Management</span>
              <span className="sm:hidden">Staff</span>
            </TabsTrigger>
          )}
        </TabsList>

        <div className="bg-card rounded-lg border flex-1 overflow-hidden">
          <TabsContent value="tickets" className="m-0 p-3 md:p-4 h-full overflow-auto">
            <TicketManagement />
          </TabsContent>

          <TabsContent value="messages" className="m-0 p-3 md:p-4 h-full overflow-auto">
            <UserMessages />
          </TabsContent>

          {role === 'admin' && (
            <TabsContent value="staff" className="m-0 p-3 md:p-4 h-full overflow-auto">
              <StaffManagement />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
} 