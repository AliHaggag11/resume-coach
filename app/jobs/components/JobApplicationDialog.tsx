'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
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

interface JobApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application?: any;
  onClose: () => void;
}

const REMOTE_TYPES = ['remote', 'hybrid', 'onsite'] as const;
const APPLICATION_STATUSES = [
  'applied',
  'screening',
  'interview_scheduled',
  'interviewed',
  'offer_received',
  'offer_accepted',
  'offer_declined',
  'rejected',
] as const;

export default function JobApplicationDialog({
  open,
  onOpenChange,
  application,
  onClose,
}: JobApplicationDialogProps) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    job_description: '',
    job_link: '',
    status: 'applied',
    salary_range: '',
    location: '',
    remote_type: 'onsite',
    notes: '',
  });

  useEffect(() => {
    if (application) {
      setFormData({
        company_name: application.company_name || '',
        job_title: application.job_title || '',
        job_description: application.job_description || '',
        job_link: application.job_link || '',
        status: application.status || 'applied',
        salary_range: application.salary_range || '',
        location: application.location || '',
        remote_type: application.remote_type || 'onsite',
        notes: application.notes || '',
      });
    } else {
      setFormData({
        company_name: '',
        job_title: '',
        job_description: '',
        job_link: '',
        status: 'applied',
        salary_range: '',
        location: '',
        remote_type: 'onsite',
        notes: '',
      });
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSaving(true);

      if (!formData.company_name || !formData.job_title) {
        toast.error('Please fill in all required fields');
        return;
      }

      const data = {
        ...formData,
        user_id: user.id,
      };

      let result;
      if (application?.id) {
        result = await supabase
          .from('job_applications')
          .update(data)
          .eq('id', application.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('job_applications')
          .insert([data])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast.success(
        application?.id
          ? 'Job application updated successfully'
          : 'Job application added successfully'
      );
      onClose();
    } catch (error) {
      console.error('Error saving job application:', error);
      toast.error('Failed to save job application');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:p-6 p-4">
        <DialogHeader>
          <DialogTitle>
            {application?.id ? 'Edit Job Application' : 'Add New Job Application'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                placeholder="Enter company name"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title *</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) =>
                  setFormData({ ...formData, job_title: e.target.value })
                }
                placeholder="Enter job title"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Enter location"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_range">Salary Range</Label>
              <Input
                id="salary_range"
                value={formData.salary_range}
                onChange={(e) =>
                  setFormData({ ...formData, salary_range: e.target.value })
                }
                placeholder="e.g. $80,000 - $100,000"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remote_type">Work Type</Label>
              <Select
                value={formData.remote_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, remote_type: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REMOTE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Application Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ').charAt(0).toUpperCase() +
                        status.replace('_', ' ').slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_link">Job Posting URL</Label>
            <Input
              id="job_link"
              value={formData.job_link}
              onChange={(e) =>
                setFormData({ ...formData, job_link: e.target.value })
              }
              placeholder="Enter job posting URL"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_description">Job Description</Label>
            <Textarea
              id="job_description"
              value={formData.job_description}
              onChange={(e) =>
                setFormData({ ...formData, job_description: e.target.value })
              }
              placeholder="Enter job description"
              className="min-h-[8rem] w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about this application"
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
              {application?.id ? 'Update' : 'Add'} Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 