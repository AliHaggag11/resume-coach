'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Plus, Search, Calendar, BriefcaseIcon, Building2, MapPin, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import JobApplicationDialog from './components/JobApplicationDialog';
import InterviewDialog from './components/InterviewDialog';
import { toast } from 'sonner';

interface JobApplication {
  id: string;
  company_name: string;
  job_title: string;
  status: string;
  location: string;
  remote_type: string;
  created_at: string;
  updated_at: string;
}

interface Interview {
  id: string;
  job_application_id: string;
  interview_type: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string;
  interviewer_names: string[];
}

const statusColors = {
  applied: 'bg-blue-500/10 text-blue-500',
  screening: 'bg-purple-500/10 text-purple-500',
  interview_scheduled: 'bg-yellow-500/10 text-yellow-500',
  interviewed: 'bg-orange-500/10 text-orange-500',
  offer_received: 'bg-green-500/10 text-green-500',
  offer_accepted: 'bg-emerald-500/10 text-emerald-500',
  offer_declined: 'bg-gray-500/10 text-gray-500',
  rejected: 'bg-red-500/10 text-red-500',
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function JobsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewApplicationDialog, setShowNewApplicationDialog] = useState(false);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchApplications();
    fetchInterviews();
  }, [user]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load job applications');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInterviews = async () => {
    try {
      const { data, error } = await supabase
        .from('job_interviews')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setInterviews(data || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error('Failed to load interviews');
    }
  };

  const filteredApplications = applications.filter(app => 
    app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.job_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingInterviews = interviews
    .filter(interview => new Date(interview.scheduled_at) > new Date())
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Job Applications</h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-[240px]"
              />
            </div>
            <Button onClick={() => setShowNewApplicationDialog(true)} className="shrink-0">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Job</span>
            </Button>
          </div>
        </div>

        {/* Upcoming Interviews Card - Always show at top on mobile */}
        <Card className="sm:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingInterviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming interviews</p>
            ) : (
              <div className="space-y-3">
                {upcomingInterviews.map(interview => {
                  const application = applications.find(app => app.id === interview.job_application_id);
                  return (
                    <div key={interview.id} className="flex items-start gap-3">
                      <div className="size-2 rounded-full bg-blue-500 mt-2" />
                      <div>
                        <p className="font-medium">{application?.company_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(interview.scheduled_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Applications Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredApplications.map(application => (
          <Card key={application.id} className="group">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="flex items-center gap-2 truncate">
                    <Building2 className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{application.company_name}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BriefcaseIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{application.job_title}</span>
                  </div>
                  {application.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{application.location}</span>
                    </div>
                  )}
                </div>
                <Badge variant="secondary" className={`shrink-0 ${statusColors[application.status as keyof typeof statusColors]}`}>
                  {application.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Applied {formatDate(application.created_at)}
                </div>
                <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:inline-flex"
                    onClick={() => {
                      setSelectedApplication(application);
                      setShowInterviewDialog(true);
                    }}
                  >
                    Add Interview
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:hidden"
                    onClick={() => {
                      setSelectedApplication(application);
                      setShowInterviewDialog(true);
                    }}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:inline-flex"
                    onClick={() => {
                      setSelectedApplication(application);
                      setShowNewApplicationDialog(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:hidden"
                    onClick={() => {
                      setSelectedApplication(application);
                      setShowNewApplicationDialog(true);
                    }}
                  >
                    <PenLine className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <JobApplicationDialog
        open={showNewApplicationDialog}
        onOpenChange={setShowNewApplicationDialog}
        application={selectedApplication}
        onClose={() => {
          setSelectedApplication(null);
          fetchApplications();
        }}
      />

      <InterviewDialog
        open={showInterviewDialog}
        onOpenChange={setShowInterviewDialog}
        applicationId={selectedApplication?.id}
        onClose={() => {
          setSelectedApplication(null);
          fetchInterviews();
        }}
      />
    </div>
  );
} 