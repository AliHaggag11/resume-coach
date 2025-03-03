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
        notes: '',
        preparation_notes: '',
      });
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

      const prompt = {
        jobTitle: jobApp.job_title,
        companyName: jobApp.company_name,
        jobDescription: jobApp.job_description,
        interviewType: formData.interview_type,
        type: 'interview_preparation',
        context: `Generate an interview preparation guide in the exact format specified below. Return ONLY the JSON structure shown - no other text or formatting.

{
  "questions": ["question1", "question2", "question3", "question4", "question5"],
  "tips": ["tip1", "tip2", "tip3", "tip4"],
  "topics": ["topic1", "topic2", "topic3", "topic4"],
  "answers": ["answer1", "answer2", "answer3", "answer4"]
}

Instructions:
1. questions: Generate 5 specific interview questions for this role and stage
2. tips: Provide 4 preparation tips for this interview type
3. topics: List 4 key topics to research and prepare
4. answers: Write 4 example STAR-format answers

Keep all responses concise and focused on interview preparation.`
      };

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'analyze' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to generate preparation guide');
      }

      const data = await response.json();
      
      if (!data.result) {
        throw new Error('No preparation guide received');
      }

      try {
        // Clean the result string by removing markdown code blocks if present
        const cleanResult = data.result
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        const guide = JSON.parse(cleanResult);
        
        // Log the parsed response for debugging
        console.log('Parsed AI response:', guide);
        
        // Check if we got the wrong format
        if (guide.atsCompatibility || guide.impactStatements || guide.keywordsMatch) {
          // We received resume analysis format instead of interview guide
          toast.error('Received incorrect guide format. Please try again.');
          return;
        }
        
        // Initialize default arrays if missing
        const validatedGuide = {
          questions: Array.isArray(guide.questions) ? guide.questions.slice(0, 5) : [],
          tips: Array.isArray(guide.tips) ? guide.tips.slice(0, 4) : [],
          topics: Array.isArray(guide.topics) ? guide.topics.slice(0, 4) : [],
          answers: Array.isArray(guide.answers) ? guide.answers.slice(0, 4) : []
        };

        // Validate that we have at least some data
        if (validatedGuide.questions.length === 0 &&
            validatedGuide.tips.length === 0 &&
            validatedGuide.topics.length === 0 &&
            validatedGuide.answers.length === 0) {
          throw new Error('No valid guide data received');
        }
        
        setAiPreparation(validatedGuide);
        
        // Add the preparation guide to the notes
        setFormData(prev => ({
          ...prev,
          preparation_notes: `${prev.preparation_notes ? prev.preparation_notes + '\n\n' : ''}AI-Generated Interview Preparation Guide:\n\nKey Topics to Prepare:\n${validatedGuide.topics.map((t: string) => `- ${t}`).join('\n')}\n\nPreparation Tips:\n${validatedGuide.tips.map((t: string) => `- ${t}`).join('\n')}\n\nPractice Questions:\n${validatedGuide.questions.map((q: string) => `- ${q}`).join('\n')}\n\nSample STAR Answers:\n${validatedGuide.answers.map((a: string) => `- ${a}`).join('\n')}`
        }));

        toast.success('Interview preparation guide generated');
      } catch (parseError) {
        console.error('Failed to parse guide:', parseError);
        console.error('Raw result:', data.result);
        throw new Error('Failed to process preparation guide. Please try again.');
      }
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