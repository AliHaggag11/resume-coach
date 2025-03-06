'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/context/AuthContext';
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
  Building2,
  Briefcase,
  MapPin,
  DollarSign,
  Link,
  FileText,
  StickyNote
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

const statusColors: Record<string, string> = {
  applied: 'bg-blue-500/10 text-blue-500 border-blue-200',
  screening: 'bg-purple-500/10 text-purple-500 border-purple-200',
  interview_scheduled: 'bg-yellow-500/10 text-yellow-500 border-yellow-200',
  interviewed: 'bg-orange-500/10 text-orange-500 border-orange-200',
  offer_received: 'bg-green-500/10 text-green-500 border-green-200',
  offer_accepted: 'bg-emerald-500/10 text-emerald-500 border-emerald-200',
  offer_declined: 'bg-gray-500/10 text-gray-500 border-gray-200',
  rejected: 'bg-red-500/10 text-red-500 border-red-200',
};

export default function JobApplicationDialog({
  open,
  onOpenChange,
  application,
  onClose,
}: JobApplicationDialogProps) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const isAddMode = !application?.id;

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
        status: application.status || 'applied',
        job_description: application.job_description || '',
        location: application.location || '',
        remote_type: application.remote_type || 'onsite',
        salary_range: application.salary_range || '',
        job_link: application.job_link || '',
        notes: application.notes || '',
      });
    } else {
      // Reset the form when creating a new application
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
  }, [open, application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to add or edit applications');
      return;
    }

    try {
      setIsSaving(true);
      
      let payload;
      
      if (isAddMode) {
        // For new applications, use all form data
        payload = { ...formData, user_id: user.id };
      } else {
        // For editing, only update editable fields
        payload = {
          job_description: formData.job_description,
          notes: formData.notes,
        };
      }

      let result;
      
      if (application?.id) {
        // Update existing application
        result = await supabase
          .from('job_applications')
          .update(payload)
          .eq('id', application.id);
      } else {
        // Insert new application
        result = await supabase
          .from('job_applications')
          .insert([payload]);
      }

      if (result.error) {
        throw result.error;
      }

      toast.success(
        application?.id
          ? 'Application updated successfully'
          : 'Application added successfully'
      );
      
      onOpenChange(false);
      onClose();
    } catch (error) {
      console.error('Error saving application:', error);
      toast.error('Failed to save application. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Format the status text nicely
  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              {isAddMode ? 'Add New Job Application' : 'Edit Job Application'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {isAddMode 
                ? 'Track a new job application to monitor your job search progress'
                : 'Update the job description and notes for your application'
              }
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          <div className="space-y-6">
            <form id="application-form" onSubmit={handleSubmit}>
              {isAddMode ? (
                // Add mode - all fields are editable
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Application Details
                    </CardTitle>
                    <CardDescription>
                      Enter information about the job you're applying for
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="company_name" className="text-sm font-medium">
                          Company Name <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="company_name"
                            value={formData.company_name}
                            onChange={(e) =>
                              setFormData({ ...formData, company_name: e.target.value })
                            }
                            placeholder="Enter company name"
                            className="pl-9"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="job_title" className="text-sm font-medium">
                          Job Title <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="job_title"
                            value={formData.job_title}
                            onChange={(e) =>
                              setFormData({ ...formData, job_title: e.target.value })
                            }
                            placeholder="Enter job title"
                            className="pl-9"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({ ...formData, location: e.target.value })
                            }
                            placeholder="Enter location"
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="salary_range" className="text-sm font-medium">Salary Range</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="salary_range"
                            value={formData.salary_range}
                            onChange={(e) =>
                              setFormData({ ...formData, salary_range: e.target.value })
                            }
                            placeholder="e.g. $80,000 - $100,000"
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="remote_type" className="text-sm font-medium">Work Type</Label>
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
                        <Label htmlFor="status" className="text-sm font-medium">Application Status</Label>
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
                              <SelectItem key={status} value={status} className="flex items-center">
                                <div className="flex items-center">
                                  <Badge variant="outline" className={`mr-2 h-2 w-2 rounded-full p-0 ${statusColors[status]}`} />
                                  {formatStatus(status)}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="job_link" className="text-sm font-medium">Job Posting URL</Label>
                      <div className="relative">
                        <Link className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="job_link"
                          value={formData.job_link}
                          onChange={(e) =>
                            setFormData({ ...formData, job_link: e.target.value })
                          }
                          placeholder="Enter job posting URL"
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="job_description" className="text-sm font-medium">Job Description</Label>
                      <Textarea
                        id="job_description"
                        value={formData.job_description}
                        onChange={(e) =>
                          setFormData({ ...formData, job_description: e.target.value })
                        }
                        placeholder="Paste the full job description here"
                        className="min-h-[8rem]"
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Edit mode - read-only fields displayed in a clean format
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Company</h3>
                      <p className="text-base font-medium">{formData.company_name}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Job Title</h3>
                      <p className="text-base font-medium">{formData.job_title}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{formData.location || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Work Type</h3>
                      <p className="text-sm capitalize">{formData.remote_type}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                      <Badge 
                        className={`${statusColors[formData.status]} px-2 py-1`}
                      >
                        {formatStatus(formData.status)}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Salary Range</h3>
                      <p className="text-sm">{formData.salary_range || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Job Posting URL</h3>
                      {formData.job_link ? (
                        <a 
                          href={formData.job_link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-primary hover:underline truncate inline-block max-w-full"
                        >
                          {formData.job_link}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {application?.job_link || 'No URL provided'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Job Description Card - only shown in edit mode */}
              {!isAddMode && (
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Job Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      id="job_description"
                      value={formData.job_description}
                      onChange={(e) =>
                        setFormData({ ...formData, job_description: e.target.value })
                      }
                      placeholder="Paste the full job description here"
                      className="min-h-[12rem]"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Notes Card */}
              <Card className="border shadow-sm mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <StickyNote className="h-5 w-5 text-primary" />
                      Personal Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Add any personal notes about this application (interview preparations, follow-ups, etc.)"
                      className="min-h-[6rem]"
                    />
                  </CardContent>
                </Card>
              </form>
                    </div>
        </div>
        
        <div className="border-t p-6 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-background">
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
            form="application-form"
            disabled={isSaving}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isAddMode ? 'Add Application' : 'Update Application'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 