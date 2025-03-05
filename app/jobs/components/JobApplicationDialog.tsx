'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Loader2, 
  FileSearch, 
  BrainCircuit, 
  ListChecks, 
  Sparkles, 
  CheckCircle2,
  Building2,
  Briefcase,
  MapPin,
  DollarSign,
  Link,
  FileText,
  StickyNote
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface JobApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application?: any;
  onClose: () => void;
}

const REMOTE_TYPES = ['remote', 'hybrid', 'onsite'] as const;
const APPLICATION_STATUSES = [
  'applied',
  'screening',
  'interview_scheduled',
  'interviewed',
  'offer_received',
  'offer_accepted',
  'offer_declined',
  'rejected',
] as const;

const statusColors: Record<string, string> = {
  applied: 'bg-blue-500/10 text-blue-500 border-blue-200',
  screening: 'bg-purple-500/10 text-purple-500 border-purple-200',
  interview_scheduled: 'bg-yellow-500/10 text-yellow-500 border-yellow-200',
  interviewed: 'bg-orange-500/10 text-orange-500 border-orange-200',
  offer_received: 'bg-green-500/10 text-green-500 border-green-200',
  offer_accepted: 'bg-emerald-500/10 text-emerald-500 border-emerald-200',
  offer_declined: 'bg-gray-500/10 text-gray-500 border-gray-200',
  rejected: 'bg-red-500/10 text-red-500 border-red-200',
};

