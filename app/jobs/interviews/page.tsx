'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Plus, Search, BriefcaseIcon, Building2, MapPin, PenLine, Clock, Trash2, Loader2, Calendar, MoreVertical, Video, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import InterviewDialog from '../components/InterviewDialog';
import MockInterviewDialog from '../components/MockInterviewDialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PrepGuideDialog from '../components/PrepGuideDialog';

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

const formatDateTime = (date: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(date).toLocaleString(undefined, options);
};

const formatInterviewType = (type: string) => {
  switch (type.toLowerCase()) {
    case 'technical':
      return 'Technical Interview';
    case 'behavioral':
      return 'Behavioral Interview';
    case 'phone_screen':
      return 'Phone Screen';
    case 'onsite':
      return 'On-site Interview';
    case 'final_round':
      return 'Final Round';
    default:
      return type;
  }
};

const createCalendarEvent = (interview: Interview, application?: JobApplication) => {
  if (!application) return null;
  
  const startDate = new Date(interview.scheduled_at);
  const endDate = new Date(startDate.getTime() + interview.duration_minutes * 60000);
  
  const formatForCalendar = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };
  
  const title = `Interview with ${application.company_name} - ${formatInterviewType(interview.interview_type)}`;
  const description = `Interview for ${application.job_title} position at ${application.company_name}.\n\n${interview.notes || ''}`;
  const location = interview.location;
  
  // Google Calendar URL
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatForCalendar(startDate)}/${formatForCalendar(endDate)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
  
  // Outlook Calendar URL
  const outlookUrl = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
  
  // iCal File Content
  const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatForCalendar(startDate)}
DTEND:${formatForCalendar(endDate)}
SUMMARY:${title}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;
  
  const blob = new Blob([icalContent], { type: 'text/calendar' });
  const iCalUrl = URL.createObjectURL(blob);
  
  return { googleUrl, outlookUrl, iCalUrl };
};

