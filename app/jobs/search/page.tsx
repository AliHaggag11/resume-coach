'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Search, BriefcaseIcon, Building2, MapPin, BookmarkIcon, ExternalLink, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

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

export default function JobSearchPage() {
  const { user } = useAuth();
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [loadingJobIds, setLoadingJobIds] = useState<Set<string>>(new Set());
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [hasMoreJobs, setHasMoreJobs] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchSavedJobs();
    }
  }, [user]);

  const fetchSavedJobs = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      setSavedJobs(data || []);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      toast.error('Failed to load saved jobs');
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

      const { data, error } = await supabase
        .from('saved_jobs')
        .insert(jobData)
        .select();

      if (error) throw error;
      
      toast.success('Job saved successfully');
      fetchSavedJobs();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    } finally {
      setLoadingJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(job.job_id);
        return newSet;
      });
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

  const handleJobSearch = () => {
    fetchJobs(1, false);
  };

  const applyToJob = async (job: JobListing) => {
    // Open the job application link in a new tab
    window.open(job.job_apply_link, '_blank');
    
    try {
      if (!user?.id) return;
      
      // Create a new job application
      const applicationData = {
        user_id: user.id,
        company_name: job.employer_name,
        job_title: job.job_title,
        job_description: `${job.job_description}\n\njob_id:${job.job_id}\nemployer_logo:${job.employer_logo || ''}`,
        status: 'applied',
        location: job.job_location || '',
        remote_type: job.job_employment_type || 'Not specified',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('job_applications')
        .insert(applicationData);
        
      if (error) throw error;
      
      toast.success('Job added to your applications');
      
      // Remove from saved jobs if it was saved
      const savedJob = savedJobs.find(sj => sj.job_id === job.job_id);
      if (savedJob) {
        await supabase
          .from('saved_jobs')
          .delete()
          .eq('id', savedJob.id);
          
        fetchSavedJobs();
      }
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };

  const isJobSaved = (jobId: string) => {
    return savedJobs.some(job => job.job_id === jobId);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Find Your Next Role</h1>
      </div>

      {/* Job Search Form */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Job title, company, or keyword" 
                value={jobSearchQuery}
                onChange={(e) => setJobSearchQuery(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleJobSearch()}
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Location (optional)" 
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleJobSearch()}
              />
            </div>
            <Button onClick={handleJobSearch} className="sm:w-auto w-full">
              Search Jobs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      <h2 className="text-xl font-semibold">Job Listings</h2>
      <div className="space-y-4">
        {isLoadingJobs ? (
          Array(5).fill(0).map((_, i) => (
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
        ) : jobListings.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No job listings found. Try adjusting your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {jobListings.map((job) => (
              <Card key={job.job_id} className="overflow-hidden group">
                <CardContent className="p-0">
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
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
                          <BriefcaseIcon className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-1 flex-1">
                        <h3 className="font-medium leading-tight">{job.job_title}</h3>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Building2 className="h-3.5 w-3.5 mr-1" />
                          {job.employer_name}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {job.job_location || 'Location not specified'}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge variant="outline" className="bg-primary/5 text-xs">{job.job_employment_type || 'Not specified'}</Badge>
                          {job.job_salary && <Badge variant="outline" className="bg-primary/5 text-xs">{job.job_salary}</Badge>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          disabled={loadingJobIds.has(job.job_id) || isJobSaved(job.job_id)}
                          onClick={() => saveJobToApplications(job)}
                        >
                          {loadingJobIds.has(job.job_id) ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : isJobSaved(job.job_id) ? (
                            <BookmarkIcon className="h-3.5 w-3.5 fill-current" />
                          ) : (
                            <BookmarkIcon className="h-3.5 w-3.5" />
                          )}
                          {isJobSaved(job.job_id) ? 'Saved' : 'Save'}
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => applyToJob(job)}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Apply
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="px-0 text-primary/80 font-medium"
                        onClick={() => toggleDescription(job.job_id)}
                      >
                        {expandedDescriptions.has(job.job_id) ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Hide Description
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Show Description
                          </>
                        )}
                      </Button>
                      {expandedDescriptions.has(job.job_id) && (
                        <div className="mt-2 text-sm text-muted-foreground space-y-2 whitespace-pre-wrap">
                          {job.job_description}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {hasMoreJobs && (
              <div className="flex justify-center pt-2">
                <Button 
                  variant="outline"
                  onClick={() => fetchJobs(currentPage + 1, true)}
                  disabled={isLoadingMore}
                  className="w-full sm:w-auto"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Jobs'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 