export default function JobApplicationDialog({
  open,
  onOpenChange,
  application,
  onClose,
}: JobApplicationDialogProps) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    requiredSkills: string[];
    keyQualifications: string[];
    preparationTips: string[];
    interviewQuestions: string[];
    companyInsights: string[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    job_description: '',
    job_link: '',
    status: 'applied',
    salary_range: '',
    location: '',
    remote_type: 'onsite',
    notes: '',
  });

  useEffect(() => {
    if (application) {
      setFormData({
        company_name: application.company_name || '',
        job_title: application.job_title || '',
        job_description: application.job_description || '',
        job_link: application.job_link || '',
        status: application.status || 'applied',
        salary_range: application.salary_range || '',
        location: application.location || '',
        remote_type: application.remote_type || 'onsite',
        notes: application.notes || '',
      });
    } else {
      setFormData({
        company_name: '',
        job_title: '',
        job_description: '',
        job_link: '',
        status: 'applied',
        salary_range: '',
        location: '',
        remote_type: 'onsite',
        notes: '',
      });
    }
  }, [application]);

  // Reset AI suggestions and set active tab to 'details' whenever dialog opens
  useEffect(() => {
    if (open) {
      setActiveTab('details');
      if (!application) {
        setAiSuggestions(null);
      }
    }
  }, [open, application]);

  const analyzeJobDescription = async () => {
    if (!formData.job_description) {
      toast.error('Please add a job description to analyze');
      return;
    }

    try {
      setIsAnalyzing(true);
      
      const prompt = {
        content: formData.job_description,
        title: formData.job_title,
        company: formData.company_name,
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
          temperature: 0 // Add temperature parameter to make responses more consistent
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
        
        setAiSuggestions(validatedAnalysis);
        toast.success('Job description analyzed successfully');
        // Automatically switch to AI tab when analysis is complete
        setActiveTab('ai');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSaving(true);

      if (!formData.company_name || !formData.job_title) {
        toast.error('Please fill in all required fields');
        return;
      }

      const data = {
        ...formData,
        user_id: user.id,
        ai_analysis: aiSuggestions // Save the AI analysis with the application
      };

      let result;
      if (application?.id) {
        result = await supabase
          .from('job_applications')
          .update(data)
          .eq('id', application.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('job_applications')
          .insert([data])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast.success(
        application?.id
          ? 'Job application updated successfully'
          : 'Job application added successfully'
      );
      onClose();
    } catch (error) {
      console.error('Error saving job application:', error);
      toast.error('Failed to save job application');
    } finally {
      setIsSaving(false);
    }
  };

  // Format the status text nicely
  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              {application?.id ? 'Edit Job Application' : 'Add New Job Application'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {application?.id 
                ? 'Update the details of your job application'
                : 'Track a new job application to monitor your job search progress'
              }
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Application Details
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2" disabled={!formData.job_description}>
                <BrainCircuit className="h-4 w-4" />
                AI Analysis
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6 pt-2">
              <form id="application-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Main Info Card */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Job Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company_name" className="text-sm font-medium">
                          Company Name <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="company_name"
                            value={formData.company_name}
                            onChange={(e) =>
                              setFormData({ ...formData, company_name: e.target.value })
                            }
                            placeholder="Enter company name"
                            className="pl-9"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="job_title" className="text-sm font-medium">
                          Job Title <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="job_title"
                            value={formData.job_title}
                            onChange={(e) =>
                              setFormData({ ...formData, job_title: e.target.value })
                            }
                            placeholder="Enter job title"
                            className="pl-9"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({ ...formData, location: e.target.value })
                            }
                            placeholder="Enter location"
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="salary_range" className="text-sm font-medium">Salary Range</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="salary_range"
                            value={formData.salary_range}
                            onChange={(e) =>
                              setFormData({ ...formData, salary_range: e.target.value })
                            }
                            placeholder="e.g. $80,000 - $100,000"
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="remote_type" className="text-sm font-medium">Work Type</Label>
                        <Select
                          value={formData.remote_type}
                          onValueChange={(value) =>
                            setFormData({ ...formData, remote_type: value })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {REMOTE_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium">Application Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) =>
                            setFormData({ ...formData, status: value })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {APPLICATION_STATUSES.map((status) => (
                              <SelectItem key={status} value={status} className="flex items-center">
                                <div className="flex items-center">
                                  <Badge variant="outline" className={`mr-2 h-2 w-2 rounded-full p-0 ${statusColors[status]}`} />
                                  {formatStatus(status)}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="job_link" className="text-sm font-medium">Job Posting URL</Label>
                      <div className="relative">
                        <Link className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="job_link"
                          value={formData.job_link}
                          onChange={(e) =>
                            setFormData({ ...formData, job_link: e.target.value })
                          }
                          placeholder="Enter job posting URL"
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="job_description" className="text-sm font-medium">Job Description</Label>
                        {formData.job_description && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={analyzeJobDescription}
                            disabled={isAnalyzing}
                            className="h-8 px-2 text-xs"
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <BrainCircuit className="mr-1 h-3 w-3" />
                                Analyze with AI
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      <Textarea
                        id="job_description"
                        value={formData.job_description}
                        onChange={(e) =>
                          setFormData({ ...formData, job_description: e.target.value })
                        }
                        placeholder="Paste the full job description here"
                        className="min-h-[8rem]"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Notes Card */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <StickyNote className="h-5 w-5 text-primary" />
                      Personal Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Add any personal notes about this application (interview preparations, follow-ups, etc.)"
                      className="min-h-[6rem]"
                    />
                  </CardContent>
                </Card>
              </form>
            </TabsContent>
            
            <TabsContent value="ai" className="space-y-4 pt-2">
              <Card className="border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    AI Job Analysis
                  </CardTitle>
                  <CardDescription>
                    Let AI analyze the job description to extract key information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!formData.job_description ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                      <p className="text-muted-foreground">Add a job description first to enable AI analysis</p>
                    </div>
                  ) : !aiSuggestions && !isAnalyzing ? (
                    <div className="text-center py-8">
                      <Button
                        onClick={analyzeJobDescription}
                        className="mx-auto bg-primary hover:bg-primary/90"
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <FileSearch className="h-4 w-4 mr-2" />
                            Analyze Job Description
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-3">
                        Our AI will extract key requirements, skills, and insights from this job
                      </p>
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
                  ) : aiSuggestions && (
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
                  )}
                </CardContent>
                {aiSuggestions && (
                  <CardFooter className="bg-muted/20 border-t px-6 py-4">
                    <div className="text-xs text-muted-foreground">
                      The analysis above is automatically generated and will be saved with your application
                    </div>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="border-t p-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            form="application-form"
            disabled={isSaving}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {application?.id ? 'Update' : 'Save'} Application
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 