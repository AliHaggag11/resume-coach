'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Plus, Search, Calendar, BriefcaseIcon, Building2, MapPin, PenLine, MessageSquare, Clock, Trash2 } from 'lucide-react';
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
  const title = `${interview.interview_type} Interview at ${application?.company_name || 'Company'}`;
  const description = `Interview for ${application?.job_title || 'Position'}\n` +
    `Type: ${interview.interview_type}\n` +
    `Location: ${interview.location || 'Remote'}\n` +
    `Interviewer(s): ${interview.interviewer_names?.join(', ') || 'TBD'}`;

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
    <div className="container mx-auto p-6 space-y-8">
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

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.keys(statusColors).map(status => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={remoteFilter} onValueChange={setRemoteFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="onsite">Onsite</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'company' | 'title') => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="company">Company Name</SelectItem>
              <SelectItem value="title">Job Title</SelectItem>
            </SelectContent>
          </Select>

          {(statusFilter !== 'all' || remoteFilter !== 'all' || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter('all');
                setRemoteFilter('all');
                setSearchQuery('');
              }}
              className="text-xs"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Upcoming Interviews Card - Always show at top on mobile */}
        <Card className="sm:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Interviews
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowInterviewDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingInterviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming interviews</p>
            ) : (
              <div className="space-y-4">
                {upcomingInterviews.map(interview => {
                  const application = applications.find(app => app.id === interview.job_application_id);
                  const interviewDate = new Date(interview.scheduled_at);
                  return (
                    <div key={interview.id} className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      {/* Date Column */}
                      <div className="flex sm:flex-col items-center gap-2 sm:gap-0 sm:justify-center w-full sm:w-16 h-12 sm:h-16 rounded-lg bg-primary/5 text-primary">
                        <span className="text-sm font-medium">{interviewDate.toLocaleString('en-US', { month: 'short' })}</span>
                        <span className="text-xl sm:text-2xl font-bold">{interviewDate.getDate()}</span>
                      </div>
                      
                      {/* Details Column */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                          <p className="font-medium truncate">{application?.company_name}</p>
                          <Badge variant="outline" className="w-fit shrink-0 text-[10px] sm:text-xs">
                            {interview.interview_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {application?.job_title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            <span>{formatDateTime(interview.scheduled_at)}</span>
                          </div>
                          <span className="hidden sm:inline mx-1">•</span>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>{interview.location || 'Remote'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions Column */}
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0">
                        <div className="relative flex-1 sm:flex-none">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-[10px] sm:text-xs h-7 sm:h-8"
                            onClick={(e) => {
                              e.preventDefault();
                              const calendarUrls = createCalendarEvent(interview, application);
                              
                              // Create dropdown menu for calendar options
                              const menu = document.createElement('div');
                              menu.className = 'absolute left-0 sm:right-0 sm:left-auto top-full mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50';
                              menu.innerHTML = `
                                <div class="py-1" role="menu">
                                  <a href="${calendarUrls.googleUrl}" target="_blank" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Add to Google Calendar</a>
                                  <a href="${calendarUrls.outlookUrl}" target="_blank" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Add to Outlook</a>
                                  <a href="${calendarUrls.iCalUrl}" download="interview.ics" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Download iCal</a>
                                </div>
                              `;
                              
                              // Remove existing menu if any
                              const existingMenu = document.querySelector('.calendar-menu');
                              if (existingMenu) existingMenu.remove();
                              
                              // Add new menu
                              menu.classList.add('calendar-menu');
                              e.currentTarget.parentElement?.appendChild(menu);
                              
                              // Close menu when clicking outside
                              const closeMenu = (e: MouseEvent) => {
                                if (!menu.contains(e.target as Node)) {
                                  menu.remove();
                                  document.removeEventListener('click', closeMenu);
                                }
                              };
                              
                              setTimeout(() => {
                                document.addEventListener('click', closeMenu);
                              }, 0);
                            }}
                          >
                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                            Add to Calendar
                          </Button>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none text-[10px] sm:text-xs h-7 sm:h-8"
                          onClick={() => {
                            if (!application) return;
                            setSelectedInterview(interview);
                            setSelectedJobDetails({
                              company_name: application.company_name,
                              job_title: application.job_title,
                              job_description: application.job_description
                            });
                            setShowMockInterviewDialog(true);
                          }}
                        >
                          <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                          Practice
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none text-[10px] sm:text-xs h-7 sm:h-8"
                          onClick={() => {
                            setSelectedInterview(interview);
                            setSelectedApplication(application || null);
                            setShowInterviewDialog(true);
                          }}
                        >
                          <PenLine className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none text-[10px] sm:text-xs h-7 sm:h-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this interview?')) {
                              deleteInterview(interview.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
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
        {filteredApplications.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            {searchQuery || statusFilter !== 'all' || remoteFilter !== 'all' ? (
              <p>No applications match your filters</p>
            ) : (
              <p>No job applications yet. Add your first one!</p>
            )}
          </div>
        ) : (
          filteredApplications.map(application => {
            const employerLogo = application.job_description.includes('employer_logo:') 
              ? application.job_description.split('employer_logo:')[1]?.split('\n')[0]
              : null;

            return (
              <Card key={application.id} className="group">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-md border bg-muted/30 flex items-center justify-center shrink-0">
                          {employerLogo ? (
                            <img 
                              src={employerLogo}
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
                        <div className="min-w-0 flex-1">
                          <CardTitle className="truncate">
                            {application.company_name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                            <BriefcaseIcon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{application.job_title}</span>
                          </div>
                          {application.location && (
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 shrink-0" />
                              <span className="truncate">{application.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="hidden sm:inline-flex text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this application?')) {
                            deleteApplication(application.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 sm:hidden text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this application?')) {
                            deleteApplication(application.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
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
        interview={selectedInterview}
        onClose={() => {
          setSelectedApplication(null);
          setSelectedInterview(null);
          fetchInterviews();
        }}
      />

      {selectedInterview && selectedJobDetails && (
        <MockInterviewDialog
          open={showMockInterviewDialog}
          onOpenChange={setShowMockInterviewDialog}
          interview={selectedInterview}
          jobDetails={selectedJobDetails}
        />
      )}

      {/* Job Board Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold">Job Board</h2>
        </div>
        
        {/* Saved Jobs Section */}
        {savedJobs.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Saved Jobs</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {savedJobs.map((savedJob) => {
                // Convert saved job back to job listing format
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

                return (
                  <Card key={savedJob.id} className="w-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 rounded-md border bg-muted/30 flex items-center justify-center shrink-0">
                              {job.employer_logo ? (
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
                              <CardTitle className="text-lg sm:text-xl truncate">{savedJob.job_title}</CardTitle>
                              <div className="flex items-center mt-2 text-muted-foreground">
                                <Building2 className="h-4 w-4 mr-2 shrink-0" />
                                <span className="truncate">{savedJob.company_name}</span>
                              </div>
                              <div className="flex items-center mt-1 text-muted-foreground">
                                <MapPin className="h-4 w-4 mr-2 shrink-0" />
                                <span className="truncate">{savedJob.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Badge variant="secondary" className="text-xs sm:text-sm">
                          {savedJob.remote_type}
                        </Badge>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {savedJob.job_description.split('\n\njob_id:')[0]}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="default"
                            className="flex-1"
                            disabled={loadingJobIds.has(savedJob.job_id)}
                            onClick={() => {
                              applyToJob(job);
                              removeSavedJob(savedJob.job_id);
                            }}
                          >
                            {loadingJobIds.has(savedJob.job_id) ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
                            className="flex-1"
                            disabled={loadingJobIds.has(savedJob.job_id)}
                            onClick={() => removeSavedJob(savedJob.job_id)}
                          >
                            {loadingJobIds.has(savedJob.job_id) ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                Removing...
                              </div>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search jobs (e.g. Software Engineer, Product Manager)"
              value={jobSearchQuery}
              onChange={(e) => setJobSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="Location (e.g. New York, Remote)"
              value={jobLocation}
              onChange={(e) => setJobLocation(e.target.value)}
              className="w-full"
            />
          </div>
          <Button 
            onClick={handleJobSearch} 
            disabled={isLoadingJobs}
            className="w-full sm:w-auto"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {isLoadingJobs ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="w-full">
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            jobListings.map((job) => (
              <Card key={job.job_id} className="w-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg sm:text-xl truncate">{job.job_title}</CardTitle>
                      <div className="flex items-center mt-2 text-muted-foreground">
                        <Building2 className="h-4 w-4 mr-2 shrink-0" />
                        <span className="truncate">{job.employer_name}</span>
                      </div>
                      <div className="flex items-center mt-1 text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2 shrink-0" />
                        <span className="truncate">{job.job_location}</span>
                      </div>
                    </div>
                    {job.employer_logo && (
                      <div className="h-12 w-12 rounded-md border bg-muted/30 flex items-center justify-center shrink-0">
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
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs sm:text-sm">
                        {job.job_employment_type}
                      </Badge>
                      {job.job_salary && (
                        <Badge variant="outline" className="text-xs sm:text-sm">
                          {job.job_salary}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {job.job_description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        className="flex-1"
                        disabled={loadingJobIds.has(job.job_id)}
                        onClick={() => {
                          applyToJob(job);
                          removeSavedJob(job.job_id);
                        }}
                      >
                        {loadingJobIds.has(job.job_id) ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
                          className="flex-1"
                          disabled={loadingJobIds.has(job.job_id)}
                          onClick={() => removeSavedJob(job.job_id)}
                        >
                          {loadingJobIds.has(job.job_id) ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              Removing...
                            </div>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="flex-1"
                          disabled={loadingJobIds.has(job.job_id)}
                          onClick={() => saveJobToApplications(job)}
                        >
                          {loadingJobIds.has(job.job_id) ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              Saving...
                            </div>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Save
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More Button */}
        {jobListings.length > 0 && hasMoreJobs && (
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={() => fetchJobs(currentPage + 1, true)}
              disabled={isLoadingMore}
              className="w-full sm:w-auto min-w-[200px]"
            >
              {isLoadingMore ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Loading...
                </div>
              ) : (
                'Load More Jobs'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 