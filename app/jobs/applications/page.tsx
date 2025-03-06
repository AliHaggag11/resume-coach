'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Plus, Search, BriefcaseIcon, Building2, MapPin, PenLine, Clock, Trash2, Loader2, MoreVertical, Filter, BrainCircuit, CheckCircle2, Sparkles, ListChecks, FileSearch, CreditCard } from 'lucide-react';
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
import { useSubscription } from '@/app/context/SubscriptionContext';

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
  ai_analysis?: any;
}

// Add new interface for AI Analysis Dialog
interface AIAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: JobApplication | null;
  onClose: () => void;
}

function AIAnalysisDialog({ open, onOpenChange, application, onClose }: AIAnalysisDialogProps) {
  const { credits, spendCredits, isLoading: isLoadingCredits } = useSubscription();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    requiredSkills: string[];
    keyQualifications: string[];
    preparationTips: string[];
    interviewQuestions: string[];
    companyInsights: string[];
  } | null>(null);
  const [isCreditsDeducted, setIsCreditsDeducted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Define credit cost for analysis
  const ANALYSIS_CREDIT_COST = 5;

  // Reset state when dialog is opened with a new application
  useEffect(() => {
    if (open && application) {
      // Reset states
      setIsCreditsDeducted(false);
      setIsSaved(false);
      
      console.log("Dialog opened with application:", application.id);
      console.log("Application has analysis:", !!application.ai_analysis);
      
      // Check if this application already has an analysis
      if (application.ai_analysis) {
        try {
          // Parse the stored analysis if it's a string
          const parsedAnalysis = typeof application.ai_analysis === 'string' 
            ? JSON.parse(application.ai_analysis) 
            : application.ai_analysis;
            
          console.log("Loaded existing analysis:", parsedAnalysis);
          setAiSuggestions(parsedAnalysis);
          setIsSaved(true); // Mark as already saved
          // No need to charge credits as we're using an existing analysis
        } catch (error) {
          console.error('Error parsing stored analysis:', error);
          setAiSuggestions(null);
        }
      } else {
        // No existing analysis
        console.log("No existing analysis found");
        setAiSuggestions(null);
      }
    } else if (!open) {
      // Don't reset aiSuggestions when closing dialog
      // Just reset the credit deduction state
      setIsCreditsDeducted(false);
    }
  }, [open, application]);

  // Function to save analysis to the database and refresh applications list
  const saveAnalysisToDatabase = async (analysis: any, applicationId: string) => {
    console.log("Saving analysis to database for application:", applicationId);
    
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ 
          ai_analysis: analysis,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Error saving analysis to database:', error);
        toast.error('Failed to save analysis to your account');
        return false;
      }
      
      // Mark that this analysis is saved
      setIsSaved(true);
      
      toast.success('Analysis saved to your account');
      return true;
    } catch (error) {
      console.error('Exception saving analysis:', error);
      return false;
    }
  };

  const analyzeJobDescription = async () => {
    if (!application?.job_description) {
      toast.error('No job description available to analyze');
      return;
    }
    
    // If we already have analysis results that are saved, don't analyze again
    if (aiSuggestions && isSaved) {
      toast.info('Analysis has already been performed for this job');
      return;
    }

    // Check if we need to deduct credits (if not already deducted)
    if (!isCreditsDeducted) {
      // Try to spend credits
      const success = await spendCredits(
        ANALYSIS_CREDIT_COST, 
        'job_analysis',
        `AI Analysis for ${application.job_title}`
      );
      
      if (!success) {
        // Failed to spend credits, don't proceed
        return;
      }
      
      // Mark that credits have been deducted
      setIsCreditsDeducted(true);
    }

    try {
      setIsAnalyzing(true);
      
      const prompt = {
        content: application.job_description,
        title: application.job_title,
        company: application.company_name,
        format: "json",
        system: "You are a job analysis assistant that ONLY responds with JSON. Your task is to analyze job descriptions and extract key information in the exact JSON format specified. Never return plain text or explanations.",
        template: {
          requiredSkills: ["skill1", "skill2", "skill3", "skill4", "skill5"],
          keyQualifications: ["qual1", "qual2", "qual3", "qual4", "qual5"],
          preparationTips: ["tip1", "tip2", "tip3"],
          interviewQuestions: ["question1", "question2", "question3", "question4"],
          companyInsights: ["insight1", "insight2", "insight3"]
        },
        instructions: "Extract information from the job description and return it in the exact JSON format shown in the template. Do not include any text outside the JSON structure.",
        rules: [
          "Response MUST be valid JSON",
          "Do not include any text before or after the JSON",
          "Use the exact field names shown in the template",
          "Each array must contain strings only",
          "Follow the exact number of items specified in the template"
        ]
      };

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          type: 'job_analysis',
          format: 'json',
          temperature: 0
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Analysis failed');
      }

      const data = await response.json();
      
      if (!data.result) {
        throw new Error('No analysis results received');
      }

      try {
        // Clean the result string by removing markdown code blocks if present
        const cleanResult = data.result
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        let analysis;
        try {
          // First try parsing the cleaned result
          analysis = JSON.parse(cleanResult);
        } catch (initialParseError) {
          console.log('Initial parse failed, attempting to convert plain text to JSON');
          
          // If we got plain text, try to convert it to our expected format
          const lines = cleanResult.split('\n').filter((line: string) => line.trim());
          const skills = lines
            .filter((line: string) => /javascript|python|java|react|node|sql|nosql|programming|development|testing/i.test(line))
            .slice(0, 5);
          const qualifications = lines
            .filter((line: string) => /experience|knowledge|proficiency|familiarity|understanding|degree|years/i.test(line))
            .slice(0, 5);
          const tips = [
            "Review the technical skills mentioned in the job description",
            "Prepare examples of relevant project experience",
            "Research the company's tech stack and products"
          ];
          const questions = [
            "Describe your experience with the technologies mentioned",
            "How do you approach problem-solving and debugging?",
            "Tell me about a challenging project you worked on",
            "How do you stay updated with new technologies?"
          ];
          const insights = [
            "Values technical excellence and best practices",
            "Emphasizes collaboration and teamwork",
            "Focus on continuous learning and improvement"
          ];

          analysis = {
            requiredSkills: skills.length ? skills : ["JavaScript", "Python", "React", "Node.js", "SQL"],
            keyQualifications: qualifications.length ? qualifications : [
              "Bachelor's degree in Computer Science or related field",
              "3+ years of software development experience",
              "Strong problem-solving skills",
              "Experience with modern web technologies",
              "Knowledge of software development best practices"
            ],
            preparationTips: tips,
            interviewQuestions: questions,
            companyInsights: insights
          };
        }
        
        // Log the parsed response for debugging
        console.log('Parsed AI response:', analysis);
        
        // Check if we got the wrong format
        if (analysis.atsCompatibility || analysis.impactStatements || analysis.keywordsMatch) {
          console.error('Received resume analysis format instead of job analysis:', analysis);
          toast.error('AI returned resume analysis instead of job analysis. Retrying...');
          // Retry the analysis once
          return analyzeJobDescription();
        }
        
        // Initialize default arrays if missing
        const validatedAnalysis = {
          requiredSkills: Array.isArray(analysis.requiredSkills) ? analysis.requiredSkills.slice(0, 5) : [],
          keyQualifications: Array.isArray(analysis.keyQualifications) ? analysis.keyQualifications.slice(0, 5) : [],
          preparationTips: Array.isArray(analysis.preparationTips) ? analysis.preparationTips.slice(0, 3) : [],
          interviewQuestions: Array.isArray(analysis.interviewQuestions) ? analysis.interviewQuestions.slice(0, 4) : [],
          companyInsights: Array.isArray(analysis.companyInsights) ? analysis.companyInsights.slice(0, 3) : []
        };

        // Log what fields we got
        const missingFields = Object.entries(validatedAnalysis)
          .filter(([_, arr]) => arr.length === 0)
          .map(([field]) => field);
        
        if (missingFields.length > 0) {
          console.error('Missing or invalid fields:', missingFields);
          console.error('Received analysis:', analysis);
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
        
        // Update UI first with the analysis
        setAiSuggestions(validatedAnalysis);
        toast.success('Job description analyzed successfully');
        
        // Now save analysis results to database
        const saveResult = await saveAnalysisToDatabase(validatedAnalysis, application.id);
        if (saveResult) {
          // Let's update the application in the parent component
          if (typeof onClose === 'function') {
            onClose();
          }
        }
      } catch (parseError) {
        console.error('Failed to parse analysis:', parseError);
        console.error('Raw result:', data.result);
        throw new Error(`Failed to process analysis results: ${parseError instanceof Error ? parseError.message : 'Invalid response format'}`);
      }
    } catch (error) {
      console.error('Error analyzing job:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze job description');
      setAiSuggestions(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!application) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <AlertDialogHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <AlertDialogTitle className="text-xl">AI Analysis for {application.job_title}</AlertDialogTitle>
          <AlertDialogDescription>
            AI-generated insights based on the job description
            {isSaved && <span className="ml-2 text-xs text-primary font-medium">(Already saved)</span>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="p-6 overflow-y-auto flex-grow">
          {isLoadingCredits ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground ml-2">Loading your credits...</p>
            </div>
          ) : aiSuggestions ? (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Required Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.requiredSkills.map((skill, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary"
                      className="px-3 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-none text-sm"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Key Qualifications
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {aiSuggestions.keyQualifications.map((qual, i) => (
                    <div 
                      key={i} 
                      className="px-3 py-2 rounded-md bg-muted/50 border border-muted text-sm"
                    >
                      {qual}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-primary" />
                    Preparation Tips
                  </h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {aiSuggestions.preparationTips.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{tip}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Company Insights
                  </h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {aiSuggestions.companyInsights.map((insight, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{insight}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <FileSearch className="h-4 w-4 text-primary" />
                  Likely Interview Questions
                </h4>
                <div className="space-y-2">
                  {aiSuggestions.interviewQuestions.map((question, i) => (
                    <div 
                      key={i} 
                      className="px-4 py-3 rounded-md bg-muted/30 border border-muted text-sm"
                    >
                      {question}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : isAnalyzing ? (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Analyzing job description...</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2 animate-pulse">
                  <div className="h-5 bg-muted rounded w-1/4"></div>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-8 bg-muted rounded w-24"></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 animate-pulse">
                  <div className="h-5 bg-muted rounded w-1/3"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-4 bg-muted rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <div className="mb-8 bg-card/80 shadow-sm border border-border/40 p-4 rounded-lg flex items-center justify-center gap-3 max-w-md mx-auto">
                <div className="bg-primary/10 p-2 rounded-md">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <span className="text-base">This analysis costs <span className="font-semibold text-primary">{ANALYSIS_CREDIT_COST} credits</span>. You have <span className="font-semibold text-foreground">{credits} credits</span> remaining.</span>
              </div>
              
              <Button
                onClick={analyzeJobDescription}
                className="mx-auto bg-primary hover:bg-primary/90 px-6 py-6 h-auto text-base font-medium"
                disabled={credits < ANALYSIS_CREDIT_COST}
              >
                <FileSearch className="h-5 w-5 mr-2" />
                Analyze Job Description
              </Button>
              
              {credits < ANALYSIS_CREDIT_COST && (
                <div className="mt-4 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md p-3 max-w-md mx-auto">
                  <p>You need {ANALYSIS_CREDIT_COST} credits to perform this analysis.</p>
                </div>
              )}
              
              {credits >= ANALYSIS_CREDIT_COST && (
                <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">
                  Our AI will extract key requirements, skills, and insights from this job
                </p>
              )}
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex items-center justify-between border-t pt-4 p-6 bg-background">
          <div className="text-xs text-muted-foreground">
            {aiSuggestions && "Analysis is automatically generated based on the job description"}
          </div>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const formatDate = (date: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentApplication, setCurrentApplication] = useState<JobApplication | null>(null);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);
  const [isAIAnalysisOpen, setIsAIAnalysisOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);
  const [isDeletingApplication, setIsDeletingApplication] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;
    
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
      toast.error('Failed to load your applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddApplication = () => {
    setCurrentApplication(null);
    setIsApplicationDialogOpen(true);
  };

  const handleEditApplication = (application: JobApplication) => {
    setCurrentApplication(application);
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
      case 'screening':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'interview_scheduled':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'interviewed':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'offer_received':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'offer_accepted':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'offer_declined':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'rejected':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || app.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Add a refresh function for the AI Analysis Dialog
  const refreshApplications = async () => {
    await fetchApplications();
  };

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
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                  <SelectItem value="offer_received">Offer Received</SelectItem>
                  <SelectItem value="offer_accepted">Offer Accepted</SelectItem>
                  <SelectItem value="offer_declined">Offer Declined</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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
            <Card key={application.id} className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/20">
              <CardContent className="p-0">
                <div className="relative p-5 sm:p-6">
                  <div className="flex items-start gap-5">
                    {/* Logo Section */}
                    <div className="shrink-0">
                      <div className="h-16 w-16 rounded-xl border-2 border-muted bg-card flex items-center justify-center overflow-hidden">
                      {application?.job_description?.includes('employer_logo:') && 
                       application.job_description.split('employer_logo:')[1]?.split('\n')[0]?.trim() !== "" ? (
                        <img 
                          src={application.job_description.split('employer_logo:')[1]?.split('\n')[0]}
                          alt={`${application.company_name} logo`}
                            className="h-12 w-12 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            target.parentElement?.classList.add('fallback');
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
                      <div className="flex flex-col gap-4">
                        {/* Title and Company */}
                        <div>
                          <h3 className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
                            {application.job_title}
                          </h3>
                          <div className="mt-1.5 flex items-center gap-3 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-4 w-4" />
                              <span className="text-sm font-medium">{application.company_name}</span>
                            </div>
                            <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{application.location || 'Location not specified'}</span>
                            </div>
                          </div>
                      </div>

                        {/* Status and Actions Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Select 
                              value={application.status} 
                              onValueChange={async (newStatus) => {
                                try {
                                  const { error } = await supabase
                                    .from('job_applications')
                                    .update({ status: newStatus })
                                    .eq('id', application.id);
                                  
                                  if (error) throw error;
                                  
                                  setApplications(apps => 
                                    apps.map(app => 
                                      app.id === application.id 
                                        ? { ...app, status: newStatus }
                                        : app
                                    )
                                  );
                                  
                                  toast.success('Application status updated');
                                } catch (error) {
                                  console.error('Error updating status:', error);
                                  toast.error('Failed to update status');
                                }
                              }}
                            >
                              <SelectTrigger className={`w-[180px] h-9 text-sm ${getStatusColor(application.status)}`}>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4" />
                                  {getStatusLabel(application.status)}
                      </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="applied">Applied</SelectItem>
                                <SelectItem value="screening">Screening</SelectItem>
                                <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                                <SelectItem value="interviewed">Interviewed</SelectItem>
                                <SelectItem value="offer_received">Offer Received</SelectItem>
                                <SelectItem value="offer_accepted">Offer Accepted</SelectItem>
                                <SelectItem value="offer_declined">Offer Declined</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>

                            <Badge variant="secondary" className="bg-muted/50 text-muted-foreground border-muted">
                              <Clock className="h-3.5 w-3.5 mr-1.5" />
                          Applied {formatDate(application.created_at)}
                        </Badge>
                      </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 gap-1.5 bg-primary/5 text-primary hover:bg-primary/10 border-primary/10"
                              onClick={() => handleAddInterview(application)}
                            >
                              <Clock className="h-4 w-4" />
                              Add Interview
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 gap-1.5 bg-blue-500/5 text-blue-500 hover:bg-blue-500/10 border-blue-500/10"
                              onClick={() => {
                                setCurrentApplication(application);
                                setIsAIAnalysisOpen(true);
                              }}
                            >
                              <BrainCircuit className="h-4 w-4" />
                              AI Analysis
                            </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                                >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem 
                                  onClick={() => handleEditApplication(application)}
                                  className="flex items-center"
                                >
                          <PenLine className="h-4 w-4 mr-2" />
                                  Edit details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteApplication(application.id)}
                                  className="flex items-center text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
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

      <AIAnalysisDialog
        open={isAIAnalysisOpen}
        onOpenChange={setIsAIAnalysisOpen}
        application={currentApplication}
        onClose={refreshApplications}
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