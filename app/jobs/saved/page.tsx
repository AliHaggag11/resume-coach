'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Search, BriefcaseIcon, Building2, MapPin, ExternalLink, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
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

const formatDate = (date: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

export default function SavedJobsPage() {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isDeletingJob, setIsDeletingJob] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSavedJobs();
    }
  }, [user]);

  const fetchSavedJobs = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setSavedJobs(data || []);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      toast.error('Failed to load saved jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteJob = (jobId: string) => {
    setJobToDelete(jobId);
    setIsDeleteDialogOpen(true);
  };

  const removeSavedJob = async (jobId: string) => {
    if (!user?.id) return;
    
    setIsDeletingJob(true);
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('id', jobId);
        
      if (error) throw error;
      
      setSavedJobs(savedJobs.filter(job => job.id !== jobId));
      toast.success('Job removed from saved jobs');
    } catch (error) {
      console.error('Error removing saved job:', error);
      toast.error('Failed to remove saved job');
    } finally {
      setIsDeletingJob(false);
      setIsDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (jobToDelete) {
      await removeSavedJob(jobToDelete);
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

  const applyToJob = async (job: SavedJob) => {
    // Open the job application link in a new tab
    window.open(job.job_apply_link, '_blank');
    
    try {
      if (!user?.id) return;
      
      // Create a new job application
      const applicationData = {
        user_id: user.id,
        company_name: job.company_name,
        job_title: job.job_title,
        job_description: job.job_description,
        status: 'applied',
        location: job.location,
        remote_type: job.remote_type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('job_applications')
        .insert(applicationData);
        
      if (error) throw error;
      
      toast.success('Job added to your applications');
      
      // Remove from saved jobs
      await removeSavedJob(job.id);
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error('Failed to apply to job');
    }
  };

  const filteredJobs = savedJobs.filter(job => 
    job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Saved Jobs</h1>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search saved jobs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Jobs List */}
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
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No saved jobs found. Save jobs from the job search to see them here.</p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/20">
              <CardContent className="p-0">
                <div className="relative p-5 sm:p-6">
                  {/* Top Section */}
                  <div className="flex items-start gap-5">
                    {/* Logo Section */}
                    <div className="relative">
                      <div className="h-16 w-16 rounded-xl border-2 border-muted bg-card flex items-center justify-center overflow-hidden">
                        {job.job_description?.includes('employer_logo:') && 
                         job.job_description.split('employer_logo:')[1]?.split('\n')[0]?.trim() !== "" ? (
                          <img 
                            src={job.job_description.split('employer_logo:')[1]?.split('\n')[0]}
                            alt={`${job.company_name} logo`}
                            className="h-12 w-12 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.parentElement?.classList.add('fallback');
                              target.style.display = 'none';
                              const fallbackIcon = document.createElement('div');
                              fallbackIcon.innerHTML = '<svg class="h-8 w-8 text-muted-foreground/50" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="16" x="8" y="4" rx="1"/><path d="M18 8h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-2"/><path d="M4 8h2a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1Z"/></svg>';
                              target.parentElement?.appendChild(fallbackIcon.firstChild!);
                            }}
                          />
                        ) : (
                          <BriefcaseIcon className="h-8 w-8 text-muted-foreground/50" />
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-3">
                        {/* Title and Company */}
                        <div>
                          <h3 className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
                            {job.job_title}
                          </h3>
                          <div className="mt-1.5 flex items-center gap-3 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-4 w-4" />
                              <span className="text-sm font-medium">{job.company_name}</span>
                            </div>
                            <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{job.location || 'Location not specified'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Tags Section */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 font-medium">
                            {job.remote_type}
                          </Badge>
                          <Badge variant="secondary" className="bg-muted/50 text-muted-foreground border-muted">
                            Saved {formatDate(job.created_at)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Actions Section - Desktop */}
                    <div className="hidden sm:flex flex-col gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-[100px] gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-primary/10"
                        onClick={() => applyToJob(job)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Apply
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-[100px] gap-2 border-destructive/20 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="sm:hidden flex gap-2 mt-4">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-primary/10"
                      onClick={() => applyToJob(job)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2 border-destructive/20 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>

                  {/* Description Toggle */}
                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-0 -ml-2 text-muted-foreground hover:text-primary"
                      onClick={() => toggleDescription(job.id)}
                    >
                      {expandedDescriptions.has(job.id) ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1.5" />
                          Hide Full Description
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1.5" />
                          Show Full Description
                        </>
                      )}
                    </Button>
                    {expandedDescriptions.has(job.id) && (
                      <div className="mt-3 pl-2 text-sm text-muted-foreground prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-muted-foreground">
                        {job.job_description.includes('job_id:') 
                          ? job.job_description.split('job_id:')[0] 
                          : job.job_description}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove saved job?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this job from your saved jobs. You can always save it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingJob}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeletingJob}
            >
              {isDeletingJob ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}