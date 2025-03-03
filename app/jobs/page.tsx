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

interface JobApplication {
  id: string;
  company_name: string;
  job_title: string;
  status: string;
  location: string;
  remote_type: string;
  created_at: string;
  updated_at: string;
  job_description: string;
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
    </div>
  );
} 