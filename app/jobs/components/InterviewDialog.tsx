'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
  BrainCircuit, 
  Sparkles, 
  MessageSquare, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText,
  ListChecks,
  CheckCircle2,
  Star,
  VideoIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Interview {
  id: string;
  job_application_id: string;
  interview_type: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string;
  interviewer_names: string[];
  notes?: string;
  preparation_notes?: string;
  ai_preparation?: {
    questions: string[];
    tips: string[];
    topics: string[];
    answers: string[];
  };
}

interface InterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId?: string;
  interview?: Interview | null;
  onClose: () => void;
}

const INTERVIEW_TYPES = [
  'phone_screening',
  'technical',
  'behavioral',
  'onsite',
  'final',
] as const;

const typeIcons: Record<string, React.ReactNode> = {
  phone_screening: <MessageSquare className="h-4 w-4" />,
  technical: <ListChecks className="h-4 w-4" />,
  behavioral: <Users className="h-4 w-4" />,
  onsite: <MapPin className="h-4 w-4" />,
  final: <CheckCircle2 className="h-4 w-4" />,
};

export default function InterviewDialog({
  open,
  onOpenChange,
  applicationId,
  interview,
  onClose,
}: InterviewDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPreparation, setAiPreparation] = useState<{
    questions: string[];
    tips: string[];
    topics: string[];
    answers: string[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  const [formData, setFormData] = useState({
    interview_type: interview?.interview_type || 'phone_screening',
    scheduled_at: interview?.scheduled_at ? new Date(interview.scheduled_at).toISOString().slice(0, 16) : '',
    duration_minutes: interview?.duration_minutes || 60,
    location: interview?.location || '',
    interviewer_names: Array.isArray(interview?.interviewer_names) ? interview.interviewer_names.join(', ') : '',
    notes: '',
    preparation_notes: '',
  });

  // Reset form when interview changes
  useEffect(() => {
    if (interview) {
      setFormData({
        interview_type: interview.interview_type,
        scheduled_at: new Date(interview.scheduled_at).toISOString().slice(0, 16),
        duration_minutes: interview.duration_minutes,
        location: interview.location,
        interviewer_names: Array.isArray(interview.interviewer_names) ? interview.interviewer_names.join(', ') : '',
        notes: interview.notes || '',
        preparation_notes: interview.preparation_notes || '',
      });
      // Set the AI preparation guide if it exists, ensuring all arrays are defined
      if (interview.ai_preparation) {
        setAiPreparation({
          questions: interview.ai_preparation.questions || [],
          topics: interview.ai_preparation.topics || [],
          tips: interview.ai_preparation.tips || [],
          answers: interview.ai_preparation.answers || []
        });
      } else {
        setAiPreparation(null);
      }
    } else {
      setFormData({
        interview_type: 'phone_screening',
        scheduled_at: '',
        duration_minutes: 60,
        location: '',
        interviewer_names: '',
        notes: '',
        preparation_notes: '',
      });
      // Clear the AI preparation guide
      setAiPreparation(null);
    }
  }, [interview]);

  const generatePreparationGuide = async () => {
    if (!applicationId && !interview?.job_application_id) return;

    try {
      setIsGenerating(true);

      // First, fetch the job application details
      const { data: jobApp, error: jobError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('id', applicationId || interview?.job_application_id)
        .single();

      if (jobError) throw jobError;

      // Step 1: Extract relevant interview topics from job description
      const topicsPrompt = {
        role: "interview preparation specialist",
        task: "extract_interview_topics",
        input: {
          job_title: jobApp.job_title,
          company_name: jobApp.company_name,
          job_description: jobApp.job_description,
          interview_type: formData.interview_type
        },
        output_format: {
          type: "json",
          fields: ["technical_skills", "soft_skills", "domain_knowledge", "company_values"]
        }
      };

      const topicsResponse = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: topicsPrompt,
          type: 'extract_topics',
          temperature: 0
        })
      });

      if (!topicsResponse.ok) {
        throw new Error('Failed to extract interview topics');
      }

      const topicsData = await topicsResponse.json();
      const topics = topicsData.result;

      // Step 2: Generate interview preparation content
      const prepPrompt = {
        role: "interview coach",
        task: "prepare_interview_guide",
        context: {
          position: {
            title: jobApp.job_title,
            company: jobApp.company_name,
            type: formData.interview_type
          },
          key_areas: topics
        },
        output_requirements: {
          format: "json",
          structure: {
            questions: "Array of 5 interview questions",
            topics: "Array of 4 key topics to study",
            tips: "Array of 4 preparation tips",
            answers: "Array of 4 STAR format answers"
          },
          example: {
            "questions": [
              "What experience do you have with...?",
              "Tell me about a time when..."
            ],
            "topics": [
              "Technical skill 1",
              "Domain knowledge 1"
            ],
            "tips": [
              "Research the company",
              "Practice STAR answers"
            ],
            "answers": [
              "Example STAR answer 1",
              "Example STAR answer 2"
            ]
          }
        },
        constraints: [
          "Return ONLY arrays of strings in the specified format",
          "NO nested objects or metadata",
          "NO descriptions or additional fields",
          "Focus ONLY on interview preparation",
          "NO resume analysis"
        ]
      };

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prepPrompt,
          type: 'interview_preparation',
          format: 'strict_json',
          temperature: 0,
          response_format: {
            type: "object",
            required: ["questions", "topics", "tips", "answers"],
            properties: {
              questions: {
                type: "array",
                items: { type: "string" },
                minItems: 5,
                maxItems: 5
              },
              topics: {
                type: "array",
                items: { type: "string" },
                minItems: 4,
                maxItems: 4
              },
              tips: {
                type: "array",
                items: { type: "string" },
                minItems: 4,
                maxItems: 4
              },
              answers: {
                type: "array",
                items: { type: "string" },
                minItems: 4,
                maxItems: 4
              }
            },
            additionalProperties: false
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate preparation guide');
      }

      const data = await response.json();
      
      if (!data.result) {
        throw new Error('No preparation guide received');
      }

      let rawGuide;
      try {
        // Handle both string and object responses
        if (typeof data.result === 'string') {
          // Strip markdown code block formatting if present
          const cleanJson = data.result
            .replace(/^```json\s*/, '') // Remove opening ```json
            .replace(/```\s*$/, '')     // Remove closing ```
            .trim();                    // Remove any extra whitespace
          rawGuide = JSON.parse(cleanJson);
        } else {
          rawGuide = data.result;
        }

        console.log('Raw guide type:', typeof rawGuide);
        console.log('Received raw guide:', rawGuide);

        if (!rawGuide || typeof rawGuide !== 'object') {
          throw new Error('Invalid guide format received');
        }
      } catch (e) {
        console.error('Error parsing guide:', e);
        throw new Error('Failed to parse preparation guide');
      }

      // Extract arrays directly from the raw guide
      const guide = {
        questions: Array.isArray(rawGuide.questions) ? rawGuide.questions : [],
        topics: Array.isArray(rawGuide.topics) ? rawGuide.topics : [],
        tips: Array.isArray(rawGuide.tips) ? rawGuide.tips : [],
        answers: Array.isArray(rawGuide.answers) ? rawGuide.answers : []
      };

      console.log('Processed guide:', guide);

      // Validate arrays and their lengths
      const requirements = {
        questions: { min: 5, max: 5 },
        topics: { min: 4, max: 4 },
        tips: { min: 4, max: 4 },
        answers: { min: 4, max: 4 }
      };

      // Log the array lengths for debugging
      console.log('Array lengths:', {
        questions: guide.questions.length,
        topics: guide.topics.length,
        tips: guide.tips.length,
        answers: guide.answers.length
      });

      const validationErrors = Object.entries(requirements).reduce((errors: string[], [field, req]) => {
        const array = guide[field as keyof typeof guide];
        if (!Array.isArray(array)) {
          errors.push(`${field} is not an array`);
        } else if (array.length < req.min) {
          errors.push(`${field} has too few items (${array.length}/${req.min})`);
        } else if (array.length > req.max) {
          errors.push(`${field} has too many items (${array.length}/${req.max})`);
        }
        return errors;
      }, []);

      if (validationErrors.length > 0) {
        console.error('Validation errors:', validationErrors);
        throw new Error(`Invalid guide structure: ${validationErrors.join(', ')}`);
      }

      // All arrays are valid, create the validated guide
      const validatedGuide = {
        questions: guide.questions.slice(0, requirements.questions.max),
        topics: guide.topics.slice(0, requirements.topics.max),
        tips: guide.tips.slice(0, requirements.tips.max),
        answers: guide.answers.slice(0, requirements.answers.max)
      };

      // Check for any resume-related content
      const fullContent = JSON.stringify(validatedGuide).toLowerCase();
      if (fullContent.includes('resume') || fullContent.includes('ats') || 
          fullContent.includes('keyword match') || fullContent.includes('compatibility')) {
        throw new Error('Received resume-related content instead of interview preparation');
        }
        
        setAiPreparation(validatedGuide);
        
        // Add the preparation guide to the notes
        setFormData(prev => ({
          ...prev,
          preparation_notes: `${prev.preparation_notes ? prev.preparation_notes + '\n\n' : ''}AI-Generated Interview Preparation Guide:\n\nKey Topics to Prepare:\n${validatedGuide.topics.map((t: string) => `- ${t}`).join('\n')}\n\nPreparation Tips:\n${validatedGuide.tips.map((t: string) => `- ${t}`).join('\n')}\n\nPractice Questions:\n${validatedGuide.questions.map((q: string) => `- ${q}`).join('\n')}\n\nSample STAR Answers:\n${validatedGuide.answers.map((a: string) => `- ${a}`).join('\n')}`
        }));

        toast.success('Interview preparation guide generated');
        // Switch to preparation tab
        setActiveTab('preparation');
    } catch (error) {
      console.error('Error generating preparation guide:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate preparation guide');
      setAiPreparation(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId && !interview?.job_application_id) return;

    try {
      setIsSaving(true);

      if (!formData.scheduled_at) {
        toast.error('Please select an interview date and time');
        return;
      }

      // Convert local datetime to UTC for storage
      const localDate = new Date(formData.scheduled_at);
      const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);

      const data = {
        ...formData,
        scheduled_at: utcDate.toISOString(),
        job_application_id: applicationId || interview?.job_application_id,
        interviewer_names: formData.interviewer_names
          .split(',')
          .map((name) => name.trim())
          .filter(Boolean),
        ai_preparation: aiPreparation
      };

      if (interview) {
        // Update existing interview
        const { error } = await supabase
          .from('job_interviews')
          .update(data)
          .eq('id', interview.id);

        if (error) throw error;
        toast.success('Interview updated successfully');
      } else {
        // Create new interview
        const { error } = await supabase
          .from('job_interviews')
          .insert([data]);

        if (error) throw error;

        // Update the application status to interview_scheduled
        if (applicationId) {
          await supabase
            .from('job_applications')
            .update({ status: 'interview_scheduled' })
            .eq('id', applicationId);
        }
        toast.success('Interview scheduled successfully');
      }

      onClose();
    } catch (error) {
      console.error('Error with interview:', error);
      toast.error(interview ? 'Failed to update interview' : 'Failed to schedule interview');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Format interview type for display
  const formatInterviewType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get times for the interview - start and end
  const getInterviewTimes = () => {
    if (!formData.scheduled_at) return { startTime: '', endTime: '' };
    
    const startDate = new Date(formData.scheduled_at);
    const endDate = new Date(startDate.getTime() + formData.duration_minutes * 60000);
    
    return {
      startTime: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Get formatted date
  const getFormattedDate = () => {
    if (!formData.scheduled_at) return '';
    
    const date = new Date(formData.scheduled_at);
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const { startTime, endTime } = getInterviewTimes();
  const formattedDate = getFormattedDate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              {interview ? 'Edit Interview' : 'Schedule Interview'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {interview 
                ? 'Update your interview details and preparation notes' 
                : 'Add a new interview for this job application'}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Interview Details
              </TabsTrigger>
              <TabsTrigger value="preparation" className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4" />
                Preparation Guide
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6 pt-2">
              <form id="interview-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Interview Information Card */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Interview Information
                    </CardTitle>
                    <CardDescription>
                      Schedule and details for the upcoming interview
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="interview_type" className="text-sm font-medium">
                          Interview Type <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.interview_type}
                          onValueChange={(value) =>
                            setFormData({ ...formData, interview_type: value })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {INTERVIEW_TYPES.map((type) => (
                              <SelectItem key={type} value={type} className="flex items-center">
                                <div className="flex items-center gap-2">
                                  {typeIcons[type]}
                                  {formatInterviewType(type)}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="scheduled_at" className="text-sm font-medium">
                          Date & Time <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="scheduled_at"
                            type="datetime-local"
                            value={formData.scheduled_at}
                            onChange={(e) =>
                              setFormData({ ...formData, scheduled_at: e.target.value })
                            }
                            className="pl-9"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration_minutes" className="text-sm font-medium">
                          Duration (minutes)
                        </Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="duration_minutes"
                            type="number"
                            min="15"
                            step="15"
                            value={formData.duration_minutes}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                duration_minutes: parseInt(e.target.value),
                              })
                            }
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium">
                          Location / Meeting Link
                        </Label>
                        <div className="relative">
                          <VideoIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({ ...formData, location: e.target.value })
                            }
                            placeholder="Enter location or meeting link"
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <Label htmlFor="interviewer_names" className="text-sm font-medium">
                        Interviewer Names (comma-separated)
                      </Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="interviewer_names"
                          value={formData.interviewer_names}
                          onChange={(e) =>
                            setFormData({ ...formData, interviewer_names: e.target.value })
                          }
                          placeholder="e.g. John Smith, Jane Doe"
                          className="pl-9"
                        />
                      </div>
                    </div>
                    
                    {formData.scheduled_at && (
                      <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          Scheduled Time
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{formattedDate}</p>
                          <p className="text-muted-foreground">
                            {startTime} - {endTime} ({formData.duration_minutes} minutes)
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Notes Card */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Interview Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Add details about the interview format, what to bring, or specific topics that will be covered"
                      className="min-h-[6rem]"
                    />
                  </CardContent>
                </Card>
              </form>
            </TabsContent>
            
            <TabsContent value="preparation" className="space-y-6 pt-2">
              <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    Interview Preparation Guide
                  </CardTitle>
                  <CardDescription>
                    Get AI-powered preparation materials for your interview
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!applicationId && !interview?.job_application_id ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                      <p className="text-muted-foreground">AI preparation is available once you save the interview</p>
                    </div>
                  ) : !aiPreparation && !isGenerating ? (
                    <div className="text-center py-8">
                      <Button
                        onClick={generatePreparationGuide}
                        className="mx-auto bg-primary hover:bg-primary/90"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Guide...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Preparation Guide
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-3">
                        Our AI will suggest practice questions and preparation tips based on the job description
                      </p>
                    </div>
                  ) : isGenerating ? (
                    <div className="space-y-6 py-4">
                      <div className="flex items-center justify-center">
                        <div className="animate-pulse flex flex-col items-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                          <p className="text-muted-foreground">Analyzing job requirements and creating your guide...</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2 animate-pulse">
                          <div className="h-5 bg-muted rounded w-1/4"></div>
                          <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className="h-4 bg-muted rounded"></div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2 animate-pulse">
                          <div className="h-5 bg-muted rounded w-1/3"></div>
                          <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className="h-8 bg-muted rounded w-24"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : aiPreparation && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          Likely Interview Questions
                        </h4>
                        <div className="space-y-2.5">
                          {(aiPreparation?.questions || []).map((question, i) => (
                            <div key={i} className="p-3 bg-muted/30 rounded-md border border-muted/50 text-sm">
                              {question}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <ListChecks className="h-4 w-4 text-primary" />
                          Key Topics to Research
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(aiPreparation?.topics || []).map((topic, i) => (
                            <Badge 
                              key={i} 
                              variant="secondary"
                              className="px-3 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-none text-sm"
                            >
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Preparation Tips
                          </h4>
                          <ul className="list-disc pl-5 space-y-2">
                            {(aiPreparation?.tips || []).map((tip, i) => (
                              <li key={i} className="text-sm text-muted-foreground">{tip}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Star className="h-4 w-4 text-primary" />
                            Sample STAR Answers
                          </h4>
                          <div className="space-y-2">
                            {(aiPreparation?.answers || []).map((answer, i) => (
                              <div key={i} className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3 py-1">
                                {answer}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t bg-muted/10 flex flex-col items-start px-6 py-4">
                  <Label htmlFor="preparation_notes" className="text-sm font-medium mb-2">Your Preparation Notes</Label>
                  <Textarea
                    id="preparation_notes"
                    value={formData.preparation_notes}
                    onChange={(e) =>
                      setFormData({ ...formData, preparation_notes: e.target.value })
                    }
                    placeholder="Add your own notes for interview preparation"
                    className="min-h-[6rem] w-full"
                  />
                </CardFooter>
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
            form="interview-form"
            disabled={isSaving}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {interview ? 'Update Interview' : 'Schedule Interview'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 