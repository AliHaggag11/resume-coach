'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Loader2, FileSearch, BrainCircuit, ListChecks, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:p-6 p-4">
        <DialogHeader>
          <DialogTitle>
            {application?.id ? 'Edit Job Application' : 'Add New Job Application'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                placeholder="Enter company name"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title *</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) =>
                  setFormData({ ...formData, job_title: e.target.value })
                }
                placeholder="Enter job title"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Enter location"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_range">Salary Range</Label>
              <Input
                id="salary_range"
                value={formData.salary_range}
                onChange={(e) =>
                  setFormData({ ...formData, salary_range: e.target.value })
                }
                placeholder="e.g. $80,000 - $100,000"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remote_type">Work Type</Label>
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
              <Label htmlFor="status">Application Status</Label>
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
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ').charAt(0).toUpperCase() +
                        status.replace('_', ' ').slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_link">Job Posting URL</Label>
            <Input
              id="job_link"
              value={formData.job_link}
              onChange={(e) =>
                setFormData({ ...formData, job_link: e.target.value })
              }
              placeholder="Enter job posting URL"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_description">Job Description</Label>
            <Textarea
              id="job_description"
              value={formData.job_description}
              onChange={(e) =>
                setFormData({ ...formData, job_description: e.target.value })
              }
              placeholder="Enter job description"
              className="min-h-[8rem] w-full"
            />
          </div>

          {formData.job_description && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={analyzeJobDescription}
                    disabled={isAnalyzing}
                    className="group w-full sm:w-auto"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FileSearch className="h-4 w-4 mr-2" />
                        Analyze Job
                      </>
                    )}
                  </Button>
                </div>
                
                {isAnalyzing ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-6 bg-muted rounded w-1/4"></div>
                    <div className="space-y-2">
                      <div className="h-8 bg-muted rounded"></div>
                      <div className="h-8 bg-muted rounded"></div>
                    </div>
                  </div>
                ) : aiSuggestions && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiSuggestions.requiredSkills.map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Key Qualifications</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiSuggestions.keyQualifications.map((qual, i) => (
                          <span key={i} className="px-2 py-1 bg-muted rounded-md text-sm">
                            {qual}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Preparation Tips</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {aiSuggestions.preparationTips.map((tip, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{tip}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Likely Interview Questions</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {aiSuggestions.interviewQuestions.map((question, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{question}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Company Insights</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {aiSuggestions.companyInsights.map((insight, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{insight}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about this application"
              className="min-h-[6rem] w-full"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {application?.id ? 'Update' : 'Add'} Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 