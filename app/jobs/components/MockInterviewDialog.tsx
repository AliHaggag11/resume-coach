'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot, User, Clock, BrainCircuit, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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

type Stage = 'intro' | 'technical' | 'behavioral' | 'closing';

export default function MockInterviewDialog({
  open,
  onOpenChange,
  interview,
  jobDetails,
}: MockInterviewDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interviewState, setInterviewState] = useState<InterviewState>({
    stage: 'intro',
    progress: 0,
    remaining_questions: 8,
    time_elapsed: 0
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [thinkStartTime, setThinkStartTime] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

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

  // Start the interview
  const startInterview = async () => {
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
        body: JSON.stringify({ prompt, type: 'interview' }),
      });

      if (!response.ok) {
        throw new Error('Failed to start interview');
      }

      const data = await response.json();
      
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-[calc(100%-2rem)] h-[95vh] sm:h-[90vh] md:h-[80vh] flex flex-col p-0 gap-0 mx-auto">
        <DialogHeader className="px-4 py-3 sm:px-5 md:px-6 md:py-4 border-b">
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <span className="font-semibold text-base sm:text-lg">Mock Interview</span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">-</span>
                <span className="text-xs sm:text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-none">
                  {jobDetails.job_title}
                </span>
                <Badge 
                  variant={interviewState.stage === 'closing' ? 'default' : 'outline'} 
                  className="capitalize text-[10px] sm:text-xs px-1.5 py-0.5"
                >
                  {interviewState.stage}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-0">
              <Button 
                variant="outline" 
                size="sm"
                className="h-7 sm:h-8 px-2 text-[10px] sm:text-xs"
                onClick={() => {
                  setMessages([]);
                  setInterviewState({
                    stage: 'intro',
                    progress: 0,
                    remaining_questions: 8,
                    time_elapsed: 0
                  });
                  setStartTime(null);
                  if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = undefined;
                  }
                }}
              >
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                Restart
              </Button>
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-sm text-muted-foreground bg-muted/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {formatTime(interviewState.time_elapsed)}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 py-2 sm:px-5 sm:py-2 md:px-6 border-b bg-muted/5">
          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-1.5">
            <span>Interview Progress</span>
            <span>{interviewState.progress}%</span>
          </div>
          <Progress value={interviewState.progress} className="h-1 sm:h-1.5" />
        </div>

        <ScrollArea className="flex-1 p-3 sm:p-4 md:p-6">
          <div className="space-y-4 sm:space-y-6">
            {messages.length === 0 ? (
              <div className="h-[40vh] sm:h-[50vh] flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 text-muted-foreground">
                <BrainCircuit className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16" />
                <div>
                  <p className="font-medium text-base sm:text-lg md:text-xl">Ready for Your Interview</p>
                  <p className="text-xs sm:text-sm md:text-base mt-1">Our AI interviewer will adapt to your responses</p>
                </div>
                <Button onClick={startInterview} disabled={isLoading} size="default" className="mt-2 sm:mt-4 text-sm">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    'Start Interview'
                  )}
                </Button>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div key={index} className="space-y-2 sm:space-y-3">
                    {message.role === 'system' ? (
                      <div className="flex justify-center">
                        <Badge variant="outline" className="bg-muted/50 text-[10px] sm:text-xs">
                          {message.content}
                        </Badge>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`flex gap-2 sm:gap-3 ${
                            message.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'
                          }`}
                        >
                          {message.role === 'assistant' ? (
                            <Bot className="h-6 w-6 sm:h-8 sm:w-8 p-1 sm:p-1.5 rounded-md bg-primary/10 text-primary shrink-0" />
                          ) : (
                            <User className="h-6 w-6 sm:h-8 sm:w-8 p-1 sm:p-1.5 rounded-md bg-muted shrink-0" />
                          )}
                          <div
                            className={`rounded-lg px-3 py-2 sm:px-4 sm:py-3 max-w-[95%] sm:max-w-[85%] md:max-w-[75%] ${
                              message.role === 'assistant'
                                ? 'bg-muted/50'
                                : 'bg-primary text-primary-foreground'
                            }`}
                          >
                            <div className="text-xs sm:text-sm md:text-base">{message.content}</div>
                            {message.thinking_time && (
                              <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs opacity-70 flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                Response time: {message.thinking_time.toFixed(1)}s
                              </div>
                            )}
                          </div>
                        </div>
                        {message.analysis && (
                          <div className={`ml-6 mr-2 sm:ml-12 sm:mr-4 ${message.role === 'assistant' ? 'ml-2 mr-6 sm:ml-4 sm:mr-12' : ''}`}>
                            <Card className="bg-muted/30 border-none shadow-sm">
                              <CardContent className="p-2 sm:p-3 space-y-2 sm:space-y-3">
                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                  {['clarity', 'relevance', 'depth', 'confidence'].map((metric) => (
                                    <div key={metric} className="space-y-1 sm:space-y-1.5">
                                      <div className="flex items-center justify-between text-[10px] sm:text-xs">
                                        <span className="text-muted-foreground capitalize">{metric}</span>
                                        <span className="font-medium">
                                          {message.analysis?.[metric as keyof typeof message.analysis]}/100
                                        </span>
                                      </div>
                                      <Progress 
                                        value={Number(message.analysis?.[metric as keyof typeof message.analysis])} 
                                        className="h-0.5 sm:h-1" 
                                      />
                                    </div>
                                  ))}
                                </div>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 sm:mt-3 leading-relaxed">
                                  {message.analysis.feedback}
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground animate-pulse">
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="text-xs sm:text-sm">Thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 sm:p-4 md:p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex gap-2 sm:gap-3 md:gap-3 max-w-4xl mx-auto">
            <Input
              placeholder={messages.length === 0 ? "Click 'Start Interview' to begin..." : "Type your response..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || messages.length === 0}
              className="flex-1 text-xs sm:text-sm md:text-base h-8 sm:h-10"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim() || messages.length === 0}
              size="icon"
              className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 