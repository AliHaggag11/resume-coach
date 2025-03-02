'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Loader2 } from 'lucide-react';

interface InterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId?: string;
  onClose: () => void;
}

const INTERVIEW_TYPES = [
  'phone_screening',
  'technical',
  'behavioral',
  'onsite',
  'final',
] as const;

export default function InterviewDialog({
  open,
  onOpenChange,
  applicationId,
  onClose,
}: InterviewDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    interview_type: 'phone_screening',
    scheduled_at: '',
    duration_minutes: 60,
    location: '',
    interviewer_names: '',
    notes: '',
    preparation_notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId) return;

    try {
      setIsSaving(true);

      if (!formData.scheduled_at) {
        toast.error('Please select an interview date and time');
        return;
      }

      const data = {
        ...formData,
        job_application_id: applicationId,
        interviewer_names: formData.interviewer_names
          .split(',')
          .map((name) => name.trim())
          .filter(Boolean),
      };

      const { error } = await supabase.from('job_interviews').insert([data]);

      if (error) throw error;

      // Update the application status to interview_scheduled
      await supabase
        .from('job_applications')
        .update({ status: 'interview_scheduled' })
        .eq('id', applicationId);

      toast.success('Interview scheduled successfully');
      onClose();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:p-6 p-4">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interview_type">Interview Type *</Label>
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
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').charAt(0).toUpperCase() +
                        type.replace('_', ' ').slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Date & Time *</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_at: e.target.value })
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
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
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location / Meeting Link</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Enter location or meeting link"
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interviewer_names">
              Interviewer Names (comma-separated)
            </Label>
            <Input
              id="interviewer_names"
              value={formData.interviewer_names}
              onChange={(e) =>
                setFormData({ ...formData, interviewer_names: e.target.value })
              }
              placeholder="e.g. John Smith, Jane Doe"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Interview Details</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any details about the interview"
              className="min-h-[6rem] w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preparation_notes">Preparation Notes</Label>
            <Textarea
              id="preparation_notes"
              value={formData.preparation_notes}
              onChange={(e) =>
                setFormData({ ...formData, preparation_notes: e.target.value })
              }
              placeholder="Add notes for interview preparation"
              className="min-h-[6rem] w-full"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule Interview
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 