'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Plus, Search, BriefcaseIcon, Building2, MapPin, PenLine, Clock, Trash2, Loader2, MoreVertical, Filter } from 'lucide-react';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import JobApplicationDialog from '../components/JobApplicationDialog';
import InterviewDialog from '../components/InterviewDialog';
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

const formatDate = (date: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [remoteFilter, setRemoteFilter] = useState<string>('all');
  
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<JobApplication | null>(null);
  const [isAddMode, setIsAddMode] = useState(true);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);
  const [isDeletingApplication, setIsDeletingApplication] = useState(false);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddApplication = () => {
    setCurrentApplication(null);
    setIsAddMode(true);
    setIsApplicationDialogOpen(true);
  };

  const handleEditApplication = (application: JobApplication) => {
    setCurrentApplication(application);
    setIsAddMode(false);
    setIsApplicationDialogOpen(true);
  };

  const handleAddInterview = (application: JobApplication) => {
    setCurrentApplication(application);
    setIsInterviewDialogOpen(true);
  };

  const handleDeleteApplication = (applicationId: string) => {
    setApplicationToDelete(applicationId);
    setIsDeleteDialogOpen(true);
  };

  const deleteApplication = async (applicationId: string) => {
    if (!user?.id) return;
    
    setIsDeletingApplication(true);
    try {
      // First delete any related interviews
      const { error: interviewError } = await supabase
        .from('interviews')
        .delete()
        .eq('job_application_id', applicationId);
        
      if (interviewError) throw interviewError;
      
      // Then delete the application
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', applicationId);
        
      if (error) throw error;
      
      // Update the applications list
      setApplications(applications.filter(app => app.id !== applicationId));
      toast.success('Application deleted successfully');
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    } finally {
      setIsDeletingApplication(false);
      setIsDeleteDialogOpen(false);
      setApplicationToDelete(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (applicationToDelete) {
      await deleteApplication(applicationToDelete);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'interviewing':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'offer':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || app.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesRemote = remoteFilter === 'all' || app.remote_type.toLowerCase().includes(remoteFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesRemote;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Job Applications</h1>
        <Button onClick={handleAddApplication} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Application
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search applications..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={remoteFilter} onValueChange={setRemoteFilter}>
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Type</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="on-site">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {isLoading ? (
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
        ) : filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No applications found. Start by adding your first job application.</p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
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
                        <BriefcaseIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h3 className="font-medium leading-tight">{application.job_title}</h3>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Building2 className="h-3.5 w-3.5 mr-1" />
                        {application.company_name}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {application.location || 'Location not specified'} • {application.remote_type}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge className={`${getStatusColor(application.status)}`}>{application.status}</Badge>
                        <Badge variant="outline" className="bg-muted/50">
                          <Clock className="h-3 w-3 mr-1" />
                          Applied {formatDate(application.created_at)}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditApplication(application)}>
                          <PenLine className="h-4 w-4 mr-2" />
                          Edit application
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddInterview(application)}>
                          <Clock className="h-4 w-4 mr-2" />
                          Add interview
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteApplication(application.id)}
                          className="text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialogs */}
      <JobApplicationDialog
        open={isApplicationDialogOpen}
        onOpenChange={setIsApplicationDialogOpen}
        application={currentApplication}
        onClose={() => {
          fetchApplications();
        }}
      />

      <InterviewDialog
        open={isInterviewDialogOpen}
        onOpenChange={setIsInterviewDialogOpen}
        applicationId={currentApplication?.id}
        onClose={() => {
          fetchApplications();
        }}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this job application and any associated interviews. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingApplication}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeletingApplication}
            >
              {isDeletingApplication ? (
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
    </div>
  );
} 