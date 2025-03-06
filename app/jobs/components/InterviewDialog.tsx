'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Loader2, 
  MessageSquare, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText,
  ListChecks,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Interview {
  id: string;
  job_application_id: string;
  interview_type: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string;
  interviewer_names: string[];
  notes?: string;
}

interface InterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId?: string;
  interview?: Interview | null;
  onClose: () => void;
}

const INTERVIEW_TYPES = [
  'phone_screening',
  'technical',
  'behavioral',
  'onsite',
  'final',
] as const;

const typeIcons: Record<string, React.ReactNode> = {
  phone_screening: <MessageSquare className="h-4 w-4" />,
  technical: <ListChecks className="h-4 w-4" />,
  behavioral: <Users className="h-4 w-4" />,
  onsite: <MapPin className="h-4 w-4" />,
  final: <CheckCircle2 className="h-4 w-4" />,
};

export default function InterviewDialog({
  open,
  onOpenChange,
  applicationId,
  interview,
  onClose,
}: InterviewDialogProps) {
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    interview_type: interview?.interview_type || 'phone_screening',
    scheduled_at: interview?.scheduled_at ? new Date(interview.scheduled_at).toISOString().slice(0, 16) : '',
    duration_minutes: interview?.duration_minutes || 60,
    location: interview?.location || '',
    interviewer_names: Array.isArray(interview?.interviewer_names) ? interview.interviewer_names.join(', ') : '',
    notes: '',
  });

  // Reset form when interview changes
  useEffect(() => {
    if (interview) {
      setFormData({
        interview_type: interview.interview_type,
        scheduled_at: new Date(interview.scheduled_at).toISOString().slice(0, 16),
        duration_minutes: interview.duration_minutes,
        location: interview.location,
        interviewer_names: Array.isArray(interview.interviewer_names) ? interview.interviewer_names.join(', ') : '',
        notes: interview.notes || '',
      });
    } else {
      setFormData({
        interview_type: 'phone_screening',
        scheduled_at: '',
        duration_minutes: 60,
        location: '',
        interviewer_names: '',
        notes: '',
      });
    }
  }, [interview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId && !interview?.job_application_id) return;

    try {
      setIsSaving(true);

      if (!formData.scheduled_at) {
        toast.error('Please select an interview date and time');
        return;
      }

      // Convert local datetime to UTC for storage
      const localDate = new Date(formData.scheduled_at);
      const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);

      const data = {
        ...formData,
        scheduled_at: utcDate.toISOString(),
        job_application_id: applicationId || interview?.job_application_id,
        interviewer_names: formData.interviewer_names
          .split(',')
          .map((name) => name.trim())
          .filter(Boolean),
      };

      if (interview) {
        // Update existing interview
        const { error } = await supabase
          .from('job_interviews')
          .update(data)
          .eq('id', interview.id);

        if (error) throw error;
        toast.success('Interview updated successfully');
      } else {
        // Create new interview
        const { error } = await supabase
          .from('job_interviews')
          .insert([data]);

        if (error) throw error;

        // Update the application status to interview_scheduled
        if (applicationId) {
          await supabase
            .from('job_applications')
            .update({ status: 'interview_scheduled' })
            .eq('id', applicationId);
        }
        toast.success('Interview scheduled successfully');
      }

      onClose();
    } catch (error) {
      console.error('Error with interview:', error);
      toast.error(interview ? 'Failed to update interview' : 'Failed to schedule interview');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Format interview type for display
  const formatInterviewType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get times for the interview - start and end
  const getInterviewTimes = () => {
    if (!formData.scheduled_at) return { startTime: '', endTime: '' };
    
    const startDate = new Date(formData.scheduled_at);
    const endDate = new Date(startDate.getTime() + formData.duration_minutes * 60000);
    
    return {
      startTime: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Get formatted date
  const getFormattedDate = () => {
    if (!formData.scheduled_at) return '';
    
    const date = new Date(formData.scheduled_at);
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const { startTime, endTime } = getInterviewTimes();
  const formattedDate = getFormattedDate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="interview-dialog" className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              {interview ? 'Edit Interview' : 'Schedule Interview'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {interview 
                ? 'Update your interview details' 
                : 'Add a new interview for this job application'}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          <form id="interview-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Interview Information Card */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Interview Information
                </CardTitle>
                <CardDescription>
                  Schedule and details for the upcoming interview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="interview_type" className="text-sm font-medium">
                      Interview Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.interview_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, interview_type: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INTERVIEW_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className="flex items-center">
                            <div className="flex items-center gap-2">
                              {typeIcons[type]}
                              {formatInterviewType(type)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduled_at" className="text-sm font-medium">
                      Date & Time <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="scheduled_at"
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={(e) =>
                          setFormData({ ...formData, scheduled_at: e.target.value })
                        }
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration_minutes" className="text-sm font-medium">
                      Duration (minutes)
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="duration_minutes"
                        type="number"
                        min="15"
                        step="15"
                        value={formData.duration_minutes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration_minutes: parseInt(e.target.value),
                          })
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">
                      Location / Meeting Link
                    </Label>
                    <div className="relative">
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        placeholder="Enter location or meeting link"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <Label htmlFor="interviewer_names" className="text-sm font-medium">
                    Interviewer Names (comma-separated)
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="interviewer_names"
                      value={formData.interviewer_names}
                      onChange={(e) =>
                        setFormData({ ...formData, interviewer_names: e.target.value })
                      }
                      placeholder="e.g. John Smith, Jane Doe"
                      className="pl-9"
                    />
                  </div>
                </div>
                
                {formData.scheduled_at && (
                  <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Scheduled Time
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{formattedDate}</p>
                      <p className="text-muted-foreground">
                        {startTime} - {endTime} ({formData.duration_minutes} minutes)
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes Card */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Interview Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add details about the interview format, what to bring, or specific topics that will be covered"
                  className="min-h-[6rem]"
                />
              </CardContent>
            </Card>
          </form>
        </div>
        
        <div className="border-t p-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            form="interview-form"
            disabled={isSaving}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {interview ? 'Update Interview' : 'Schedule Interview'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 