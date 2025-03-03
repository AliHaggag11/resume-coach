'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
import { Loader2, BrainCircuit, Sparkles, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      // Set the AI preparation guide if it exists
      setAiPreparation(interview.ai_preparation || null);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:p-6 p-4">
        <DialogHeader>
          <DialogTitle>{interview ? 'Edit Interview' : 'Schedule Interview'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interview_type">Interview Type *</Label>
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
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').charAt(0).toUpperCase() +
                        type.replace('_', ' ').slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Date & Time *</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_at: e.target.value })
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
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
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location / Meeting Link</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Enter location or meeting link"
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interviewer_names">
              Interviewer Names (comma-separated)
            </Label>
            <Input
              id="interviewer_names"
              value={formData.interviewer_names}
              onChange={(e) =>
                setFormData({ ...formData, interviewer_names: e.target.value })
              }
              placeholder="e.g. John Smith, Jane Doe"
              className="w-full"
            />
          </div>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5" />
                Interview Preparation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generatePreparationGuide}
                  disabled={isGenerating || !applicationId}
                  className="group w-full sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Preparation Guide
                    </>
                  )}
                </Button>
              </div>

              {isGenerating ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </div>
              ) : aiPreparation && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Practice Questions</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {aiPreparation.questions.map((question, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{question}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Key Topics to Research</h4>
                    <div className="flex flex-wrap gap-2">
                      {aiPreparation.topics.map((topic, i) => (
                        <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Preparation Tips</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {aiPreparation.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Sample STAR Answers</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {aiPreparation.answers.map((answer, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{answer}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="notes">Interview Details</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any details about the interview"
              className="min-h-[6rem] w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preparation_notes">Preparation Notes</Label>
            <Textarea
              id="preparation_notes"
              value={formData.preparation_notes}
              onChange={(e) =>
                setFormData({ ...formData, preparation_notes: e.target.value })
              }
              placeholder="Add notes for interview preparation"
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
              {interview ? 'Update Interview' : 'Schedule Interview'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 