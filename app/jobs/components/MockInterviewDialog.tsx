'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, Send, Bot, User, Clock, BrainCircuit, CheckCircle2, 
  XCircle, RefreshCcw, MessageSquare, Sparkles, Brain 
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/context/AuthContext';
import { useSubscription, CREDIT_COSTS } from '@/app/context/SubscriptionContext';

interface MockInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: {
    id: string;
    job_application_id: string;
    interview_type: string;
    ai_preparation?: {
      questions: string[];
      topics: string[];
    };
    interviewer_names?: string[];
  };
  jobDetails: {
    company_name: string;
    job_title: string;
    job_description: string;
  };
}

interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
  thinking_time?: number; // Time taken to respond in seconds
  analysis?: {
    clarity: number;
    relevance: number;
    depth: number;
    confidence: number;
    feedback: string;
  };
}

interface InterviewState {
  stage: 'intro' | 'technical' | 'behavioral' | 'closing';
  progress: number;
  current_topic?: string;
  remaining_questions: number;
  time_elapsed: number;
}

interface AnalysisScores {
  clarity: number;
  relevance: number;
  depth: number;
  confidence: number;
}

interface AnalysisResponse {
  scores: AnalysisScores;
  feedback: string;
}

// Add new interface for summary scores
interface PerformanceSummary {
  averageScores: {
    clarity: number;
    relevance: number;
    depth: number;
    confidence: number;
    overall: number;
  };
  responseCount: number;
  strengths: string[];
  improvements: string[];
  completionTime: number;
}

type Stage = 'intro' | 'technical' | 'behavioral' | 'closing';

