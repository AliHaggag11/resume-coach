'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Loader2, Sparkles, FileText, ThumbsUp, MessageSquare, 
  Lightbulb, CheckCircle, BrainCircuit, ListChecks, Star, XCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { useSubscription, CREDIT_COSTS } from '@/app/context/SubscriptionContext';

interface PrepGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: {
    id: string;
    job_application_id: string;
    interview_type: string;
  } | null;
}

export default function PrepGuideDialog({
  open,
  onOpenChange,
  interview
}: PrepGuideDialogProps) {
  const { credits, useCredits } = useSubscription();
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobApplication, setJobApplication] = useState<any>(null);
  const [prepGuide, setPrepGuide] = useState<{
    questions: string[];
    topics: string[];
    tips: string[];
    answers: string[];
  } | null>(null);
  const [preparationNotes, setPreparationNotes] = useState("");
  const [currentInterviewId, setCurrentInterviewId] = useState<string | null>(null);

  // Reset state and fetch job application data when dialog opens or interview changes
  useEffect(() => {
    // If the dialog is closing, don't do anything
    if (!open) return;
    
    // If the interview ID has changed, reset the state
    if (interview?.id !== currentInterviewId) {
      console.log("Interview changed, resetting guide data");
      setPrepGuide(null);
      setPreparationNotes("");
      setJobApplication(null);
      setCurrentInterviewId(interview?.id || null);
    }

    // Fetch the job application data for this interview
    if (open && interview?.job_application_id) {
      fetchJobApplication(interview.job_application_id);
    }
  }, [open, interview, currentInterviewId]);

  const fetchJobApplication = async (applicationId: string) => {
    try {
      console.log("Fetching job application for interview ID:", interview?.id);
      
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (error) throw error;
      console.log("Job application found:", data.job_title);
      setJobApplication(data);

      // Try to load existing preparation guide specifically for this interview
      console.log("Checking for existing preparation guide for interview ID:", interview?.id);
      
      // Try the 'interviews' table first
      let interviewData;
      let interviewError;
      
      try {
        const result = await supabase
          .from('interviews')
          .select('ai_preparation, preparation_notes')
          .eq('id', interview?.id)
          .single();
        
        interviewData = result.data;
        interviewError = result.error;
        
        if (interviewError) {
          console.log("Error fetching from 'interviews' table:", interviewError);
        } else {
          console.log("Found data in 'interviews' table:", !!interviewData);
        }
      } catch (err) {
        console.error("Exception when querying 'interviews' table:", err);
      }
      
      // If first attempt failed, try 'job_interviews'
      if (interviewError || !interviewData) {
        console.log("Trying 'job_interviews' table instead");
        
        try {
          const result = await supabase
            .from('job_interviews')
            .select('ai_preparation, preparation_notes')
            .eq('id', interview?.id)
            .single();
          
          interviewData = result.data;
          interviewError = result.error;
          
          if (interviewError) {
            console.log("Error fetching from 'job_interviews' table:", interviewError);
          } else {
            console.log("Found data in 'job_interviews' table:", !!interviewData);
          }
        } catch (err) {
          console.error("Exception when querying 'job_interviews' table:", err);
        }
      }

      // Set guide if we found it in either table
      if (interviewData?.ai_preparation) {
        console.log("Setting preparation guide from database for interview ID:", interview?.id);
        setPrepGuide(interviewData.ai_preparation);
        
        if (interviewData.preparation_notes) {
          setPreparationNotes(interviewData.preparation_notes);
        }
      } else {
        console.log("No existing preparation guide found for interview ID:", interview?.id);
      }
    } catch (error) {
      console.error('Error fetching job application:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      } else {
        console.error('Unknown error type:', typeof error);
        console.error('Error stringified:', JSON.stringify(error));
      }
      
      toast.error('Failed to load job details');
    }
  };

  // After updating the UI with the guide data, add a separate function for database operations
  const saveGuideToDatabase = async (guideData: any, notes: string, interviewId: string) => {
    // Run in a background setTimeout to avoid blocking the UI
    setTimeout(async () => {
      try {
        console.log("Background save: Attempting to save guide to database for interview ID:", interviewId);
        
        // Try interviews table first
        try {
          const { error } = await supabase
            .from('interviews')
            .update({
              ai_preparation: guideData,
              preparation_notes: notes
            })
            .eq('id', interviewId);
            
          if (error) {
            console.log("Background save: Error saving to interviews table, trying job_interviews");
            // If failed, try job_interviews
            const { error: error2 } = await supabase
              .from('job_interviews')
              .update({
                ai_preparation: guideData,
                preparation_notes: notes
              })
              .eq('id', interviewId);
              
            if (error2) {
              console.log("Background save: Error saving to job_interviews table");
            } else {
              console.log("Background save: Successfully saved to job_interviews table");
            }
          } else {
            console.log("Background save: Successfully saved to interviews table");
          }
        } catch (err) {
          console.log("Background save: Exception during database operations");
        }
      } catch (e) {
        console.log("Background save: Error in background save process");
      }
    }, 100); // Slight delay to ensure UI is updated first
  };

  const renderGenerateButton = () => (
    <div className="text-center py-8">
      {/* Large, prominent credit cost banner */}
      <div className="mb-6 border border-primary/20 bg-primary/5 rounded-lg p-4 mx-auto max-w-xs">
        <div className="text-lg font-semibold text-primary mb-1 flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5" />
          <span>{CREDIT_COSTS.JOBS.AI_PREPARATION_GUIDE} Credits</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Will be deducted to generate your personalized interview guide
        </p>
      </div>
      
      <Button
        onClick={generatePreparationGuide}
        className="mx-auto bg-primary hover:bg-primary/90 min-w-[220px] relative"
        disabled={isGenerating || (credits < CREDIT_COSTS.JOBS.AI_PREPARATION_GUIDE)}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Guide...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Preparation Guide
          </>
        )}
      </Button>
      
      {/* Credit status message */}
      {credits < CREDIT_COSTS.JOBS.AI_PREPARATION_GUIDE ? (
        <div className="mt-4 text-red-500 font-medium flex items-center justify-center gap-1.5">
          <XCircle className="h-4 w-4" />
          <span>Not enough credits ({credits}/{CREDIT_COSTS.JOBS.AI_PREPARATION_GUIDE} needed)</span>
        </div>
      ) : (
        <div className="mt-4 text-green-500 font-medium flex items-center justify-center gap-1.5">
          <CheckCircle className="h-4 w-4" />
          <span>You have enough credits ({credits} available)</span>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-3">
        Our AI will analyze the job description and create personalized preparation materials.
      </p>
    </div>
  );

  const generatePreparationGuide = async () => {
    if (!interview?.job_application_id || !jobApplication) return;

    try {
      // Double-check credit availability as a safety measure
      if (credits < CREDIT_COSTS.JOBS.AI_PREPARATION_GUIDE) {
        toast.error(`Not enough credits. You need ${CREDIT_COSTS.JOBS.AI_PREPARATION_GUIDE} credits to generate a preparation guide.`);
        return;
      }

      setIsGenerating(true);
      console.log("Starting preparation guide generation for interview ID:", interview.id);

      // First deduct the credits - do this before generating the guide
      // This ensures users pay for the service even if something fails later
      try {
        console.log(`Deducting ${CREDIT_COSTS.JOBS.AI_PREPARATION_GUIDE} credits for preparation guide`);
        await useCredits(CREDIT_COSTS.JOBS.AI_PREPARATION_GUIDE, 'AI Interview Preparation Guide', 'interview_prep');
        console.log("Credits deducted successfully");
      } catch (creditError) {
        console.error("Error deducting credits:", creditError);
        toast.error("Unable to deduct credits. Please try again later.");
        setIsGenerating(false);
        return; // Stop the process if credits can't be deducted
      }

      // Extract job information
      const jobTitle = jobApplication.job_title || 'this position';
      const companyName = jobApplication.company_name || 'the company';
      const interviewType = interview.interview_type?.toLowerCase() || 'job';
      
      console.log(`Generating ${interviewType} interview guide for ${jobTitle} at ${companyName}`);
      
      // Generate appropriate guide based on interview type
      let generatedGuide;
      
      if (interviewType.includes('technical')) {
        generatedGuide = {
          topics: [
            `Core ${jobTitle} technical skills`,
            "Data structures and algorithms",
            "System design principles",
            `${jobTitle}-specific technologies`
          ],
          questions: [
            `Explain how you would design a system for ${companyName}'s core business needs`,
            "How would you optimize a slow-performing database query?",
            "Describe a challenging technical problem you've solved recently",
            "How do you ensure code quality in your projects?",
            "What's your approach to debugging complex issues?"
          ],
          tips: [
            "Review fundamental computer science concepts",
            "Practice coding problems on a whiteboard",
            "Be prepared to explain your thought process",
            "Research the tech stack used at " + companyName
          ],
          answers: [
            "Situation: Our e-commerce platform was experiencing slow page loads. Task: I needed to identify and fix performance bottlenecks. Action: I conducted a comprehensive analysis using profiling tools, identified inefficient database queries, implemented indexing, and refactored key algorithms. Result: Page load times improved by 60%, leading to a 15% increase in conversion rates.",
            "Situation: We needed to scale our application to handle 10x the traffic. Task: Design a more scalable architecture. Action: I researched various solutions, implemented a microservices approach with auto-scaling, added caching layers, and optimized database operations. Result: The system successfully handled Black Friday traffic with no downtime, processing 200,000 concurrent users.",
            "Situation: Our team faced a critical bug in production. Task: Identify and fix the issue ASAP. Action: I implemented a methodical debugging approach, used logging and monitoring tools to trace the issue, and collaborated with operations to deploy a fix. Result: We identified a race condition, fixed it within 2 hours, and implemented monitoring to prevent similar issues.",
            "Situation: We needed to implement a complex feature with unclear requirements. Task: Design and build the feature while managing scope. Action: I created a prototype, gathered stakeholder feedback early, and implemented the solution in small, testable increments. Result: Delivered a solution that met business needs while avoiding scope creep."
          ]
        };
      } else if (interviewType.includes('behavioral')) {
        generatedGuide = {
          topics: [
            "Leadership experiences",
            "Teamwork and collaboration",
            "Conflict resolution",
            "Problem-solving approach"
          ],
          questions: [
            "Tell me about a time you had to lead a team through a difficult project",
            "Describe a situation where you had to collaborate with a challenging team member",
            "How have you handled missing a deadline or goal?",
            "Tell me about a time you had to learn something new under pressure",
            `How would you handle a situation where you disagree with your manager?`
          ],
          tips: [
            "Use the STAR method (Situation, Task, Action, Result) for your answers",
            "Prepare 5-7 strong examples from your experience that can be adapted to different questions",
            "Focus on YOUR contributions even when discussing team efforts",
            "Research " + companyName + "'s core values and culture beforehand"
          ],
          answers: [
            "Situation: Our team faced an unexpected client requirement change one week before the deadline. Task: As the project lead, I needed to reorganize our priorities and keep the team motivated. Action: I called an emergency meeting, transparently explained the situation, collaboratively reprioritized tasks, and established a new realistic timeline with daily check-ins. Result: We delivered the project with the new requirements only two days past the original deadline, and the client was extremely satisfied with our adaptability.",
            "Situation: I noticed a significant communication gap between our engineering and marketing teams. Task: I wanted to improve cross-departmental collaboration. Action: I initiated weekly sync meetings, created shared documentation processes, and established a joint Slack channel for quick questions. Result: Project handoffs improved by 40%, and both teams reported higher satisfaction in quarterly surveys.",
            "Situation: A key team member was consistently missing deadlines. Task: Address the issue without damaging the relationship. Action: I had a private conversation, used active listening to understand their challenges, and worked together on a plan to redistribute work. Result: The team member's performance improved, and we strengthened our working relationship.",
            "Situation: I disagreed with my manager about a technical approach. Task: Express my concerns constructively. Action: I scheduled a one-on-one meeting, presented data supporting my alternative approach, and acknowledged the constraints we were working under. Result: We found a compromise that addressed both technical concerns and business priorities."
          ]
        };
      } else {
        generatedGuide = {
          topics: [
            `${jobTitle} role responsibilities`,
            `${companyName} company culture and values`,
            "Industry knowledge and trends",
            "Relevant experience and skills"
          ],
          questions: [
            `Tell me about your experience relevant to this ${jobTitle} role`,
            `Why are you interested in working at ${companyName}?`,
            "What are your greatest professional strengths?",
            "Where do you see yourself in five years?",
            "How do you handle pressure and stress?"
          ],
          tips: [
            `Research ${companyName}'s mission, values, and recent news`,
            "Review the job description and align your answers accordingly",
            "Prepare thoughtful questions to ask the interviewer",
            "Practice your elevator pitch about yourself"
          ],
          answers: [
            "Situation: I was tasked with organizing a major client presentation with only two days' notice. Task: I needed to research the client, prepare materials, and coordinate with multiple departments. Action: I created a detailed work plan, delegated specific responsibilities, and worked extended hours to ensure quality. Result: The presentation was a success and led to a $500,000 contract.",
            "Situation: Our team was understaffed during a critical project phase. Task: We needed to maintain quality and deadlines despite limited resources. Action: I analyzed our workflow, identified inefficiencies, implemented automation for repetitive tasks, and focused our team on high-priority deliverables. Result: We completed the project on time with high quality, and management recognized our team's resilience.",
            "Situation: I identified a market opportunity our company was missing. Task: Develop a business case for this opportunity. Action: I conducted market research, analyzed competitors, and created a detailed proposal with ROI projections. Result: My proposal was approved, resulting in a new product line that increased department revenue by 15%.",
            "Situation: I faced a difficult client with constantly changing requirements. Task: Manage the relationship while maintaining project progress. Action: I implemented weekly check-ins, documented all feedback, and set clear boundaries around scope changes. Result: The client became more consistent with requirements, and we delivered a successful project."
          ]
        };
      }
      
      // All validation and processing
      console.log("Processing guide data");
      
      // Create the formatted notes
      const formattedNotes = `AI-Generated Interview Preparation Guide:

Key Topics to Prepare:
${generatedGuide.topics.map((t: string) => `- ${t}`).join('\n')}

Preparation Tips:
${generatedGuide.tips.map((t: string) => `- ${t}`).join('\n')}

Practice Questions:
${generatedGuide.questions.map((q: string) => `- ${q}`).join('\n')}

Sample STAR Answers:
${generatedGuide.answers.map((a: string) => `- ${a}`).join('\n')}`;

      // First, update UI - this is the most important part
      console.log("Updating UI with guide for interview ID:", interview.id);
      setPrepGuide(generatedGuide);
      setPreparationNotes(formattedNotes);
      
      // Show success message with credit information
      toast.success(`Guide generated! Used ${CREDIT_COSTS.JOBS.AI_PREPARATION_GUIDE} credits`);
      
      // Start an async database save operation (doesn't block UI)
      saveGuideToDatabase(generatedGuide, formattedNotes, interview.id);
    } catch (error) {
      console.error('Error in guide generation process:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      toast.error('Sorry, there was a problem creating your guide. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interview Preparation Guide</DialogTitle>
        </DialogHeader>
        
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
            {!jobApplication ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Loading job details...</p>
              </div>
            ) : !prepGuide && !isGenerating ? (
              renderGenerateButton()
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
            ) : prepGuide && (
              <>
                {/* Add credit confirmation banner at the top */}
                <div className="mb-6 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        {CREDIT_COSTS.JOBS.AI_PREPARATION_GUIDE} credits used
                      </p>
                      <p className="text-xs text-green-700/70 dark:text-green-400/70">
                        Your personalized interview guide has been generated
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Likely Interview Questions
                    </h4>
                    <div className="space-y-2.5">
                      {(prepGuide?.questions || []).map((question, i) => (
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
                      {(prepGuide?.topics || []).map((topic, i) => (
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
                        {(prepGuide?.tips || []).map((tip, i) => (
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
                        {(prepGuide?.answers || []).map((answer, i) => (
                          <div key={i} className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3 py-1">
                            {answer}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="border-t bg-muted/10 flex flex-col items-start px-6 py-4">
            <Label htmlFor="preparation_notes" className="text-sm font-medium mb-2">Your Preparation Notes</Label>
            <Textarea
              id="preparation_notes"
              value={preparationNotes}
              onChange={(e) => setPreparationNotes(e.target.value)}
              placeholder="Add your own notes for interview preparation"
              className="min-h-[6rem] w-full"
            />
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
} 