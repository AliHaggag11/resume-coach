"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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
import { Loader2, UserCheck, UserMinus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

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
type StaffUser = {
  id: string;
  email: string;
  role: 'support' | 'admin';
  full_name: string;
};

// Add this interface to handle the raw database response
interface RawTicket {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    user_id: string;
    status: string;
    created_at: string;
    assigned_to: string | null;
}

type Reply = {
  id: string;
  content: string;
  created_at: string;
  support_user_name: string;
};

// First, add a new type for conversation items
type ConversationItem = {
  id: string;
  content: string;
  created_at: string;
  is_staff: boolean;
  sender_name: string;
};

// Add these type definitions at the top with your other types
type TicketStatus = 'unread' | 'read' | 'replied' | 'closed';

export default function SupportDashboard() {
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

      // Transform the data to match your Ticket type
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

      if (error) {
        console.error('Error updating ticket status:', error);
        throw error;
      }

      await fetchTickets(); // Refresh tickets after update
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{ticket.subject}</CardTitle>
                  <CardDescription>
                    From: {ticket.email}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleString()}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
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
                  
                  {/* Only show action buttons if ticket isn't closed or user has permission to reopen */}
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
                  
                  {/* Assignment dropdown for admins */}
                  {isAdmin && (
                    <Select
                      value={ticket.assigned_to || 'unassigned'}
                      onValueChange={(value) => handleAssignTicket(
                        ticket.id, 
                        value === 'unassigned' ? null : value
                      )}
                      disabled={assigningTicket === ticket.id || ticket.status === 'closed'}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Assign to staff">
                          {ticket.assigned_to ? (
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4" />
                              {staffUsers.find(staff => staff.id === ticket.assigned_to)?.full_name || 'Unknown'}
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
                  
                  {/* Show assigned staff badge for non-admins */}
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
              
              {/* Show reply form only if ticket is open and user has permission */}
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

function TicketReplyForm({ 
  ticketId, 
  onReplyAdded 
}: { 
  ticketId: string; 
  onReplyAdded: () => void;
}) {
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = replyContent.trim();
    if (!content) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('add_ticket_reply', {
        ticket_id: ticketId,
        reply_content: content
      });

      if (error) {
        console.error('Error sending reply:', error);
        throw error;
      }

      setReplyContent(""); // Clear the input
      await onReplyAdded(); // Refresh tickets after reply
      toast.success('Reply sent successfully');
    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast.error(error.message || 'Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <Textarea
        placeholder="Type your reply..."
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        disabled={isSubmitting}
        required
        minLength={1}
        className="min-h-[100px]"
      />
      <Button 
        type="submit" 
        disabled={isSubmitting || !replyContent.trim()}
        className="w-full sm:w-auto"
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

// Update the TicketReplies component to show the full conversation history
function TicketReplies({ ticket }: { ticket: Ticket }) {
  // Create conversation history by combining original message and replies
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
      sender_name: reply.support_user_name
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
                rounded-lg p-4 max-w-[80%]
                ${item.is_staff 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
                }
              `}
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-sm font-medium">
                  {item.sender_name}
                </span>
                <span className="text-xs opacity-75">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{item.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 