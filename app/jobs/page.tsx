'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/context/AuthContext';
import { Plus, Search, Calendar, BriefcaseIcon, Building2, MapPin, PenLine, MessageSquare, Clock, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import JobApplicationDialog from './components/JobApplicationDialog';
import InterviewDialog from './components/InterviewDialog';
import MockInterviewDialog from './components/MockInterviewDialog';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import ApplicationDetailsDialog from './components/ApplicationDetailsDialog';

interface JobApplication {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  status: string;
  location: string;
  remote_type: string;
  created_at: string;
  updated_at: string;
  job_description: string;
  notes?: string;
}

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

interface JobListing {
  job_id: string;
  employer_name: string;
  job_title: string;
  job_description: string;
  job_location: string;
  job_employment_type: string;
  job_apply_link: string;
  job_posted_at_datetime_utc: string;
  employer_logo?: string;
  job_salary?: string;
}

interface SavedJob {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  location: string;
  remote_type: string;
  created_at: string;
  updated_at: string;
  job_description: string;
  job_id: string;
  job_apply_link: string;
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

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const formatInterviewType = (type: string) => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const createCalendarEvent = (interview: Interview, application?: JobApplication) => {
  // Format date and time for calendar
  const startDate = new Date(interview.scheduled_at);
  const endDate = new Date(startDate.getTime() + interview.duration_minutes * 60000);
  
  // Format dates for calendar URL
  const formatForCalendar = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  // Create calendar event details
  const title = `${formatInterviewType(interview.interview_type)} Interview - ${application?.job_title || 'Position'} at ${application?.company_name || 'Company'}`;
  const description = `Interview Details:
Job Title: ${application?.job_title || 'Position'}
Company: ${application?.company_name || 'Company'}
Type: ${formatInterviewType(interview.interview_type)}
Location: ${interview.location || 'Remote'}
Interviewer(s): ${interview.interviewer_names?.join(', ') || 'TBD'}

Notes:
${interview.notes || 'No additional notes'}

Job Description:
${application?.job_description?.split('\n\njob_id:')[0] || 'No job description available'}`;

  // Create Google Calendar URL
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${formatForCalendar(startDate)}/${formatForCalendar(endDate)}` +
    `&details=${encodeURIComponent(description)}` +
    `&location=${encodeURIComponent(interview.location || 'Remote')}`;

  // Create Outlook Calendar URL
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose` +
    `&rru=addevent` +
    `&subject=${encodeURIComponent(title)}` +
    `&startdt=${startDate.toISOString()}` +
    `&enddt=${endDate.toISOString()}` +
    `&body=${encodeURIComponent(description)}` +
    `&location=${encodeURIComponent(interview.location || 'Remote')}`;

  // Create iCal data
  const iCalData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${formatForCalendar(startDate)}`,
    `DTEND:${formatForCalendar(endDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${interview.location || 'Remote'}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');

  // Create iCal URL
  const iCalUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(iCalData)}`;

  return { googleUrl, outlookUrl, iCalUrl };
};

export default function JobsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [remoteFilter, setRemoteFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'company' | 'title'>('newest');
  const [showNewApplicationDialog, setShowNewApplicationDialog] = useState(false);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showMockInterviewDialog, setShowMockInterviewDialog] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [selectedJobDetails, setSelectedJobDetails] = useState<{
    company_name: string;
    job_title: string;
    job_description: string;
  } | null>(null);
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [jobLocation, setJobLocation] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreJobs, setHasMoreJobs] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loadingJobIds, setLoadingJobIds] = useState<Set<string>>(new Set());
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'interview' | 'application', id: string } | null>(null);
  const [isPracticing, setIsPracticing] = useState<Record<string, boolean>>({});
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [selectedApplicationForDetails, setSelectedApplicationForDetails] = useState<JobApplication | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    fetchApplications();
    fetchSavedJobs();
    fetchInterviews();
  }, [user]);

  useEffect(() => {
    // Update saved job IDs whenever applications change
    const savedIds = new Set(
      applications
        .filter(app => app.status === 'screening')
        .map(app => app.job_description.split('job_id:')[1]?.split('\n')[0])
        .filter(Boolean)
    );
    setSavedJobIds(savedIds);
  }, [applications]);

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

  const fetchSavedJobs = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('saved_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Update saved job IDs
      const savedIds = new Set(
        (data || []).map(job => job.job_id).filter(Boolean)
      );
      setSavedJobIds(savedIds);
      setSavedJobs(data || []);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      toast.error('Failed to load saved jobs');
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

  const deleteApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', applicationId);

      if (error) throw error;
      
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      toast.success('Job application deleted successfully');
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete job application');
    }
  };

  const filteredApplications = applications
    .filter(app => 
      (app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       app.location?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === 'all' || app.status === statusFilter) &&
      (remoteFilter === 'all' || app.remote_type === remoteFilter)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'company':
          return a.company_name.localeCompare(b.company_name);
        case 'title':
          return a.job_title.localeCompare(b.job_title);
        default:
          return 0;
      }
    });

  const upcomingInterviews = interviews
    .filter(interview => new Date(interview.scheduled_at) > new Date())
    .slice(0, 3);

  const deleteInterview = async (interviewId: string) => {
    try {
      const { error } = await supabase
        .from('job_interviews')
        .delete()
        .eq('id', interviewId);

      if (error) throw error;
      
      setInterviews(prev => prev.filter(interview => interview.id !== interviewId));
      toast.success('Interview deleted successfully');
    } catch (error) {
      console.error('Error deleting interview:', error);
      toast.error('Failed to delete interview');
    }
  };

  const fetchJobs = async (page = 1, append = false) => {
    const loadingState = append ? setIsLoadingMore : setIsLoadingJobs;
    loadingState(true);
    try {
      const response = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(jobSearchQuery || 'software engineer')}${jobLocation ? ` in ${jobLocation}` : ''}&page=${page}&num_pages=1`, {
        headers: {
          'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '',
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
      });
      
      const data = await response.json();
      if (data.data) {
        setJobListings(prev => append ? [...prev, ...data.data] : data.data);
        setHasMoreJobs(data.data.length > 0);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load job listings');
    } finally {
      loadingState(false);
    }
  };

  const saveJobToApplications = async (job: JobListing) => {
    try {
      if (!user?.id) {
        toast.error('Please sign in to save jobs');
        return;
      }

      setLoadingJobIds(prev => new Set([...prev, job.job_id]));

      const jobData = {
        user_id: user.id,
        company_name: job.employer_name,
        job_title: job.job_title,
        location: job.job_location || '',
        job_id: job.job_id,
        remote_type: job.job_employment_type || 'Not specified',
        job_description: `${job.job_description}\n\njob_id:${job.job_id}\nemployer_logo:${job.employer_logo || ''}`,
        job_apply_link: job.job_apply_link,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Saving job:', jobData);

      const { data, error } = await supabase
        .from('saved_jobs')
        .insert(jobData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        if (error.code === '42P01') {
          throw new Error('The saved_jobs table does not exist. Please run the setup SQL first.');
        } else if (error.code === '23505') {
          throw new Error('This job has already been saved.');
        } else if (error.code === '23503') {
          throw new Error('User authentication error. Please try signing in again.');
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      }

      // Update local state immediately
      setSavedJobs(prev => [...prev, data]);
      setSavedJobIds(prev => new Set([...prev, job.job_id]));
      toast.success('Job saved for later');
    } catch (error: any) {
      console.error('Error saving job:', error);
      toast.error(`Failed to save job: ${error.message}`);
    } finally {
      setLoadingJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(job.job_id);
        return newSet;
      });
    }
  };

  const removeSavedJob = async (jobId: string) => {
    try {
      setLoadingJobIds(prev => new Set([...prev, jobId]));

      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('job_id', jobId);

      if (error) throw error;
      
      // Update local state immediately
      setSavedJobs(prev => prev.filter(job => job.job_id !== jobId));
      setSavedJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
      toast.success('Job removed from saved jobs');
    } catch (error) {
      console.error('Error removing saved job:', error);
      toast.error('Failed to remove job');
    } finally {
      setLoadingJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleJobSearch = () => {
    setCurrentPage(1);
    setHasMoreJobs(true);
    fetchJobs(1, false);
  };

  const applyToJob = async (job: JobListing) => {
    try {
      if (!user?.id) {
        toast.error('Please sign in to apply for jobs');
        return;
      }

      // First add to applications
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          company_name: job.employer_name,
          job_title: job.job_title,
          location: job.job_location || '',
          status: 'applied',
          remote_type: job.job_employment_type || 'Not specified',
          job_description: `${job.job_description}\n\njob_id:${job.job_id}\nemployer_logo:${job.employer_logo || ''}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      // Then open the application link
      window.open(job.job_apply_link, '_blank');
      
      await fetchApplications();
      toast.success('Job added to your applications');
    } catch (error: any) {
      console.error('Error applying to job:', error);
      toast.error(`Failed to add job to applications: ${error.message || 'Unknown error'}`);
      // Still open the application link even if saving fails
      window.open(job.job_apply_link, '_blank');
    }
  };

  const toggleDescription = (id: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'interview') {
      await deleteInterview(itemToDelete.id);
    } else {
      await deleteApplication(itemToDelete.id);
    }
    setItemToDelete(null);
  };

  const handleAddToCalendar = (interview: Interview) => {
    // Format date and time for calendar
    const startTime = new Date(interview.scheduled_at);
    const endTime = new Date(startTime.getTime() + (interview.duration_minutes * 60000));

    // Create calendar event URL
    const event = {
      title: `${interview.interview_type.replace('_', ' ').charAt(0).toUpperCase() + interview.interview_type.slice(1)} Interview - ${selectedApplication?.job_title || 'Interview'}`,
      description: `Interview Details:\n${interview.notes || ''}\n\nLocation: ${interview.location || 'Remote'}\n\nInterviewers: ${interview.interviewer_names?.join(', ') || 'TBD'}`,
      location: interview.location || 'Remote',
      start: startTime.toISOString(),
      end: endTime.toISOString()
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${startTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}\/${endTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`;

    window.open(googleCalendarUrl, '_blank');
  };

  const handlePractice = async (interview: Interview) => {
    try {
      // Clear any existing interview data first
      setSelectedInterview(null);
      setSelectedJobDetails(null);
      setShowMockInterviewDialog(false);
      
      // Set loading state for this specific interview
      setIsPracticing(prev => ({ ...prev, [interview.id]: true }));

      // Get the application details for this interview
      const application = applications.find(app => app.id === interview.job_application_id);

      if (!application) {
        throw new Error('Could not find application details for this interview');
      }

      // Generate AI preparation content
      const prompt = {
        type: 'interview_preparation',
        format: 'structured',
        context: {
          jobTitle: application.job_title,
          companyName: application.company_name,
          jobDescription: application.job_description.split('\n\njob_id:')[0],
          interviewType: interview.interview_type
        },
        instructions: `Analyze the job description and prepare interview content.
        Return a JSON object with:
        {
          "questions": [5-8 likely interview questions],
          "topics": [4-6 key technical topics to focus on],
          "tips": [3-4 preparation tips]
        }`
      };

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'prepare' }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate interview preparation');
      }

      const data = await response.json();
      const preparation = data.result;

      // Create a fresh interview object with the new preparation
      const updatedInterview = {
        ...interview,
        ai_preparation: preparation
      };

      // Set the new interview data
      setSelectedInterview(updatedInterview);
      setSelectedJobDetails({
        company_name: application.company_name,
        job_title: application.job_title,
        job_description: application.job_description.split('\n\njob_id:')[0]
      });
      
      // Show the dialog after all data is ready
      setShowMockInterviewDialog(true);
    } catch (error) {
      console.error('Error preparing interview:', error);
      toast.error('Failed to prepare interview content');
      // Reset all states on error
      setSelectedInterview(null);
      setSelectedJobDetails(null);
      setShowMockInterviewDialog(false);
    } finally {
      setIsPracticing(prev => ({ ...prev, [interview.id]: false }));
    }
  };

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
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Page Header with gradient background and improved typography */}
      <div className="mb-8 relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-background p-6 sm:p-8 shadow-sm border">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mb-2">Find Your Next Role</h1>
          <p className="text-muted-foreground max-w-xl">Search and apply for jobs, track your applications, and manage interviews all in one place.</p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10">
          <BriefcaseIcon className="h-32 w-32 text-primary" />
        </div>
      </div>

      {/* Improved Collapsible Job Search Section */}
      {!isSearchExpanded ? (
        <Button
          variant="outline"
          className="w-full flex items-center justify-between mb-8 p-6 rounded-lg hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 shadow-sm group"
          onClick={() => setIsSearchExpanded(true)}
        >
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-full mr-3 group-hover:bg-primary/20 transition-colors">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium">Click to search for jobs</span>
          </div>
          <ChevronDown className="h-5 w-5 group-hover:translate-y-0.5 transition-transform" />
        </Button>
      ) : (
        <div className="transition-all duration-300 ease-in-out mb-8">
          <Card className="shadow-sm overflow-hidden border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Search Jobs</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchExpanded(false)}
                  className="h-9 w-9 rounded-full hover:bg-primary/10"
                >
                  <ChevronUp className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <BriefcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Job title, keywords, or company"
                      value={jobSearchQuery}
                      onChange={(e) => setJobSearchQuery(e.target.value)}
                      className="w-full bg-background pl-10 py-6 h-auto"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Location or 'Remote'"
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      className="w-full bg-background pl-10 py-6 h-auto"
                    />
                  </div>
                  <Button 
                    onClick={handleJobSearch} 
                    disabled={isLoadingJobs}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 py-6 px-8"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search Jobs
                  </Button>
                </div>

                {/* Job Listings Grid with enhanced design */}
                {isLoadingJobs ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {Array(4).fill(0).map((_, i) => (
                      <Card key={i} className="w-full border border-muted/40 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start gap-4">
                            <Skeleton className="h-12 w-12 rounded-md" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-20 w-full" />
                            <div className="flex gap-2">
                              <Skeleton className="h-9 w-1/2" />
                              <Skeleton className="h-9 w-1/2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : jobListings.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                      {jobListings.map((job) => {
                        const isExpanded = expandedDescriptions.has(job.job_id);
                        const isSaved = savedJobIds.has(job.job_id);

                        return (
                          <Card 
                            key={job.job_id} 
                            className="w-full border border-muted/40 hover:shadow-md transition-all duration-200 hover:border-primary/20 group relative overflow-hidden"
                          >
                            {isSaved && (
                              <div className="absolute top-0 right-0">
                                <div className="bg-primary/10 text-primary text-xs font-medium py-1 px-3 rounded-bl-md">
                                  Saved
                                </div>
                              </div>
                            )}
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                  <CardTitle className="text-lg sm:text-xl truncate group-hover:text-primary transition-colors">{job.job_title}</CardTitle>
                                  <div className="flex items-center mt-2 text-muted-foreground">
                                    <Building2 className="h-4 w-4 mr-2 shrink-0" />
                                    <span className="truncate font-medium">{job.employer_name}</span>
                                  </div>
                                  <div className="flex items-center mt-1 text-muted-foreground">
                                    <MapPin className="h-4 w-4 mr-2 shrink-0" />
                                    <span className="truncate">{job.job_location}</span>
                                  </div>
                                </div>
                                <div className="h-14 w-14 rounded-md border bg-muted/30 flex items-center justify-center shrink-0 group-hover:border-primary/20 transition-colors">
                                  {job.employer_logo && job.employer_logo.trim() !== "" ? (
                                    <img 
                                      src={job.employer_logo}
                                      alt={`${job.employer_name} logo`}
                                      className="h-10 w-10 object-contain"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.parentElement?.classList.add('fallback');
                                        target.style.display = 'none';
                                        const fallbackIcon = document.createElement('div');
                                        fallbackIcon.innerHTML = '<svg class="h-6 w-6 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="16" x="8" y="4" rx="1"/><path d="M18 8h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-2"/><path d="M4 8h2a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1Z"/></svg>';
                                        target.parentElement?.appendChild(fallbackIcon.firstChild!);
                                      }}
                                    />
                                  ) : (
                                    <Building2 className="h-6 w-6 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="text-xs sm:text-sm px-2.5 py-0.5">
                                  {job.job_employment_type}
                                </Badge>
                                {job.job_salary && (
                                  <Badge variant="outline" className="text-xs sm:text-sm px-2.5 py-0.5 border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
                                    {job.job_salary}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs sm:text-sm px-2.5 py-0.5">
                                  {formatDate(job.job_posted_at_datetime_utc)}
                                </Badge>
                              </div>
                              <div className={`relative ${isExpanded ? '' : 'max-h-24 overflow-hidden'}`}>
                                {!isExpanded && (
                                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent"></div>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  {job.job_description}
                                </p>
                                <Button
                                  variant="ghost"
                                  className="px-0 h-8 text-xs font-medium mt-1 text-primary"
                                  onClick={() => toggleDescription(job.job_id)}
                                >
                                  {isExpanded ? 'Show Less' : 'Show More'}
                                </Button>
                              </div>
                              <div className="flex items-center gap-3 pt-2">
                                <Button
                                  variant="default"
                                  className="flex-1 bg-primary"
                                  disabled={loadingJobIds.has(job.job_id)}
                                  onClick={() => applyToJob(job)}
                                >
                                  {loadingJobIds.has(job.job_id) ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                      Processing...
                                    </div>
                                  ) : (
                                    <>
                                      <BriefcaseIcon className="h-4 w-4 mr-2" />
                                      Apply Now
                                    </>
                                  )}
                                </Button>
                                {savedJobIds.has(job.job_id) ? (
                                  <Button
                                    variant="outline"
                                    className="w-12 p-0 aspect-square"
                                    disabled={loadingJobIds.has(job.job_id)}
                                    onClick={() => removeSavedJob(job.job_id)}
                                  >
                                    {loadingJobIds.has(job.job_id) ? (
                                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    ) : (
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    className="w-12 p-0 aspect-square group/save"
                                    disabled={loadingJobIds.has(job.job_id)}
                                    onClick={() => saveJobToApplications(job)}
                                  >
                                    {loadingJobIds.has(job.job_id) ? (
                                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    ) : (
                                      <Plus className="h-4 w-4 group-hover/save:scale-125 transition-transform" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    {hasMoreJobs && (
                      <div className="flex justify-center mt-8">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => fetchJobs(currentPage + 1, true)}
                          disabled={isLoadingMore}
                          className="w-full sm:w-auto min-w-[200px] border-primary/20 hover:bg-primary/5"
                        >
                          {isLoadingMore ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              Loading more jobs...
                            </div>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-2" />
                              Load More Jobs
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
                    <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-xl font-medium text-muted-foreground mb-2">
                      {jobSearchQuery || jobLocation 
                        ? 'No jobs found matching your search' 
                        : 'Search for jobs to get started'}
                    </p>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {jobSearchQuery || jobLocation 
                        ? 'Try adjusting your search terms or location' 
                        : 'Enter keywords, job title, or company name above to discover opportunities'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Applications and Interviews Management with improved tabs */}
      <Tabs defaultValue="applications" className="w-full space-y-6">
        <div className="flex flex-col space-y-4 sm:space-y-0">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList className="w-full grid grid-cols-3 gap-1 rounded-md bg-muted p-1 text-muted-foreground">
              <TabsTrigger value="applications" className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BriefcaseIcon className="h-4 w-4" />
                Applications
              </TabsTrigger>
              <TabsTrigger value="interviews" className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Calendar className="h-4 w-4" />
                Interviews
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Plus className="h-4 w-4" />
                Saved Jobs
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="interviews" className="space-y-6 mt-2">
          <div className="space-y-6">
            {interviews.length === 0 ? (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No upcoming interviews</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    const applicationsTab = document.querySelector('[value="applications"]') as HTMLButtonElement;
                    applicationsTab?.click();
                  }}
                  className="mt-2"
                >
                  Schedule an interview
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {interviews
                  .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                  .map((interview) => {
                    const application = applications.find(app => app.id === interview.job_application_id);
                    const interviewDate = new Date(interview.scheduled_at);
                    const isPast = interviewDate < new Date();
                    
                    return (
                      <div key={interview.id} className={cn(
                        "group relative flex flex-col gap-4 p-5 rounded-lg border bg-card hover:shadow-md transition-all duration-200",
                        isPast ? "border-muted bg-muted/10" : "border-primary/20 hover:border-primary/30"
                      )}>
                        {/* Status indicator */}
                        <div className={cn(
                          "absolute top-0 right-0 h-1.5 w-24 rounded-bl-lg",
                          isPast ? "bg-muted" : "bg-gradient-to-r from-primary/50 to-primary/70"
                        )} />

                        <div className="flex items-start gap-4">
                          {/* Enhanced Date Display */}
                          <div className={cn(
                            "flex flex-col items-center justify-center w-16 h-16 rounded-lg text-primary font-medium overflow-hidden",
                            isPast ? "bg-muted/20 text-muted-foreground" : "bg-primary/10"
                          )}>
                            <span className="text-xs uppercase tracking-wider">{interviewDate.toLocaleString('en-US', { month: 'short' })}</span>
                            <span className="text-2xl font-bold leading-none mt-1">{interviewDate.getDate()}</span>
                            <span className="text-xs mt-1 px-2 py-0.5 rounded-sm bg-primary/10">{interviewDate.toLocaleString('en-US', { weekday: 'short' })}</span>
                          </div>
                      
                          {/* Interview Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <div className="h-14 w-14 rounded-md border bg-muted/30 flex items-center justify-center shrink-0 group-hover:border-primary/20 transition-colors">
                                {application?.job_description?.includes('employer_logo:') && 
                                 application.job_description.split('employer_logo:')[1]?.split('\n')[0]?.trim() !== "" ? (
                                  <img 
                                    src={application.job_description.split('employer_logo:')[1]?.split('\n')[0]}
                                    alt={`${application.company_name} logo`}
                                    className="h-10 w-10 object-contain"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.parentElement?.classList.add('fallback');
                                      target.style.display = 'none';
                                      const fallbackIcon = document.createElement('div');
                                      fallbackIcon.innerHTML = '<svg class="h-6 w-6 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="16" x="8" y="4" rx="1"/><path d="M18 8h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-2"/><path d="M4 8h2a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1Z"/></svg>';
                                      target.parentElement?.appendChild(fallbackIcon.firstChild!);
                                    }}
                                  />
                                ) : (
                                  <Building2 className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-lg leading-tight truncate group-hover:text-primary transition-colors">
                                  {application?.company_name || 'Company'}
                                </h3>
                                <Badge variant="outline" className={cn(
                                  "mt-1 mb-1.5 capitalize",
                                  isPast ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary border-primary/20"
                                )}>
                                  {interview.interview_type.replace(/_/g, ' ')}
                                </Badge>
                                <p className="text-sm text-muted-foreground truncate">
                                  {application?.job_title || 'Position'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Time and Location */}
                        <div className="flex flex-col gap-2 p-3 rounded-md bg-muted/20 border border-muted/30">
                          <div className="flex items-center gap-2">
                            <div className="bg-background w-7 h-7 rounded-full flex items-center justify-center">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-sm font-medium">
                              {interviewDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                              {interview.duration_minutes && (
                                <span className="text-muted-foreground ml-1">
                                  ({interview.duration_minutes} min)
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-background w-7 h-7 rounded-full flex items-center justify-center">
                              <MapPin className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-sm truncate">{interview.location || application?.location || 'Location not specified'}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t">
                          <Button
                            variant={isPast ? "outline" : "default"}
                            size="sm"
                            className={cn(
                              "flex-1 h-9",
                              !isPast && "bg-primary hover:bg-primary/90"
                            )}
                            onClick={(e) => {
                              const button = e.currentTarget;
                              const rect = button.getBoundingClientRect();
                              const dropdown = document.createElement('div');
                              dropdown.className = 'absolute z-50 w-48 py-1 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700';
                              dropdown.style.top = `${rect.bottom}px`;
                              dropdown.style.left = `${rect.left}px`;
                              
                              const calendarUrls = createCalendarEvent(interview, applications.find(app => app.id === interview.job_application_id));
                              
                              dropdown.innerHTML = `
                                <a href="${calendarUrls.googleUrl}" target="_blank" rel="noopener noreferrer" 
                                   class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                  Google Calendar
                                </a>
                                <a href="${calendarUrls.outlookUrl}" target="_blank" rel="noopener noreferrer"
                                   class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                  Outlook Calendar
                                </a>
                                <a href="${calendarUrls.iCalUrl}" download="interview.ics"
                                   class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                  Download ICS File
                                </a>
                              `;
                              
                              document.body.appendChild(dropdown);
                              
                              const closeDropdown = () => {
                                document.body.removeChild(dropdown);
                                document.removeEventListener('click', closeDropdown);
                              };
                              
                              setTimeout(() => {
                                document.addEventListener('click', closeDropdown);
                              }, 0);
                            }}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Add to Calendar
                          </Button>
                        
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn("flex-1 h-9", !isPast && "hover:bg-primary/5 hover:border-primary/20")}
                            disabled={isPracticing[interview.id] || isPast}
                            onClick={() => handlePractice(interview)}
                          >
                            {isPracticing[interview.id] ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                <span>Preparing...</span>
                              </div>
                            ) : (
                              <>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Practice
                              </>
                            )}
                          </Button>
                          
                          <div className="flex gap-2 w-full mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 h-9 hover:bg-primary/5"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInterview(interview);
                                setSelectedApplication(application || null);
                                setShowInterviewDialog(true);
                              }}
                            >
                              <PenLine className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setItemToDelete({ type: 'interview', id: interview.id });
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Past interview indicator */}
                        {isPast && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[1px] rounded-lg pointer-events-none">
                            <Badge variant="outline" className="bg-muted text-muted-foreground px-3 py-1 text-sm border-muted/30">
                              Past Interview
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6 mt-2">
          <div className="space-y-6">
            {/* Applications Header with improved design */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/5 to-background p-4 rounded-lg border border-primary/10 shadow-sm">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-[300px] bg-background border-primary/20 focus-visible:ring-primary/20"
                  />
                </div>
                <Button 
                  onClick={() => {
                    // Reset selectedApplication to ensure a fresh dialog
                    setSelectedApplication(null);
                    setShowNewApplicationDialog(true);
                  }} 
                  className="bg-primary hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Job
                </Button>
              </div>
            </div>

            {/* Improved Filters Row */}
            <div className="flex flex-wrap gap-3 p-4 rounded-lg bg-muted/30 border shadow-sm">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-1.5 text-muted-foreground block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full bg-background border-muted">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.keys(statusColors).map(status => (
                      <SelectItem key={status} value={status} className="capitalize">
                        {status.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-1.5 text-muted-foreground block">Job Type</label>
                <Select value={remoteFilter} onValueChange={setRemoteFilter}>
                  <SelectTrigger className="w-full bg-background border-muted">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-1.5 text-muted-foreground block">Sort By</label>
                <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'company' | 'title') => setSortBy(value)}>
                  <SelectTrigger className="w-full bg-background border-muted">
                    <SelectValue placeholder="Select sorting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="company">Company Name</SelectItem>
                    <SelectItem value="title">Job Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(statusFilter !== 'all' || remoteFilter !== 'all' || searchQuery) && (
                <div className="flex items-end w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatusFilter('all');
                      setRemoteFilter('all');
                      setSearchQuery('');
                    }}
                    className="w-full sm:w-auto h-10 mt-auto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M19 12H5M5 12l7 7M5 12l7-7" />
                    </svg>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Applications Grid Display with Improved Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
              {filteredApplications.length === 0 ? (
                <div className="col-span-full text-center py-10 bg-muted/30 rounded-lg border border-dashed">
                  <BriefcaseIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium text-muted-foreground mb-1">No applications found</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {statusFilter !== 'all' || remoteFilter !== 'all' || searchQuery ? 
                      'Try adjusting your filters' : 
                      'Start by adding your first job application'}
                  </p>
                  <Button 
                    onClick={() => {
                      // Reset selectedApplication to ensure a fresh dialog
                      setSelectedApplication(null);
                      setShowNewApplicationDialog(true);
                    }} 
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Job Application
                  </Button>
                </div>
              ) : (
                filteredApplications.map((application) => {
                  const statusClass = statusColors[application.status as keyof typeof statusColors] || 'bg-gray-500/10 text-gray-500';
                  const hasInterviews = interviews.some(interview => interview.job_application_id === application.id);
                  
                  return (
                    <div
                      key={application.id}
                      className="group rounded-lg border border-muted/40 hover:border-primary/20 bg-card shadow-sm hover:shadow-md transition-all p-5 relative overflow-hidden cursor-pointer"
                      onClick={() => setSelectedApplicationForDetails(application)}
                    >
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary/50 to-primary/20"></div>
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-md border flex items-center justify-center shrink-0 bg-muted/30 group-hover:border-primary/20 transition-colors">
                          {application.job_description?.includes('employer_logo:') && 
                           application.job_description.split('employer_logo:')[1]?.split('\n')[0]?.trim() !== "" ? (
                            <img 
                              src={application.job_description.split('employer_logo:')[1]?.split('\n')[0]}
                              alt={`${application.company_name} logo`}
                              className="h-12 w-12 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.parentElement?.classList.add('fallback');
                                target.style.display = 'none';
                                const fallbackIcon = document.createElement('div');
                                fallbackIcon.innerHTML = '<svg class="h-8 w-8 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="16" x="8" y="4" rx="1"/><path d="M18 8h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-2"/><path d="M4 8h2a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1Z"/></svg>';
                                target.parentElement?.appendChild(fallbackIcon.firstChild!);
                              }}
                            />
                          ) : (
                            <Building2 className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg leading-tight truncate group-hover:text-primary transition-colors">
                            {application.job_title}
                          </h3>
                          <p className="text-muted-foreground mt-1 mb-2 truncate">
                            {application.company_name}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge className={`${statusClass} capitalize`}>
                              {application.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline">
                              {application.remote_type || 'Unspecified'}
                            </Badge>
                            {hasInterviews && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900">
                                <Calendar className="h-3 w-3 mr-1" />
                                Interview
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate flex-1">{application.location || 'Location not specified'}</span>
                        <span className="text-xs whitespace-nowrap">
                          {formatDate(application.created_at)}
                        </span>
                      </div>
                      <div className="flex mt-4 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApplication(application);
                            setSelectedInterview(null);
                            setShowInterviewDialog(true);
                          }}
                        >
                          <Calendar className="h-3.5 w-3.5 mr-1.5" />
                          Add Interview
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 ml-2 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApplication(application);
                            setShowNewApplicationDialog(true);
                          }}
                        >
                          <PenLine className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 ml-1 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setItemToDelete({ type: 'application', id: application.id });
                            setDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6 mt-2">
          <div className="space-y-6">
            {savedJobs.length === 0 ? (
              <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
                <div className="bg-primary/5 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <p className="text-xl font-medium text-muted-foreground mb-2">No saved jobs yet</p>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">Save jobs you're interested in to apply later or keep track of opportunities</p>
                <Button 
                  variant="default" 
                  onClick={() => {
                    setIsSearchExpanded(true);
                    const searchTab = document.querySelector('[value="search"]') as HTMLButtonElement;
                    searchTab?.click();
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search for Jobs
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {savedJobs.map((savedJob) => {
                  const job: JobListing = {
                    job_id: savedJob.job_id,
                    employer_name: savedJob.company_name,
                    job_title: savedJob.job_title,
                    job_description: savedJob.job_description.split('\n\njob_id:')[0],
                    job_location: savedJob.location,
                    job_employment_type: savedJob.remote_type,
                    job_apply_link: savedJob.job_apply_link,
                    job_posted_at_datetime_utc: savedJob.created_at,
                    employer_logo: savedJob.job_description.includes('employer_logo:') 
                      ? savedJob.job_description.split('employer_logo:')[1]?.split('\n')[0]
                      : undefined
                  };
                  const isExpanded = expandedDescriptions.has(savedJob.id);
                  const savedDate = new Date(savedJob.created_at);
                  const daysSinceCreated = Math.floor((new Date().getTime() - savedDate.getTime()) / (1000 * 3600 * 24));

                  return (
                    <div 
                      key={savedJob.id} 
                      className="group relative flex flex-col rounded-lg border border-muted/40 hover:border-primary/20 bg-card shadow-sm hover:shadow-md transition-all duration-200 p-5 overflow-hidden"
                    >
                      {/* Age indicator */}
                      {daysSinceCreated <= 3 && (
                        <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-bl-md dark:bg-green-900 dark:text-green-300">
                          New
                        </div>
                      )}
                      
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-md border flex items-center justify-center shrink-0 bg-muted/30 group-hover:border-primary/20 transition-colors">
                          {job.employer_logo && job.employer_logo.trim() !== "" ? (
                            <img 
                              src={job.employer_logo}
                              alt={`${job.employer_name} logo`}
                              className="h-10 w-10 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.parentElement?.classList.add('fallback');
                                target.style.display = 'none';
                                const fallbackIcon = document.createElement('div');
                                fallbackIcon.innerHTML = '<svg class="h-6 w-6 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="16" x="8" y="4" rx="1"/><path d="M18 8h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-2"/><path d="M4 8h2a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1Z"/></svg>';
                                target.parentElement?.appendChild(fallbackIcon.firstChild!);
                              }}
                            />
                          ) : (
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-lg leading-tight truncate group-hover:text-primary transition-colors">
                            {savedJob.job_title}
                          </h3>
                          <p className="text-muted-foreground mt-1 truncate">
                            {savedJob.company_name}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{savedJob.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <Badge variant="secondary" className="text-xs capitalize px-2.5 py-0.5 bg-primary/5 text-primary border-none">
                          {savedJob.remote_type || 'Unspecified'}
                        </Badge>
                        <Badge variant="outline" className="text-xs px-2.5 py-0.5">
                          Saved {daysSinceCreated === 0 ? 'today' : daysSinceCreated === 1 ? 'yesterday' : `${daysSinceCreated} days ago`}
                        </Badge>
                      </div>

                      <div className={`mt-4 relative ${isExpanded ? '' : 'max-h-24 overflow-hidden'}`}>
                        {!isExpanded && (
                          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent"></div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {savedJob.job_description.split('\n\njob_id:')[0]}
                        </p>
                        <Button
                          variant="ghost"
                          className="px-0 h-8 text-xs font-medium mt-1 text-primary"
                          onClick={() => toggleDescription(savedJob.id)}
                        >
                          {isExpanded ? 'Show Less' : 'Show More'}
                        </Button>
                      </div>

                      <div className="flex mt-auto pt-4 border-t mt-4 gap-3">
                        <Button
                          variant="default"
                          className="flex-1 bg-primary hover:bg-primary/90"
                          disabled={loadingJobIds.has(savedJob.job_id)}
                          onClick={() => {
                            applyToJob(job);
                            removeSavedJob(savedJob.job_id);
                          }}
                        >
                          {loadingJobIds.has(savedJob.job_id) ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                              Processing...
                            </div>
                          ) : (
                            <>
                              <BriefcaseIcon className="h-4 w-4 mr-2" />
                              Apply Now
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-9 p-0 aspect-square text-destructive hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30"
                          onClick={() => removeSavedJob(savedJob.job_id)}
                          disabled={loadingJobIds.has(savedJob.job_id)}
                        >
                          {loadingJobIds.has(savedJob.job_id) ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog components */}
      {showNewApplicationDialog && (
        <JobApplicationDialog
          open={showNewApplicationDialog}
          onOpenChange={setShowNewApplicationDialog}
          application={selectedApplication}
          onClose={() => {
            setSelectedApplication(null);
            fetchApplications();
          }}
        />
      )}

      {showInterviewDialog && selectedApplication && (
        <InterviewDialog
          open={showInterviewDialog}
          onOpenChange={setShowInterviewDialog}
          applicationId={selectedApplication.id}
          interview={selectedInterview}
          onClose={() => {
            setSelectedApplication(null);
            setSelectedInterview(null);
            fetchInterviews();
          }}
        />
      )}

      {showMockInterviewDialog && selectedInterview && selectedJobDetails && (
        <MockInterviewDialog
          open={showMockInterviewDialog}
          onOpenChange={setShowMockInterviewDialog}
          interview={selectedInterview}
          jobDetails={selectedJobDetails}
        />
      )}

      {selectedApplicationForDetails && (
        <ApplicationDetailsDialog
          open={!!selectedApplicationForDetails}
          onOpenChange={() => setSelectedApplicationForDetails(null)}
          application={selectedApplicationForDetails}
          onEdit={() => {
            setSelectedApplication(selectedApplicationForDetails);
            setShowNewApplicationDialog(true);
            setSelectedApplicationForDetails(null);
          }}
          onAddInterview={() => {
            setSelectedApplication(selectedApplicationForDetails);
            setSelectedInterview(null);
            setShowInterviewDialog(true);
            setSelectedApplicationForDetails(null);
          }}
          onDelete={() => {
            setItemToDelete({ type: 'application', id: selectedApplicationForDetails.id });
            setDeleteConfirmOpen(true);
            setSelectedApplicationForDetails(null);
          }}
        />
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 