export default function InterviewsPage() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);
  const [isMockInterviewDialogOpen, setIsMockInterviewDialogOpen] = useState(false);
  const [currentInterview, setCurrentInterview] = useState<Interview | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState<string | null>(null);
  const [isDeletingInterview, setIsDeletingInterview] = useState(false);
  
  const [isAddCalendarDialogOpen, setIsAddCalendarDialogOpen] = useState(false);
  const [calendarUrls, setCalendarUrls] = useState<{ googleUrl: string; outlookUrl: string; iCalUrl: string } | null>(null);

  const [isPrepGuideDialogOpen, setIsPrepGuideDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchApplications();
      fetchInterviews();
    }
  }, [user]);

  const fetchApplications = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    }
  };

  const fetchInterviews = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      console.log("Fetching interviews for user:", user.id);
      
      // First, get all application IDs for this user
      const { data: appData, error: appError } = await supabase
        .from('job_applications')
        .select('id')
        .eq('user_id', user.id);
        
      if (appError) {
        console.error("Error fetching applications:", appError);
        throw appError;
      }
      
      // Check if there are any applications
      if (!appData || appData.length === 0) {
        console.log("User has no applications");
        setInterviews([]);
        setIsLoading(false);
        return;
      }
      
      // Get the IDs of all applications
      const applicationIds = appData.map(app => app.id);
      console.log("Found application IDs:", applicationIds);
      
      // Now check if we should use 'interviews' or 'job_interviews' table
      // Let's try 'interviews' first, and if that fails, try 'job_interviews'
      let interviewsData;
      let interviewsError;
      
      try {
        // Try with 'interviews' table first
        const response = await supabase
          .from('interviews')
          .select('*')
          .in('job_application_id', applicationIds)
          .order('scheduled_at', { ascending: true });
          
        interviewsData = response.data;
        interviewsError = response.error;
      } catch (err) {
        console.error("Error with 'interviews' table:", err);
        // First attempt failed, do nothing here, we'll try the other table name
      }
      
      // If first attempt failed, try 'job_interviews'
      if (interviewsError || !interviewsData) {
        console.log("Trying alternate table name 'job_interviews'");
        const response = await supabase
          .from('job_interviews')
          .select('*')
          .in('job_application_id', applicationIds)
          .order('scheduled_at', { ascending: true });
          
        interviewsData = response.data;
        interviewsError = response.error;
      }
      
      // Check for errors after both attempts
      if (interviewsError) {
        console.error("Error fetching interviews:", interviewsError);
        throw interviewsError;
      }
      
      console.log("Got interviews:", interviewsData?.length || 0);
      setInterviews(interviewsData || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      } else {
        console.error('Unknown error type:', typeof error);
        console.error('Error stringified:', JSON.stringify(error));
      }
      
      toast.error('Failed to load interviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddInterview = () => {
    setCurrentInterview(null);
    setIsInterviewDialogOpen(true);
  };

  const handleEditInterview = (interview: Interview) => {
    setCurrentInterview(interview);
    setIsInterviewDialogOpen(true);
  };

  const handleDeleteInterview = (interviewId: string) => {
    setInterviewToDelete(interviewId);
    setIsDeleteDialogOpen(true);
  };

  const deleteInterview = async (interviewId: string) => {
    if (!user?.id) return;
    
    setIsDeletingInterview(true);
    try {
      console.log("Attempting to delete interview:", interviewId);
      
      // Delete from the job_interviews table (correct table name)
      const { error } = await supabase
        .from('job_interviews')
        .delete()
        .eq('id', interviewId);
      
      if (error) {
        console.error("Error deleting from 'job_interviews' table:", error);
        throw error;
      }
      
      console.log("Successfully deleted from 'job_interviews' table");
      setInterviews(interviews.filter(interview => interview.id !== interviewId));
      toast.success('Interview deleted successfully');
    } catch (error: any) {
      console.error('Error deleting interview:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      } else {
        console.error('Unknown error type:', typeof error);
        console.error('Error stringified:', JSON.stringify(error));
      }
      
      toast.error('Failed to delete interview');
    } finally {
      setIsDeletingInterview(false);
      setIsDeleteDialogOpen(false);
      setInterviewToDelete(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (interviewToDelete) {
      await deleteInterview(interviewToDelete);
    }
  };

  const handleAddToCalendar = (interview: Interview) => {
    const application = applications.find(app => app.id === interview.job_application_id);
    const urls = createCalendarEvent(interview, application);
    setCalendarUrls(urls);
    setIsAddCalendarDialogOpen(true);
  };

  const handlePractice = async (interview: Interview) => {
    // Simply open the interview dialog with the selected interview
    setCurrentInterview(interview);
    setIsMockInterviewDialogOpen(true);
  };

  const handleGenerateGuide = (interview: Interview) => {
    setCurrentInterview(interview);
    setIsPrepGuideDialogOpen(true);
  };

  const getApplicationDetails = (applicationId: string) => {
    return applications.find(app => app.id === applicationId);
  };

  const filteredInterviews = interviews.filter(interview => {
    const application = getApplicationDetails(interview.job_application_id);
    if (!application) return false;
    
    return (
      application.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.interview_type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const isInterviewSoon = (date: string) => {
    const interviewDate = new Date(date);
    const now = new Date();
    const diffInDays = (interviewDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diffInDays <= 2 && diffInDays >= 0;
  };

  const isInterviewPast = (date: string) => {
    const interviewDate = new Date(date);
    const now = new Date();
    return interviewDate < now;
  };

  const getInterviewStatusBadge = (date: string) => {
    if (isInterviewPast(date)) {
      return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">Past</Badge>;
    } else if (isInterviewSoon(date)) {
      return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Upcoming Soon</Badge>;
    } else {
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Scheduled</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Interviews</h1>
        <Button onClick={handleAddInterview} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Interview
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search interviews..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interviews List */}
      <div className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-14 w-14 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredInterviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No interviews found. Start by adding your first interview for a job application.</p>
            </CardContent>
          </Card>
        ) : (
          filteredInterviews.map((interview) => {
            const application = getApplicationDetails(interview.job_application_id);
            if (!application) return null;
            
            return (
              <Card key={interview.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 rounded-md border bg-muted/30 items-center justify-center shrink-0 self-start">
                        {application?.job_description?.includes('employer_logo:') && 
                         application.job_description.split('employer_logo:')[1]?.split('\n')[0]?.trim() !== "" ? (
                          <img 
                            src={application.job_description.split('employer_logo:')[1]?.split('\n')[0]}
                            alt={`${application.company_name} logo`}
                            className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
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
                          <BriefcaseIcon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium leading-tight line-clamp-2 pr-2">
                            {formatInterviewType(interview.interview_type)} - {application.job_title}
                          </h3>
                          <div className="flex sm:hidden">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-background border shadow-md">
                                <DropdownMenuItem onClick={() => handleEditInterview(interview)}>
                                  <PenLine className="h-4 w-4 mr-2" />
                                  Edit interview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAddToCalendar(interview)}>
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Add to calendar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteInterview(interview.id)}
                                  className="text-red-500 focus:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Building2 className="h-3.5 w-3.5 mr-1 shrink-0" />
                          <span className="truncate">{application.company_name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1 shrink-0" />
                          <span className="truncate">{formatDateTime(interview.scheduled_at)} ({interview.duration_minutes} minutes)</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {getInterviewStatusBadge(interview.scheduled_at)}
                          {interview.interview_type.toLowerCase() === 'technical' && (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                              Technical
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2 sm:mt-0 justify-end sm:justify-start">
                        {(interview.interview_type.toLowerCase() === 'technical' || 
                          interview.interview_type.toLowerCase() === 'behavioral') && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1.5 bg-primary/5 hover:bg-primary/10 border-primary/10 text-primary flex-grow sm:flex-grow-0"
                            onClick={() => handlePractice(interview)}
                          >
                            <Video className="h-3.5 w-3.5" />
                            <span className="sm:inline">Practice</span>
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1.5 bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/10 text-blue-500 flex-grow sm:flex-grow-0"
                          onClick={() => handleGenerateGuide(interview)}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span className="sm:inline">Prep Guide</span>
                        </Button>
                        <div className="hidden sm:block">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background border shadow-md">
                              <DropdownMenuItem onClick={() => handleEditInterview(interview)}>
                                <PenLine className="h-4 w-4 mr-2" />
                                Edit interview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddToCalendar(interview)}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Add to calendar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteInterview(interview.id)}
                                className="text-red-500 focus:text-red-500"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                    {interview.notes && (
                      <div className="mt-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                        <h4 className="font-medium text-foreground mb-1">Notes</h4>
                        <p className="whitespace-pre-wrap">{interview.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialogs */}
      <InterviewDialog
        open={isInterviewDialogOpen}
        onOpenChange={setIsInterviewDialogOpen}
        applicationId={currentInterview?.job_application_id}
        interview={currentInterview}
        onClose={() => {
          fetchInterviews();
          fetchApplications();
        }}
      />

      <MockInterviewDialog 
        open={isMockInterviewDialogOpen} 
        onOpenChange={setIsMockInterviewDialogOpen}
        interview={currentInterview ? {
          id: currentInterview.id,
          job_application_id: currentInterview.job_application_id,
          interview_type: currentInterview.interview_type,
          interviewer_names: currentInterview.interviewer_names || []
        } : {
          id: '',
          job_application_id: '',
          interview_type: ''
        }}
        jobDetails={{
          company_name: currentInterview && getApplicationDetails(currentInterview.job_application_id) 
            ? getApplicationDetails(currentInterview.job_application_id)!.company_name 
            : '',
          job_title: currentInterview && getApplicationDetails(currentInterview.job_application_id)
            ? getApplicationDetails(currentInterview.job_application_id)!.job_title
            : '',
          job_description: currentInterview && getApplicationDetails(currentInterview.job_application_id)
            ? getApplicationDetails(currentInterview.job_application_id)!.job_description
            : ''
        }}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this interview?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this interview. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingInterview}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeletingInterview}
            >
              {isDeletingInterview ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={isAddCalendarDialogOpen} onOpenChange={setIsAddCalendarDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add to Calendar</AlertDialogTitle>
            <AlertDialogDescription>
              Choose your preferred calendar service to add this interview.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => {
                if (calendarUrls?.googleUrl) {
                  window.open(calendarUrls.googleUrl, '_blank');
                  setIsAddCalendarDialogOpen(false);
                }
              }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 16.5H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M6 12.5H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 8.5H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 4.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M7 8.5H6C5.44772 8.5 5 8.94772 5 9.5V19.5C5 20.0523 5.44772 20.5 6 20.5H18C18.5523 20.5 19 20.0523 19 19.5V9.5C19 8.94772 18.5523 8.5 18 8.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Google Calendar
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => {
                if (calendarUrls?.outlookUrl) {
                  window.open(calendarUrls.outlookUrl, '_blank');
                  setIsAddCalendarDialogOpen(false);
                }
              }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 5.5H5C4.44772 5.5 4 5.94772 4 6.5V18.5C4 19.0523 4.44772 19.5 5 19.5H19C19.5523 19.5 20 19.0523 20 18.5V6.5C20 5.94772 19.5523 5.5 19 5.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 15.5C13.6569 15.5 15 14.1569 15 12.5C15 10.8431 13.6569 9.5 12 9.5C10.3431 9.5 9 10.8431 9 12.5C9 14.1569 10.3431 15.5 12 15.5Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 9.5V3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M10 5.5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Outlook Calendar
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => {
                if (calendarUrls?.iCalUrl) {
                  const link = document.createElement('a');
                  link.href = calendarUrls.iCalUrl;
                  link.download = 'interview.ics';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  setIsAddCalendarDialogOpen(false);
                }
              }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Download iCal File
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PrepGuideDialog 
        open={isPrepGuideDialogOpen}
        onOpenChange={setIsPrepGuideDialogOpen}
        interview={currentInterview}
      />
    </div>
  );
} 