export default function MockInterviewDialog({
  open,
  onOpenChange,
  interview,
  jobDetails,
}: MockInterviewDialogProps) {
  const { user } = useAuth();
  const { credits, useCredits, refreshCredits } = useSubscription();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [creditsAlreadyUsed, setCreditsAlreadyUsed] = useState(false);
  const [interviewState, setInterviewState] = useState<InterviewState>({
    stage: 'intro',
    progress: 0,
    remaining_questions: 0,
    time_elapsed: 0
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [thinkStartTime, setThinkStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'chat' | 'performance'>('chat');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  // Load saved interview session from Supabase when dialog opens
  useEffect(() => {
    if (open && user?.id) {
      loadInterviewSession();
    }
  }, [open, interview.id, user?.id]);
  
  // Function to load interview session from Supabase
  const loadInterviewSession = async () => {
    if (!user?.id || !interview.id) return;
    
    try {
      const { data, error } = await supabase
        .from('mock_interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('interview_id', interview.id)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // Not found error code
          console.error('Error loading interview session:', error);
        }
        // If no session found or error, initialize a fresh session
        initializeFreshSession();
        setCreditsAlreadyUsed(false); // New session, credits not used yet
        return;
      }
      
      if (data) {
        try {
          // Parse the saved session data
          const sessionData = data.session_data;
          setMessages(sessionData.messages || []);
          setInterviewState(sessionData.interviewState || {
            stage: 'intro',
            progress: 0,
            remaining_questions: 0,
            time_elapsed: sessionData.time_elapsed || 0
          });
          setStartTime(sessionData.startTime ? new Date(sessionData.startTime).getTime() : null);
          setIsInterviewComplete(sessionData.isInterviewComplete || false);
          setPerformanceSummary(sessionData.performanceSummary || null);
          setViewMode(sessionData.viewMode || 'chat');
          
          // Set credits already used flag
          setCreditsAlreadyUsed(true);
          
          // Only start timer if interview was in progress and not complete
          if (sessionData.startTime && !sessionData.isInterviewComplete) {
            startTimer();
          }
        } catch (err) {
          console.error('Error parsing saved interview session:', err);
          // If there's an error parsing, initialize a fresh session
          initializeFreshSession();
          setCreditsAlreadyUsed(false);
        }
      } else {
        // No saved session found, initialize a fresh one
        initializeFreshSession();
        setCreditsAlreadyUsed(false);
      }
    } catch (err) {
      console.error('Error loading interview session:', err);
      initializeFreshSession();
      setCreditsAlreadyUsed(false);
    }
  };
  
  // Save session to Supabase whenever relevant state changes
  useEffect(() => {
    const saveSession = async () => {
      if (user?.id && interview.id && (messages.length > 0 || interviewState.progress > 0)) {
        // Prevent rapid consecutive saves
        if (isSaving) return;
        
        setIsSaving(true);
        
        const sessionData = {
          messages,
          interviewState,
          startTime: startTime ? new Date(startTime).toISOString() : null,
          isInterviewComplete,
          performanceSummary,
          viewMode,
          creditsAlreadyUsed
        };
        
        try {
          // Upsert the session data
          const { error } = await supabase
            .from('mock_interview_sessions')
            .upsert({
              user_id: user.id,
              interview_id: interview.id,
              company_name: jobDetails.company_name,
              job_title: jobDetails.job_title,
              interview_type: interview.interview_type,
              session_data: sessionData,
              last_updated: new Date().toISOString()
            }, { onConflict: 'user_id,interview_id' });
          
          if (error) {
            console.error('Error saving interview session:', error);
          }
        } catch (err) {
          console.error('Exception saving interview session:', err);
        } finally {
          setIsSaving(false);
        }
      }
    };
    
    // Debounce saving to avoid too many database writes
    const debounceTimer = setTimeout(() => {
      saveSession();
    }, 1000);
    
    return () => clearTimeout(debounceTimer);
  }, [messages, interviewState, startTime, isInterviewComplete, performanceSummary, viewMode, interview.id, user?.id, jobDetails]);
  
  // Function to reset the interview
  const resetInterview = async () => {
    if (!user?.id || !interview.id) return;
    
    try {
      // Delete the session from Supabase
      const { error } = await supabase
        .from('mock_interview_sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('interview_id', interview.id);
      
      if (error) {
        console.error('Error deleting interview session:', error);
        toast.error('Failed to reset interview session');
        return;
      }
      
      // Initialize fresh session
      initializeFreshSession();
      setCreditsAlreadyUsed(false);
      
      // Show success toast
      toast.success('Interview session reset successfully');
    } catch (err) {
      console.error('Exception resetting interview:', err);
      toast.error('An error occurred while resetting the interview');
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect((): void => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Track interview duration
  useEffect(() => {
    if (startTime && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setInterviewState(prev => ({
          ...prev,
          time_elapsed: Math.floor((Date.now() - startTime) / 1000)
        }));
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime]);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format interview type for display
  const formatInterviewType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Start the interview
  const startInterview = async () => {
    // Verify actual credit status before proceeding
    let actualCreditStatus = false;
    let creditsJustDeducted = false; // Track if we just deducted credits in this execution

    if (user?.id) {
      try {
        // Get the current credit balance directly from the database
        const { data: creditData, error: creditError } = await supabase
          .from('user_credits')
          .select('credits')
          .eq('user_id', user.id)
          .single();
          
        if (creditError) {
          console.error('Error fetching credit balance:', creditError);
        } else if (creditData) {
          // Update flag based on whether we have enough credits
          actualCreditStatus = creditData.credits >= CREDIT_COSTS.JOBS.PRACTICE_WITH_AI;
          console.log(`Verified credit balance: ${creditData.credits} credits available`);
        }
      } catch (err) {
        console.error('Exception checking credit balance:', err);
      }
    }
    
    // Check if credits have already been used or if we need to deduct new credits
    if (!creditsAlreadyUsed) {
      // Verify we have enough credits (using most up-to-date info from DB)
      if (credits < CREDIT_COSTS.JOBS.PRACTICE_WITH_AI || !actualCreditStatus) {
        toast.error(`Not enough credits. You need ${CREDIT_COSTS.JOBS.PRACTICE_WITH_AI} credits to start an AI interview practice session.`);
        return;
      }
      
      // Deduct credits
      console.log(`Attempting to deduct ${CREDIT_COSTS.JOBS.PRACTICE_WITH_AI} credits...`);
      const success = await useCredits(
        CREDIT_COSTS.JOBS.PRACTICE_WITH_AI, 
        'AI Interview Practice', 
        `${jobDetails.company_name} ${interview.interview_type} Interview Practice`
      );
      
      if (!success) {
        console.error('Failed to deduct credits');
        toast.error('Failed to process credits. Please try again.');
        return;
      }
      
      console.log('Credits deducted successfully');
      // Set flag to indicate credits have been used
      setCreditsAlreadyUsed(true);
      creditsJustDeducted = true; // Local variable for this execution
    } else {
      console.log('Credits already used, continuing with existing session');
    }
    
    setIsLoading(true);
    setStartTime(Date.now());
    try {
      const interviewerName = interview.interviewer_names?.[0] || 'Your Interviewer';
      const prompt = {
        type: 'interview_simulation',
        format: 'conversation',
        context: {
          jobTitle: jobDetails.job_title,
          companyName: jobDetails.company_name,
          jobDescription: jobDetails.job_description,
          interviewType: interview.interview_type,
          stage: 'intro',
          interviewStyle: 'conversational',
          persona: {
            name: interviewerName,
            role: 'Senior Technical Interviewer',
            style: 'professional but friendly',
            years_experience: 8
          }
        },
        instructions: `You are ${interviewerName}, a Senior Technical Interviewer at ${jobDetails.company_name} conducting a ${interview.interview_type} interview.

CRITICAL RULES:
1. YOU MUST ACT AS THE INTERVIEWER, NOT THE CANDIDATE
2. DO NOT WRITE OR GENERATE RESUMES
3. DO NOT PROVIDE RESUME TEMPLATES
4. DO NOT GIVE CAREER ADVICE
5. STAY IN CHARACTER AS ${interviewerName}

Your first message must follow this format exactly:
"Hi, I'm ${interviewerName}, Senior Technical Interviewer at ${jobDetails.company_name}. Thank you for joining us today for this ${interview.interview_type} interview for the ${jobDetails.job_title} position.

I'll be asking you questions about your experience and interest in this role. We'll start with some general questions, then move into more specific technical discussions.

To begin, could you tell me what attracted you to this position at ${jobDetails.company_name}?"

Remember:
- You are the interviewer (${interviewerName})
- Ask ONE question at a time
- Wait for the candidate's response
- Keep your responses under 3 sentences
- Never break character`
      };

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompt,
          type: 'mock_interview',
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start interview');
      }

      const data = await response.json();
      
      // Check if response looks like a resume template (misaligned AI response)
      const aiMessage = data.result;
      
      // More comprehensive check for resume patterns
      const resumeKeywords = [
        "**Summary**", "**Experience**", "**Skills**", "**Education**", 
        "**Projects**", "**Awards**", "**Contact**", "[Your", "Resume", 
        "CV", "curriculum vitae"
      ];
      
      const boldPatternCount = (aiMessage.match(/\*\*[A-Za-z0-9\s]+\*\*/g) || []).length;
      const keywordMatches = resumeKeywords.filter(keyword => 
        aiMessage.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // Log detection for debugging
      console.log("AI Response Analysis:", {
        boldPatternCount,
        keywordMatches,
        messageLength: aiMessage.length,
        firstLine: aiMessage.split('\n')[0]
      });
      
      // Consider it a resume template if:
      // 1. Has 3+ section headers (bold patterns) OR
      // 2. Contains 2+ resume-specific keywords OR
      // 3. Contains "[Your" placeholder text
      const isResumeTemplate = 
        boldPatternCount >= 3 || 
        keywordMatches.length >= 2 ||
        aiMessage.includes("[Your");
      
      if (isResumeTemplate) {
        // Basic logging for resume detection
        console.log('Resume template detected instead of interview');
        
        // Show user feedback
        toast.error('AI generated a resume instead of an interview. Processing refund...', { 
          id: 'refund-toast',
          duration: 5000 
        });
        
        // CHECK if we just deducted credits in this execution
        if ((creditsAlreadyUsed || creditsJustDeducted) && user?.id) {
          try {
            // Get current credit balance
            const { data: userCredits, error: creditError } = await supabase
              .from('user_credits')
              .select('credits')
              .eq('user_id', user.id)
              .single();
            
            if (creditError) {
              throw new Error('Failed to get credit balance');
            }
            
            const currentCredits = userCredits?.credits || 0;
            
            // Update credit balance
            const newBalance = currentCredits + CREDIT_COSTS.JOBS.PRACTICE_WITH_AI;
            const { error: updateError } = await supabase
              .from('user_credits')
              .update({ credits: newBalance })
              .eq('user_id', user.id);
              
            if (updateError) {
              throw new Error('Failed to update credit balance');
            }
            
            // Log transaction
            await supabase
              .from('credit_transactions')
              .insert({
                user_id: user.id,
                amount: CREDIT_COSTS.JOBS.PRACTICE_WITH_AI,
                transaction_type: 'DIRECT_REFUND',
                description: 'AI interview error refund - resume template generated',
                credits_before: currentCredits,
                credits_after: newBalance
              });
              
            // Success - update state and notify user
            setCreditsAlreadyUsed(false);
            
            toast.success(`Credits refunded successfully!`, { 
              id: 'refund-toast', 
              duration: 3000
            });
            
            // Refresh just the credits display instead of the whole page
            setTimeout(() => {
              refreshCredits();
            }, 1500);
            
          } catch (error) {
            // Handle any errors
            console.error('Error during refund:', error);
            
            toast.error(
              'Refund failed. Please contact support for assistance.', 
              { id: 'refund-toast', duration: 8000 }
            );
          }
        } else {
          toast.info('No credits were deducted for this session.', { 
            id: 'refund-toast' 
          });
        }
        
        // Reset state
        initializeFreshSession();
        setIsLoading(false);
        return;
      }
      
      // Add system message about interview format
      setMessages([
        {
          role: 'system',
          content: `${interview.interview_type.toUpperCase()} Interview for ${jobDetails.job_title} position at ${jobDetails.company_name}`
        },
        { role: 'assistant', content: data.result }
      ]);
      
      setInterviewState(prev => ({
        ...prev,
        stage: 'intro',
        progress: 10
      }));
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start mock interview');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending a message
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setThinkStartTime(Date.now());
    
    // Add user message immediately
    setMessages(prev => [...prev, { 
      role: 'user',
      content: userMessage,
      thinking_time: thinkStartTime ? Math.round((Date.now() - thinkStartTime) / 1000) : undefined
    }]);
    
    setIsLoading(true);

    try {
      // First analyze the response
      const analysisPrompt = {
        type: 'response_analysis',
        format: 'structured',
        context: {
          response: userMessage,
          question: messages[messages.length - 1]?.content || '',
          stage: interviewState.stage
        },
        instructions: `Analyze this interview response. You MUST return a JSON object in this EXACT format:

{
  "scores": {
    "clarity": 85,
    "relevance": 92,
    "depth": 78,
    "confidence": 88
  },
  "feedback": "Clear explanation of technical skills, but could provide more specific examples of project outcomes."
}

CRITICAL RULES:
1. Return ONLY the JSON object shown above
2. The "scores" object MUST contain all four scores
3. Each score MUST be a number between 0-100
4. Never use 70 as a default score
5. The "feedback" MUST be a string with both a strength and area for improvement
6. Do not add any text before or after the JSON
7. Do not use markdown formatting
8. Do not modify the structure of the JSON

Score meanings:
- clarity: How well-organized and easy to understand (structure, flow)
- relevance: How well it answers the specific question asked
- depth: Level of detail and specific examples provided
- confidence: Communication style and professional presence

Example responses:

GOOD:
{
  "scores": {
    "clarity": 85,
    "relevance": 92,
    "depth": 78,
    "confidence": 88
  },
  "feedback": "Excellent description of the system architecture, but should include more metrics about performance improvements."
}

BAD (DO NOT DO THIS):
\`\`\`json
{
  "analysis": {  // Wrong structure
    "clarity": 70,  // Don't use 70
    "relevance": 70,  // Don't use same scores
    "depth": 70,
    "confidence": 70
  }
}
\`\`\`

Remember: The response MUST be a valid JSON object with exactly the structure shown.`
      };

      const analysisResponse = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: analysisPrompt, type: 'analyze' }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze response');
      }

      const analysisData = await analysisResponse.json();
      console.log('Raw API Response:', analysisData);

      let analysis = {
        clarity: 0,
        relevance: 0,
        depth: 0,
        confidence: 0,
        feedback: "Analyzing response..."
      };

      try {
        const result = analysisData.result;
        console.log('Raw Analysis Result:', result);
        
        // Check for empty or invalid response first
        if (!result || (typeof result === 'object' && Object.keys(result).length === 0)) {
          throw new Error('Empty response from AI. Please try again with a different response.');
        }
        
        // Parse the response
        let parsedResponse: AnalysisResponse;
        
        if (typeof result === 'string') {
          // Clean the string of any markdown or extra formatting
          const cleanJson = result
            .replace(/```json\s*|\s*```/g, '')  // Remove code blocks
            .replace(/[\r\n]+/g, '') // Remove newlines
            .replace(/\/\/.*/g, '')  // Remove comments
            .trim();
          
          console.log('Cleaned JSON:', cleanJson);
          try {
            parsedResponse = JSON.parse(cleanJson);
          } catch (error) {
            const parseError = error as Error;
            console.error('JSON Parse Error:', parseError);
            console.error('Failed JSON string:', cleanJson);
            throw new Error('Invalid response format. Please rephrase your answer and try again.');
          }
        } else if (typeof result === 'object' && result !== null) {
          parsedResponse = result as AnalysisResponse;
        } else {
          throw new Error('Unexpected response format. Please try again.');
        }

        console.log('Parsed Response:', parsedResponse);

        // Validate structure with detailed error messages
        if (!parsedResponse.scores && !parsedResponse.feedback) {
          throw new Error('Response is missing both scores and feedback. Please try rephrasing your answer.');
        }
        
        if (!parsedResponse.scores) {
          throw new Error('Response is missing scores. Please try rephrasing your answer to be more specific.');
        }
        
        if (!parsedResponse.feedback) {
          throw new Error('Response is missing feedback. Please try providing more details in your answer.');
        }

        // Validate scores with fallback values for recovery
        const scores = parsedResponse.scores;
        const scoreFields: (keyof AnalysisScores)[] = ['clarity', 'relevance', 'depth', 'confidence'];
        
        // Check for missing fields with recovery
        const missingFields = scoreFields.filter(field => !(field in scores));
        if (missingFields.length > 0) {
          // Use fallback values for missing fields
          missingFields.forEach(field => {
            scores[field] = 75; // Reasonable fallback
          });
          console.warn('Missing score fields, using fallbacks for:', missingFields);
        }

        // Validate each score with recovery
        scoreFields.forEach(field => {
          const score = Number(scores[field]);
          if (isNaN(score) || score < 0 || score > 100) {
            scores[field] = 75; // Fallback for invalid scores
            console.warn(`Invalid ${field} score: ${score}, using fallback`);
          }
        });

        // Count how many scores are exactly 70
        const seventyScores = scoreFields.filter(field => scores[field] === 70);
        
        // Check for patterns that suggest default values
        if (seventyScores.length >= 3) {
          console.warn('Multiple default scores detected, but proceeding with analysis');
        }

        // Check if all scores are the same
        const uniqueScores = new Set(scoreFields.map(field => scores[field]));
        if (uniqueScores.size === 1) {
          console.warn('All scores are identical - this suggests default values');
        }

        // Validate feedback with fallback
        let feedback = parsedResponse.feedback;
        if (typeof feedback !== 'string' || !feedback.trim()) {
          feedback = "Your response was received. Consider adding more specific details and examples in your next response.";
        }

        // If feedback doesn't include both strength and improvement, append generic improvement
        if (!feedback.includes(',') && !feedback.includes('but')) {
          feedback += ". However, consider providing more specific examples in your next response.";
        }

        // Update analysis with validated/recovered values
        analysis = {
          clarity: scores.clarity,
          relevance: scores.relevance,
          depth: scores.depth,
          confidence: scores.confidence,
          feedback: feedback
        };

        console.log('Final Analysis:', analysis);

      } catch (error) {
        console.error('Analysis Error:', error);
        // Create more informative error feedback with recovery
        analysis = {
          clarity: 60,
          relevance: 60,
          depth: 60,
          confidence: 60,
          feedback: `We encountered an issue analyzing your response: ${error instanceof Error ? error.message : 'Unknown error'}. Try these tips:
1. Be more specific in your answer
2. Provide concrete examples
3. Structure your response clearly`
        };
        
        // Show a more helpful toast message
        toast.error('Had trouble analyzing your response. Try rephrasing with more specific details.');
      }

      // Update the last message with analysis
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'user') {
          lastMessage.analysis = analysis;
        }
        return newMessages;
      });

      // Determine next interview stage and progress
      let nextStage = interviewState.stage;
      let progress = interviewState.progress;
      let remainingQuestions = interviewState.remaining_questions;

      // Only decrement questions and update progress if we're not in closing stage
      if (nextStage !== 'closing') {
        remainingQuestions = Math.max(0, remainingQuestions - 1);
        
        // Update stage based on remaining questions
        if (nextStage === 'intro' && remainingQuestions <= 6) {
          nextStage = 'technical';
          progress = Math.min(progress + 20, 45);
        } else if (nextStage === 'technical' && remainingQuestions <= 3) {
          nextStage = 'behavioral';
          progress = Math.min(progress + 20, 75);
        } else if (nextStage === 'behavioral' && remainingQuestions <= 1) {
          nextStage = 'closing' as Stage;
          progress = Math.min(progress + 20, 95);
        } else {
          // Increment progress within current stage
          progress = Math.min(progress + 15, nextStage === ('closing' as Stage) ? 100 : 95);
        }
      } else {
        // In closing stage, increment faster
        progress = Math.min(progress + 20, 100);
      }

      // Show completion message when progress is 100%
      const isComplete = progress >= 100;

      // Get interviewer's next response
      const interviewerName = interview.interviewer_names?.[0] || 'Your Interviewer';
      const prompt = {
        type: 'interview_simulation',
        format: 'conversation',
        context: {
          jobTitle: jobDetails.job_title,
          companyName: jobDetails.company_name,
          stage: nextStage,
          previousResponse: {
            content: userMessage,
            analysis: analysis
          },
          conversation: messages.slice(-4), // Only send recent context
          remainingQuestions,
          topics: interview.ai_preparation?.topics || [],
          persona: {
            name: interviewerName,
            role: 'Senior Technical Interviewer',
            style: 'professional but friendly',
            years_experience: 8
          }
        },
        instructions: `You are ${interviewerName}, the interviewer. The candidate is speaking to you.

CRITICAL RULES:
1. You are ALWAYS the interviewer (${interviewerName})
2. NEVER speak as if you are the candidate
3. NEVER refer to yourself as the candidate
4. Maintain your role as ${interviewerName} throughout

Current stage: ${nextStage}
Questions remaining: ${remainingQuestions}

Response format:
1. Brief acknowledgment of their answer
2. ONE clear follow-up question
3. Keep it under 3 sentences
4. Stay professional and friendly

Example good responses:
"Thank you for sharing that experience. Could you elaborate on the specific technologies you used?"
"I see your point about team collaboration. Can you tell me about a challenging project where you had to work closely with others?"

Example BAD responses (NEVER do these):
"Hi ${interviewerName}, I'm interested in the role..." (WRONG - this is speaking as the candidate)
"Thank you for interviewing me..." (WRONG - this is speaking as the candidate)

Remember: You are ${interviewerName}, interviewing the candidate. Always respond AS THE INTERVIEWER.`
      };

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'interview' }),
      });

      if (!response.ok) {
        throw new Error('Failed to get interviewer response');
      }

      const data = await response.json();
      
      // Add interviewer's response
      setMessages(prev => [...prev, { 
        role: 'assistant',
        content: data.result
      }]);

      // Update interview state
      setInterviewState(prev => ({
        ...prev,
        stage: nextStage,
        progress: progress,
        remaining_questions: remainingQuestions
      }));

      // End interview if we're done
      if (isComplete) {
        setTimeout(() => {
          const summary = generatePerformanceSummary();
          setPerformanceSummary(summary);
          setIsInterviewComplete(true);
          setViewMode('performance'); // Switch to performance view
          toast.success('Interview completed! Check your performance analysis.');
        }, 1000);
      }
    } catch (error) {
      console.error('Error in mock interview:', error);
      toast.error('Failed to process response');
    } finally {
      setIsLoading(false);
      setThinkStartTime(null);
    }
  };

  // Handle pressing Enter to send message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Add function to generate performance summary
  const generatePerformanceSummary = () => {
    // Filter out messages with analysis
    const userMessagesWithAnalysis = messages.filter(
      msg => msg.role === 'user' && msg.analysis
    );
    
    if (userMessagesWithAnalysis.length === 0) {
      return null;
    }
    
    // Calculate average scores
    const scoreSum = {
      clarity: 0,
      relevance: 0,
      depth: 0,
      confidence: 0
    };
    
    // Extract feedback for strengths and areas for improvement
    const allFeedback: string[] = [];
    
    userMessagesWithAnalysis.forEach(msg => {
      if (msg.analysis) {
        scoreSum.clarity += Number(msg.analysis.clarity || 0);
        scoreSum.relevance += Number(msg.analysis.relevance || 0);
        scoreSum.depth += Number(msg.analysis.depth || 0);
        scoreSum.confidence += Number(msg.analysis.confidence || 0);
        
        if (msg.analysis.feedback) {
          allFeedback.push(msg.analysis.feedback);
        }
      }
    });
    
    const responseCount = userMessagesWithAnalysis.length;
    const averageScores = {
      clarity: Math.round(scoreSum.clarity / responseCount),
      relevance: Math.round(scoreSum.relevance / responseCount),
      depth: Math.round(scoreSum.depth / responseCount),
      confidence: Math.round(scoreSum.confidence / responseCount),
      overall: Math.round(
        (scoreSum.clarity + scoreSum.relevance + scoreSum.depth + scoreSum.confidence) / 
        (responseCount * 4)
      )
    };
    
    // Extract strengths and improvements from feedback
    const strengths: string[] = [];
    const improvements: string[] = [];
    
    allFeedback.forEach(feedback => {
      // Split feedback by "but", "however", or comma to separate strengths and improvements
      if (feedback.includes('but')) {
        const [strength, improvement] = feedback.split(/but/i);
        if (strength.trim()) strengths.push(strength.trim());
        if (improvement.trim()) improvements.push(improvement.trim());
      } else if (feedback.includes('however')) {
        const [strength, improvement] = feedback.split(/however/i);
        if (strength.trim()) strengths.push(strength.trim());
        if (improvement.trim()) improvements.push(improvement.trim());
      } else if (feedback.includes(',')) {
        const [strength, improvement] = feedback.split(',');
        if (strength.trim()) strengths.push(strength.trim());
        if (improvement.trim()) improvements.push(improvement.trim());
      } else {
        // If no clear delimiter, add the whole feedback as an improvement
        improvements.push(feedback.trim());
      }
    });
    
    // Deduplicate and limit to top items
    const uniqueStrengths = [...new Set(strengths)].slice(0, 3);
    const uniqueImprovements = [...new Set(improvements)].slice(0, 3);
    
    return {
      averageScores,
      responseCount,
      strengths: uniqueStrengths,
      improvements: uniqueImprovements,
      completionTime: interviewState.time_elapsed
    };
  };

  // Function to start the interview timer
  const startTimer = () => {
    if (timerRef.current) return; // Don't start if already running
    
    timerRef.current = setInterval(() => {
      setInterviewState(prev => ({
        ...prev,
        time_elapsed: prev.time_elapsed + 1
      }));
    }, 1000);
  };

  // Function to initialize a fresh session
  const initializeFreshSession = () => {
    setMessages([]);
    setInputValue('');
    setIsLoading(false);
    setInterviewState({
      stage: 'intro',
      progress: 0,
      remaining_questions: 0,
      time_elapsed: 0
    });
    setStartTime(null);
    setIsInterviewComplete(false);
    setPerformanceSummary(null);
    setViewMode('chat');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="mock-interview-dialog" className="max-w-4xl h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-2 bg-card flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              {jobDetails.company_name} {formatInterviewType(interview.interview_type)} Interview
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {jobDetails.job_title}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {(messages.length > 0 || interviewState.progress > 0) && !isInterviewComplete && (
              <Button
                variant="outline"
                size="sm"
                className={`whitespace-nowrap h-8 border font-medium ${
                    credits < CREDIT_COSTS.JOBS.PRACTICE_WITH_AI && !user
                    ? 'text-muted-foreground border-muted cursor-not-allowed'
                    : 'text-destructive border-destructive/30 hover:bg-destructive/10'
                }`}
                disabled={!user}
                onClick={() => {
                  if (!user) {
                    toast.error("You must be logged in to reset the interview.");
                    return;
                  }
                  
                  // Open the reset confirmation dialog instead of using window.confirm
                  setResetDialogOpen(true);
                }}
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
            
            {isInterviewComplete && (
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'chat' | 'performance')} className="mx-auto">
                <TabsList className="grid grid-cols-2 w-48">
                  <TabsTrigger value="chat" className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Interview
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="flex items-center gap-1.5">
                    <BrainCircuit className="h-3.5 w-3.5" />
                    Performance
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        </DialogHeader>

        {/* Interview progress with stage indicators */}
        <div className="px-4 py-2 sm:px-6 sm:py-3 md:px-8 border-b bg-muted/20">
          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">
            <div className="flex items-center gap-1.5">
            <span>Interview Progress</span>
              <Badge variant="outline" className={cn(
                "capitalize text-[10px] sm:text-xs py-0",
                interviewState.stage === 'intro' ? "bg-blue-100 text-blue-800 border-blue-300" :
                interviewState.stage === 'technical' ? "bg-purple-100 text-purple-800 border-purple-300" :
                interviewState.stage === 'behavioral' ? "bg-amber-100 text-amber-800 border-amber-300" :
                "bg-green-100 text-green-800 border-green-300"
              )}>
                {interviewState.stage}
              </Badge>
          </div>
            <span className="font-medium">{interviewState.progress}%</span>
        </div>
          <Progress 
            value={interviewState.progress} 
            className={cn(
              "h-2 sm:h-2.5 rounded-full",
              interviewState.stage === 'intro' ? "bg-gradient-to-r from-blue-400/20 to-blue-500/20" :
              interviewState.stage === 'technical' ? "bg-gradient-to-r from-purple-400/20 to-purple-500/20" :
              interviewState.stage === 'behavioral' ? "bg-gradient-to-r from-amber-400/20 to-amber-500/20" :
              "bg-gradient-to-r from-green-400/20 to-green-500/20"
            )}
          />
          
          {/* Stage indicators */}
          <div className="mt-2 flex justify-between relative">
            <div className="absolute top-2 left-0 right-0 h-1 bg-muted/30 -z-10"></div>
            {['intro', 'technical', 'behavioral', 'closing'].map((stage, index) => (
              <div key={stage} className="flex flex-col items-center z-0">
                <div className={cn(
                  "w-4 h-4 rounded-full mb-1 flex items-center justify-center text-xs border-2",
                  (interviewState.progress >= index * 25) ? 
                    stage === 'intro' ? "bg-blue-100 border-blue-500 text-blue-700" :
                    stage === 'technical' ? "bg-purple-100 border-purple-500 text-purple-700" :
                    stage === 'behavioral' ? "bg-amber-100 border-amber-500 text-amber-700" :
                    "bg-green-100 border-green-500 text-green-700"
                  : "bg-muted border-muted/40 text-muted-foreground"
                )}>
                  {(interviewState.progress >= index * 25) && <CheckCircle2 className="h-2.5 w-2.5" />}
                </div>
                <span className={cn(
                  "text-[9px] sm:text-[10px] capitalize",
                  (interviewState.progress >= index * 25) ? 
                    stage === 'intro' ? "text-blue-700 font-medium" :
                    stage === 'technical' ? "text-purple-700 font-medium" :
                    stage === 'behavioral' ? "text-amber-700 font-medium" :
                    "text-green-700 font-medium"
                  : "text-muted-foreground"
                )}>
                  {stage}
                </span>
              </div>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 p-3 sm:p-5 md:p-6 overflow-hidden bg-gradient-to-b from-muted/10 to-transparent">
          <div className="space-y-5 sm:space-y-6">
            {messages.length === 0 ? (
              <div className="h-[40vh] sm:h-[50vh] flex flex-col items-center justify-center text-center space-y-4 sm:space-y-5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Brain className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                </div>
                <div className="max-w-md">
                  <h3 className="font-semibold text-lg sm:text-xl md:text-2xl mb-2">Ready for Your Interview</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-2">
                    Our AI interviewer will adapt to your responses and provide feedback on your answers.
                  </p>
                  
                  {/* Credit cost indicator */}
                  <div className="mb-4 flex justify-center">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                      !creditsAlreadyUsed && credits < CREDIT_COSTS.JOBS.PRACTICE_WITH_AI 
                        ? 'border-destructive/50 bg-destructive/10 text-destructive'
                        : 'border-primary/30 bg-primary/5 text-primary'
                    }`}>
                      <Sparkles className="h-4 w-4" />
                      {creditsAlreadyUsed ? (
                        <span className="text-sm font-medium">Session credit already used</span>
                      ) : credits < CREDIT_COSTS.JOBS.PRACTICE_WITH_AI ? (
                        <span className="text-sm font-medium">Not enough credits ({credits}/{CREDIT_COSTS.JOBS.PRACTICE_WITH_AI} needed)</span>
                      ) : (
                        <span className="text-sm font-medium">Cost: {CREDIT_COSTS.JOBS.PRACTICE_WITH_AI} credits</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 mt-5 text-left">
                    <div className="flex items-start space-x-2">
                      <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                      </div>
                <div>
                        <span className="font-medium text-sm">Realistic Questions</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Based on job requirements</p>
                </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full">
                        <BrainCircuit className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium text-sm">Adaptive Responses</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Follows your conversation</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium text-sm">Performance Analysis</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Get scored on key metrics</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium text-sm">Actionable Feedback</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Improve your answers</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={startInterview} 
                  disabled={isLoading || (!creditsAlreadyUsed && credits < CREDIT_COSTS.JOBS.PRACTICE_WITH_AI)} 
                  size="lg" 
                  className="mt-2 sm:mt-4 text-sm px-8 rounded-full shadow-md transition-all hover:shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing Interview...
                    </>
                  ) : !creditsAlreadyUsed && credits < CREDIT_COSTS.JOBS.PRACTICE_WITH_AI ? (
                    <>
                      Insufficient Credits
                      <XCircle className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      {creditsAlreadyUsed ? "Continue Interview" : "Start Interview"}
                      <BrainCircuit className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            ) : isInterviewComplete && performanceSummary && viewMode === 'performance' ? (
              // Performance Summary View - full replacement of chat when interview is complete
              <div className="animate-fade-in">
                <Card className="border border-primary/20 bg-primary/5 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground px-4 py-3 sm:px-6">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-5 w-5" />
                        <h3 className="text-base font-semibold">Interview Performance Summary</h3>
                      </div>
                      <p className="text-xs text-primary-foreground/80">
                        Completed in {Math.floor(performanceSummary.completionTime / 60)}m {performanceSummary.completionTime % 60}s • {performanceSummary.responseCount} responses analyzed
                      </p>
                    </div>
                    
                    <div className="p-4 sm:p-6 space-y-5">
                      {/* Overall score */}
                      <div className="flex items-center gap-4 mb-2">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                          <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                          <div 
                            className="absolute inset-0 rounded-full border-4 border-transparent"
                            style={{
                              borderTopColor: 
                                performanceSummary.averageScores.overall >= 80 ? '#22c55e' :
                                performanceSummary.averageScores.overall >= 60 ? '#f59e0b' :
                                '#ef4444',
                              borderRightColor: 
                                performanceSummary.averageScores.overall >= 80 ? '#22c55e' :
                                performanceSummary.averageScores.overall >= 60 ? '#f59e0b' :
                                '#ef4444',
                              transform: `rotate(${performanceSummary.averageScores.overall * 3.6}deg)`,
                              transition: 'transform 1s ease-out'
                            }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg sm:text-xl font-bold">
                              {performanceSummary.averageScores.overall}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-base sm:text-lg">
                            {performanceSummary.averageScores.overall >= 80 ? 'Excellent' :
                             performanceSummary.averageScores.overall >= 70 ? 'Strong' :
                             performanceSummary.averageScores.overall >= 60 ? 'Good' :
                             performanceSummary.averageScores.overall >= 50 ? 'Fair' :
                             'Needs Improvement'}
                          </h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Overall interview performance score
                          </p>
                        </div>
                      </div>
                      
                      {/* Score breakdown */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-3">
                        {[
                          { label: 'Clarity', score: performanceSummary.averageScores.clarity, icon: MessageSquare },
                          { label: 'Relevance', score: performanceSummary.averageScores.relevance, icon: CheckCircle2 },
                          { label: 'Depth', score: performanceSummary.averageScores.depth, icon: BrainCircuit },
                          { label: 'Confidence', score: performanceSummary.averageScores.confidence, icon: Sparkles },
                        ].map((item) => (
                          <div key={item.label} className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs font-medium">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={item.score}
                                className={cn(
                                  "h-2 rounded-full flex-1",
                                  item.score >= 80 ? "text-green-500" :
                                  item.score >= 60 ? "text-amber-500" :
                                  "text-red-500"
                                )}
                              />
                              <span className={cn(
                                "text-xs font-medium",
                                item.score >= 80 ? "text-green-600" :
                                item.score >= 60 ? "text-amber-600" :
                                "text-red-600"
                              )}>
                                {item.score}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Strengths and improvements */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 mt-2 border-t border-muted/40">
                        <div>
                          <h4 className="flex items-center gap-1.5 text-sm font-medium mb-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            Strengths
                          </h4>
                          <ul className="space-y-1">
                            {performanceSummary.strengths.length > 0 ? (
                              performanceSummary.strengths.map((strength, i) => (
                                <li key={i} className="text-xs leading-relaxed flex gap-1.5">
                                  <span className="text-green-500 mt-0.5">•</span>
                                  <span>{strength}</span>
                                </li>
                              ))
                            ) : (
                              <li className="text-xs text-muted-foreground italic">
                                No specific strengths identified
                              </li>
                            )}
                          </ul>
                        </div>
                        <div>
                          <h4 className="flex items-center gap-1.5 text-sm font-medium mb-2">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                            Areas for Improvement
                          </h4>
                          <ul className="space-y-1">
                            {performanceSummary.improvements.length > 0 ? (
                              performanceSummary.improvements.map((improvement, i) => (
                                <li key={i} className="text-xs leading-relaxed flex gap-1.5">
                                  <span className="text-amber-500 mt-0.5">•</span>
                                  <span>{improvement}</span>
                                </li>
                              ))
                            ) : (
                              <li className="text-xs text-muted-foreground italic">
                                No specific improvements identified
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                      
                      {/* More detailed feedback section */}
                      <div className="pt-3 mt-3 border-t border-muted/40">
                        <h4 className="flex items-center gap-1.5 text-sm font-medium mb-3">
                          <BrainCircuit className="h-3.5 w-3.5 text-primary" />
                          Interview Insights
                        </h4>
                        <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                          <div className="space-y-3">
                            <div>
                              <h5 className="text-xs font-medium mb-1">Response Time</h5>
                              <p className="text-xs text-muted-foreground">
                                You took an average of {Math.round(performanceSummary.completionTime / Math.max(1, performanceSummary.responseCount))} seconds per response.
                                {performanceSummary.completionTime / Math.max(1, performanceSummary.responseCount) > 60 ? 
                                  " Consider shortening your thinking time for more fluid conversation." : 
                                  " Your response time was appropriate for thoughtful answers."}
                              </p>
                            </div>
                            <div>
                              <h5 className="text-xs font-medium mb-1">Question Coverage</h5>
                              <p className="text-xs text-muted-foreground">
                                You answered {performanceSummary.responseCount} questions across {interviewState.stage === 'closing' ? 'all' : 'multiple'} interview stages.
                                {performanceSummary.responseCount < 4 ? 
                                  " A full interview typically involves more questions for comprehensive evaluation." : 
                                  " This provided a good sampling of your interview skills."}
                              </p>
                            </div>
                            <div>
                              <h5 className="text-xs font-medium mb-1">Performance Pattern</h5>
                              <p className="text-xs text-muted-foreground">
                                {performanceSummary.averageScores.clarity > performanceSummary.averageScores.depth ? 
                                  "Your communication clarity exceeded your response depth. Consider adding more specific examples and details." : 
                                  "Your responses showed good balance between clarity and depth, which is ideal for interview answers."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Next steps */}
                      <div className="bg-primary/10 rounded-lg p-3 sm:p-4 mt-4">
                        <h4 className="flex items-center gap-1.5 text-sm font-medium mb-2">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          Next Steps
                        </h4>
                        <ul className="space-y-1.5">
                          <li className="text-xs flex gap-1.5">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Review your interview conversation to identify specific moments for improvement</span>
                          </li>
                          <li className="text-xs flex gap-1.5">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Practice with different interview types to build versatility</span>
                          </li>
                          <li className="text-xs flex gap-1.5">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Focus on strengthening areas with lower scores in your next practice session</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Chat Messages View
              <>
                {messages.map((message, index) => (
                  <div key={index} className="space-y-3">
                    {message.role === 'system' ? (
                      <div className="flex justify-center">
                        <Badge variant="outline" className="bg-primary/5 text-[10px] sm:text-xs font-medium">
                          {message.content}
                        </Badge>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`flex gap-3 ${
                            message.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'
                          }`}
                        >
                          {message.role === 'assistant' ? (
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                              </div>
                              <span className="text-[9px] font-medium text-muted-foreground">Interviewer</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                              </div>
                              <span className="text-[9px] font-medium text-muted-foreground">You</span>
                            </div>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-3 max-w-[85%] sm:max-w-[80%] md:max-w-[75%] ${
                              message.role === 'assistant'
                                ? 'bg-muted/40 border border-muted'
                                : 'bg-primary/90 text-primary-foreground'
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                            {message.thinking_time && (
                              <div className="mt-2 text-[10px] opacity-70 flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                Response time: {message.thinking_time.toFixed(1)}s
                              </div>
                            )}
                          </div>
                        </div>
                        {message.analysis && (
                          <div className={`ml-12 mr-5 ${message.role === 'assistant' ? 'ml-5 mr-12' : ''}`}>
                            <Card className="bg-muted/20 border border-muted/50 shadow-sm">
                              <CardContent className="p-3 space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <BrainCircuit className="h-4 w-4 text-primary" />
                                  <h4 className="text-xs font-medium">Response Analysis</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  {['clarity', 'relevance', 'depth', 'confidence'].map((metric) => {
                                    const score = Number(message.analysis?.[metric as keyof typeof message.analysis] || 0);
                                    return (
                                      <div key={metric} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-muted-foreground capitalize">{metric}</span>
                                          <span className={cn(
                                            "font-medium",
                                            score >= 80 ? "text-green-600" :
                                            score >= 60 ? "text-amber-600" :
                                            "text-red-600"
                                          )}>
                                            {score}/100
                                        </span>
                                      </div>
                                      <Progress 
                                          value={score} 
                                          className={cn(
                                            "h-1.5 rounded-full bg-muted/50",
                                            score >= 80 ? "text-green-500" :
                                            score >= 60 ? "text-amber-500" :
                                            "text-red-500"
                                          )}
                                      />
                                    </div>
                                    );
                                  })}
                                </div>
                                <div className="flex gap-2 mt-3 pt-2 border-t border-muted/30">
                                  <div className="mt-0.5">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                  {message.analysis.feedback}
                                </p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground">
                    <div className="flex items-center justify-center w-6 h-6 bg-muted/30 rounded-full">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    </div>
                    <span className="text-xs font-medium">Analyzing response...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 sm:p-4 md:p-5 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {/* Input area with conditional rendering based on interview completion */}
          <div className="flex gap-2 sm:gap-3 max-w-4xl mx-auto">
            <Input
              placeholder={
                messages.length === 0 ? "Click 'Start Interview' to begin..." : 
                isInterviewComplete ? "Interview completed. Check your performance summary above." :
                "Type your response..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || messages.length === 0 || isInterviewComplete}
              className="flex-1 text-sm md:text-base h-10 sm:h-11 md:h-12 rounded-full pl-4 pr-3 border-muted-foreground/20 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-0"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim() || messages.length === 0 || isInterviewComplete}
              size="icon"
              className="shrink-0 h-10 sm:h-11 md:h-12 w-10 sm:w-11 md:w-12 rounded-full bg-primary hover:bg-primary/90 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>
          {messages.length > 0 && !isInterviewComplete && (
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              {interviewState.remaining_questions > 0 ? 
                `${interviewState.remaining_questions} question${interviewState.remaining_questions !== 1 ? 's' : ''} remaining in this interview` : 
                'Interview concluding soon - prepare for final thoughts'
              }
            </p>
          )}
          {isInterviewComplete && (
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              {viewMode === 'performance' 
                ? 'Click the "Interview" button above to review your conversation' 
                : 'Click the "Performance" button above to see your performance analysis'}
            </p>
          )}
        </div>

        {/* Reset Confirmation Dialog */}
        <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reset Interview</DialogTitle>
              <DialogDescription>
                Are you sure you want to reset this interview session? All current progress will be lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-row justify-end gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  resetInterview();
                  setResetDialogOpen(false);
                }}
              >
                Reset Interview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
} 