"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useSubscription } from "@/app/context/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  PlusCircle,
  FileText,
  Star,
  Download,
  Share2,
  Trash2,
  Clock,
  AlertCircle,
  Loader2,
  ArrowRight,
  Pencil,
  BriefcaseIcon,
  Calendar,
  Building2,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  TrendingUp,
  Award,
  ChevronRight,
  ListChecks,
  BarChart3,
  Grid3X3,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';

interface Resume {
  id: string;
  title: string;
  content: Record<string, any>;
  status: 'draft' | 'completed';
  shared: boolean;
  created_at: string;
  last_modified: string;
  user_id: string;
}

interface CoverLetter {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  cover_letter?: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'completed';
}

interface JobApplication {
  id: string;
  company_name: string;
  job_title: string;
  status: string;
  location: string;
  remote_type: string;
  created_at: string;
  updated_at: string;
  employer_logo?: string;
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

interface ResumeError {
  message: string;
  code?: string;
}

const statusColors = {
  applied: 'bg-blue-100 text-blue-800',
  screening: 'bg-yellow-100 text-yellow-800',
  interview_scheduled: 'bg-purple-100 text-purple-800',
  interview_completed: 'bg-indigo-100 text-indigo-800',
  offer_received: 'bg-green-100 text-green-800',
  offer_accepted: 'bg-emerald-100 text-emerald-800',
  offer_declined: 'bg-orange-100 text-orange-800',
  rejected: 'bg-red-100 text-red-800',
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
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { credits, isLoading: creditsLoading } = useSubscription();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<ResumeError | null>(null);
  const [activeTab, setActiveTab] = useState<'resumes' | 'cover-letters'>('resumes');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Validate Supabase client
        if (!supabase) {
          throw new Error('Supabase client is not initialized');
        }

        // Fetch resumes with error handling
        let resumesResult;
        try {
          resumesResult = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', user.id)
            .order('last_modified', { ascending: false });

          if (resumesResult.error) {
            throw resumesResult.error;
          }
        } catch (resumeError: any) {
          console.error('Resume fetch error:', resumeError);
          throw new Error(resumeError?.message || 'Failed to fetch resumes');
        }

        // Set resumes state
        setResumes(resumesResult?.data || []);

        // Fetch cover letters with error handling
        let coverLettersResult;
        try {
          coverLettersResult = await supabase
            .from('cover_letter_forms')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

          if (coverLettersResult.error) {
            throw coverLettersResult.error;
          }
        } catch (coverLetterError: any) {
          console.error('Cover letter fetch error:', coverLetterError);
          throw new Error(coverLetterError?.message || 'Failed to fetch cover letters');
        }

        // Set cover letters state
        setCoverLetters(coverLettersResult?.data || []);

        // Fetch job applications
        let applicationsResult;
        try {
          applicationsResult = await supabase
            .from('job_applications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (applicationsResult.error) {
            throw applicationsResult.error;
          }

          // Extract employer logos from job descriptions
          const processedApplications = applicationsResult.data.map(app => {
            try {
              const jobDescription = app.job_description || '';
              const logoMatch = jobDescription.match(/employer_logo:([^\n]*)/);
              return {
                ...app,
                employer_logo: logoMatch ? logoMatch[1].trim() : null
              };
            } catch (error) {
              console.error('Error processing application:', error);
              return app;
            }
          });

          // Set applications state with processed data
          setApplications(processedApplications || []);
        } catch (applicationsError: any) {
          console.error('Applications fetch error:', applicationsError);
          throw new Error(applicationsError?.message || 'Failed to fetch applications');
        }

        // Fetch interviews
        let interviewsResult;
        try {
          interviewsResult = await supabase
            .from('job_interviews')
            .select(`
              *,
              job_applications!inner (
                user_id
              )
            `)
            .eq('job_applications.user_id', user.id)
            .order('scheduled_at', { ascending: true });

          if (interviewsResult.error) {
            throw interviewsResult.error;
          }
        } catch (interviewsError: any) {
          console.error('Interviews fetch error:', interviewsError);
          throw new Error(interviewsError?.message || 'Failed to fetch interviews');
        }

        // Set interviews state
        setInterviews(interviewsResult?.data || []);

        // Clear any existing errors
        setError(null);

      } catch (err: any) {
        console.error('Dashboard data fetch error:', err);
        setError({
          message: err?.message || 'Failed to load dashboard data. Please check your connection and try again.',
          code: err?.code || 'FETCH_ERROR'
        });
        toast.error('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDeleteResume = async (id: string) => {
    if (!user) return;

    try {
      setIsDeletingId(id);
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setResumes(prev => prev.filter(resume => resume.id !== id));
      toast.success('Resume deleted successfully');
    } catch (err: any) {
      console.error('Error deleting resume:', err);
      toast.error(err.message || 'Failed to delete resume');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleDeleteCoverLetter = async (id: string) => {
    if (!user) return;

    try {
      setIsDeletingId(id);
      const { error } = await supabase
        .from('cover_letter_forms')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setCoverLetters(prev => prev.filter(letter => letter.id !== id));
      toast.success('Cover letter deleted successfully');
    } catch (err: any) {
      console.error('Error deleting cover letter:', err);
      toast.error(err.message || 'Failed to delete cover letter');
    } finally {
      setIsDeletingId(null);
    }
  };

  const getStats = () => {
    const resumeStats = {
      completed: resumes.filter(r => r.status === 'completed').length,
      drafts: resumes.filter(r => r.status === 'draft').length,
      shared: resumes.filter(r => r.shared).length
    };

    const coverLetterStats = {
      total: coverLetters.length,
      withLetter: coverLetters.filter(cl => cl.cover_letter).length,
      recent: coverLetters.filter(cl => {
        const date = new Date(cl.updated_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return date > thirtyDaysAgo;
      }).length
    };

    const applicationStats = {
      total: applications.length,
      active: applications.filter(app => !['offer_accepted', 'offer_declined', 'rejected'].includes(app.status)).length,
      interviews: applications.filter(app => app.status === 'interview_scheduled').length,
      offers: applications.filter(app => ['offer_received', 'offer_accepted'].includes(app.status)).length
    };

    const interviewStats = {
      upcoming: interviews.filter(interview => new Date(interview.scheduled_at) > new Date()).length,
      completed: interviews.filter(interview => new Date(interview.scheduled_at) < new Date()).length,
      thisWeek: interviews.filter(interview => {
        const interviewDate = new Date(interview.scheduled_at);
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return interviewDate > today && interviewDate < nextWeek;
      }).length
    };

    return { resumeStats, coverLetterStats, applicationStats, interviewStats };
  };

  const stats = getStats();

  const upcomingInterviews = interviews
    .filter(interview => new Date(interview.scheduled_at) > new Date())
    .slice(0, 3);

  const recentApplications = applications
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-[400px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-10"
    >
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 mb-6">
        <div className="max-w-3xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome to Your Career Dashboard</h1>
          <p className="text-muted-foreground mb-4">
            Track your job applications, manage your resumes, and stay on top of interviews all in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/jobs">
              <Button className="gap-2">
                <Search className="h-4 w-4" />
                Find Jobs
              </Button>
            </Link>
            <Link href="/builder">
              <Button variant="outline" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                New Resume
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview with improved styling */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-primary" />
          Overview
        </h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <Card className="overflow-hidden border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <BriefcaseIcon className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-2xl font-bold">{stats.applicationStats.total}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-blue-500" />
                <span>{stats.applicationStats.active} active applications</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
              <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-2xl font-bold">{stats.applicationStats.interviews}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3 mr-1 text-blue-500" />
                <span>{upcomingInterviews.length} upcoming</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
              <CardTitle className="text-sm font-medium">Resumes</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-2xl font-bold">{resumes.length}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Award className="h-3 w-3 mr-1 text-blue-500" />
                <span>{resumes.filter(r => r.status === 'completed').length} completed</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
              <CardTitle className="text-sm font-medium">Cover Letters</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-2xl font-bold">{coverLetters.length}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <ListChecks className="h-3 w-3 mr-1 text-blue-500" />
                <span>{coverLetters.filter(cl => cl.status === 'completed').length} completed</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Upcoming Interviews */}
        <Card className="lg:col-span-4 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-primary mr-2" />
                <CardTitle className="text-lg font-bold">Upcoming Interviews</CardTitle>
              </div>
              <Link href="/jobs">
                <Button variant="ghost" size="sm" className="gap-2 h-8 px-3">
                  <span>View All</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-5">
            {upcomingInterviews.length === 0 ? (
              <div className="text-center py-10 bg-muted/10 rounded-lg">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground font-medium mb-2">No upcoming interviews scheduled</p>
                <Link href="/jobs">
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-1" /> Schedule an interview
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingInterviews.map(interview => {
                  const application = applications.find(app => app.id === interview.job_application_id);
                  const interviewDate = new Date(interview.scheduled_at);
                  return (
                    <div key={interview.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
                      <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary">
                        <span className="text-sm font-medium">{interviewDate.toLocaleString('en-US', { month: 'short' })}</span>
                        <span className="text-2xl font-bold">{interviewDate.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{application?.company_name}</p>
                        <p className="text-sm text-muted-foreground truncate">{application?.job_title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>{formatDateTime(interview.scheduled_at)}</span>
                          </div>
                          <span className="mx-1">•</span>
                          <div className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            <span>{interview.location || 'Remote'}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-xs px-2 py-1 bg-primary/5">
                        {interview.interview_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-3 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center">
              <Grid3X3 className="h-5 w-5 text-primary mr-2" />
              <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link href="/jobs" className="md:col-span-2">
                <Button className="w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <Search className="h-4 w-4" />
                  Search Jobs
                </Button>
              </Link>
              <Link href="/builder">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  Create Resume
                </Button>
              </Link>
              <Link href="/cover-letter">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <FileText className="h-4 w-4 text-amber-600" />
                  Write Cover Letter
                </Button>
              </Link>
              <Link href="/jobs" className="md:col-span-2">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Plus className="h-4 w-4 text-blue-600" />
                  Add Job Application
                </Button>
              </Link>
            </div>

            {/* Activity Summary */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold mb-4 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1.5 text-primary" />
                Application Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Active Applications</span>
                    <span className="font-medium">{Math.round((stats.applicationStats.active / stats.applicationStats.total) * 100 || 0)}%</span>
                  </div>
                  <Progress value={(stats.applicationStats.active / stats.applicationStats.total) * 100 || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Interview Success</span>
                    <span className="font-medium">{Math.round((stats.applicationStats.interviews / stats.applicationStats.total) * 100 || 0)}%</span>
                  </div>
                  <Progress value={(stats.applicationStats.interviews / stats.applicationStats.total) * 100 || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Offer Rate</span>
                    <span className="font-medium">{Math.round((stats.applicationStats.offers / stats.applicationStats.total) * 100 || 0)}%</span>
                  </div>
                  <Progress value={(stats.applicationStats.offers / stats.applicationStats.total) * 100 || 0} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="lg:col-span-7 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BriefcaseIcon className="h-5 w-5 text-primary mr-2" />
                <CardTitle className="text-base sm:text-lg font-bold">Recent Applications</CardTitle>
              </div>
              <Link href="/jobs">
                <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 h-8 px-2 sm:px-3">
                  <span className="text-xs sm:text-sm">View All</span>
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 py-4 sm:py-5">
            {recentApplications.length === 0 ? (
              <div className="text-center py-8 sm:py-10 bg-muted/10 rounded-lg">
                <BriefcaseIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground font-medium mb-2">No job applications yet</p>
                <Link href="/jobs">
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-1" /> Add your first application
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {recentApplications.map(application => (
                  <div key={application.id} className="flex flex-col sm:flex-row items-start gap-3 p-3 sm:p-4 rounded-lg border border-muted/60 bg-card hover:bg-accent/5 transition-colors">
                    <div className="flex items-center sm:items-start w-full sm:w-auto">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-md border border-muted bg-muted/30 flex items-center justify-center shrink-0 overflow-hidden">
                        {application.employer_logo && application.employer_logo.trim() !== "" ? (
                          <img 
                            src={application.employer_logo} 
                            alt={`${application.company_name} logo`}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '';
                              target.onerror = null;
                              target.parentElement?.classList.add('bg-muted/30');
                              const icon = document.createElement('div');
                              icon.innerHTML = '<svg class="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/></svg>';
                              target.parentElement?.appendChild(icon.firstChild as Node);
                            }}
                          />
                        ) : (
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="ml-3 sm:ml-0 flex-1 min-w-0 sm:hidden">
                        <p className="font-semibold truncate text-sm">{application.company_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{application.job_title}</p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <div className="hidden sm:block">
                        <p className="font-semibold truncate">{application.company_name}</p>
                        <p className="text-sm text-muted-foreground truncate">{application.job_title}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">Applied {formatDistanceToNow(new Date(application.created_at))} ago</span>
                      </div>
                      <div className="mt-2 sm:mt-3">
                        <Badge
                          variant="secondary"
                          className={`${statusColors[application.status as keyof typeof statusColors]} text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 truncate max-w-[150px]`}
                        >
                          {application.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resume and Cover Letter Management */}
      <div className="space-y-6">
        <div className="flex items-center">
          <Users className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-xl font-semibold">Your Documents</h2>
        </div>
        
        <Tabs defaultValue="resumes" className="w-full">
          <TabsList className="w-full max-w-md grid grid-cols-2 gap-1 mb-6">
            <TabsTrigger value="resumes" className="text-sm">Resumes</TabsTrigger>
            <TabsTrigger value="cover-letters" className="text-sm">Cover Letters</TabsTrigger>
          </TabsList>

          <TabsContent value="resumes">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {/* Add New Resume Card */}
              <Link href="/builder">
                <Card className="bg-gradient-to-br from-background/80 to-muted/50 hover:from-primary/5 hover:to-primary/10 transition-colors cursor-pointer h-full border-dashed border-2 border-muted flex flex-col items-center justify-center">
                  <CardContent className="p-6 text-center h-full flex flex-col items-center justify-center">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <PlusCircle className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-medium text-lg mb-1">Create New Resume</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start building your professional resume
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Existing Resumes */}
              {resumes.map(resume => (
                <Card key={resume.id} className="group overflow-hidden shadow-sm hover:shadow-md transition-all border-muted/60">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                        <FileText className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{resume.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="truncate">
                            Modified {formatDistanceToNow(new Date(resume.last_modified))} ago
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-muted/60">
                      <Link href={`/builder/${resume.id}`} className="flex-1">
                        <Button variant="outline" className="w-full group">
                          <Pencil className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                          Edit Resume
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => handleDeleteResume(resume.id)}
                        disabled={isDeletingId === resume.id}
                      >
                        {isDeletingId === resume.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cover-letters">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {/* Add New Cover Letter Card */}
              <Link href="/cover-letter/new">
                <Card className="bg-gradient-to-br from-background/80 to-muted/50 hover:from-primary/5 hover:to-primary/10 transition-colors cursor-pointer h-full border-dashed border-2 border-muted flex flex-col items-center justify-center">
                  <CardContent className="p-6 text-center h-full flex flex-col items-center justify-center">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <PlusCircle className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-medium text-lg mb-1">Create New Cover Letter</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Write a compelling cover letter
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Existing Cover Letters */}
              {coverLetters.map(coverLetter => (
                <Card key={coverLetter.id} className="group overflow-hidden shadow-sm hover:shadow-md transition-all border-muted/60">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 rounded-lg shrink-0">
                        <FileText className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{coverLetter.company_name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{coverLetter.job_title}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Last updated {formatDistanceToNow(new Date(coverLetter.updated_at))} ago</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-muted/60">
                      <Link href={`/cover-letter/${coverLetter.id}`} className="flex-1">
                        <Button variant="outline" className="w-full group">
                          <Pencil className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                          Edit Letter
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => handleDeleteCoverLetter(coverLetter.id)}
                        disabled={isDeletingId === coverLetter.id}
                      >
                        {isDeletingId === coverLetter.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
} 