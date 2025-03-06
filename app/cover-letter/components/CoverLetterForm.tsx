'use client';

import { ReactElement, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Loader2, Copy, Download, RefreshCw, CheckCircle2, ArrowRight, 
  Wand2, Save, AlertCircle, Sparkles, Info, Undo, Trash2, 
  ListChecks, FileSearch, BrainCircuit, Search 
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSubscription, CREDIT_COSTS } from '@/app/context/SubscriptionContext';

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  relevantExperience: string;
  recipientName: string;
  recipientTitle: string;
  companyAddress: string;
  tone: 'professional' | 'enthusiastic' | 'confident' | 'humble';
};

type CoverLetter = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  job_title: string;
  job_description: string;
  relevant_experience: string;
  recipient_name: string;
  recipient_title: string;
  company_address: string;
  tone: 'professional' | 'enthusiastic' | 'confident' | 'humble';
  cover_letter: string | null;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'completed';
};

type DatabaseFormData = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  job_title: string;
  job_description: string;
  relevant_experience: string;
  recipient_name: string;
  recipient_title: string;
  company_address: string;
  tone: 'professional' | 'enthusiastic' | 'confident' | 'humble';
  cover_letter: string | null;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'completed';
};

const TONES = {
  professional: 'Balanced and formal',
  enthusiastic: 'Energetic and passionate',
  confident: 'Strong and assertive',
  humble: 'Modest and grateful',
};

const SECTIONS = {
  '1': 'Personal Information',
  '2': 'Job Details',
  '3': 'Generated Cover Letter',
} as const;

const AUTOSAVE_KEY = 'cover-letter-form-data';
const MAX_CHARS = {
  jobDescription: 5000,
  relevantExperience: 1500
};

const LETTER_TEMPLATES = {
  modern: 'Modern Professional',
  creative: 'Creative & Bold',
  traditional: 'Traditional Formal',
  minimal: 'Minimal & Clean'
} as const;

interface FormHistory {
  data: FormData;
  timestamp: number;
}

const FIELD_TOOLTIPS = {
  fullName: "Enter your full legal name as it should appear on the letter",
  email: "Use a professional email address",
  phone: "Include country code if applying internationally",
  companyName: "Use the official company name",
  jobTitle: "Use the exact title from the job posting",
  jobDescription: "Paste the complete job description to help AI analyze requirements",
  relevantExperience: "Focus on achievements that match job requirements",
  recipientName: "Find this on the job posting or company website",
  recipientTitle: "Include their professional title if known",
  companyAddress: "Use the official company address from their website",
  tone: "Choose a tone that matches the company culture"
};

interface CoverLetterFormProps {
  initialValues?: FormData;
  formId?: string;
}

// Add a local constant for the analyze job cost
const ANALYZE_JOB_COST = 2;

function SignInDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in Required</DialogTitle>
          <DialogDescription>
            You need to sign in to create cover letters and use our AI features.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Sign in to access all features including AI-powered cover letter generation, 
            saving your work, and more.
          </p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => router.push('/signin?redirect=/cover-letter')}>
            Sign In
          </Button>
          <Button variant="secondary" onClick={() => router.push('/signup?redirect=/cover-letter')}>
            Create Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CoverLetterForm({ initialValues, formId }: CoverLetterFormProps): ReactElement {
  const router = useRouter();
  const { credits, spendCredits, isLoading: isLoadingCredits } = useSubscription();
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [formData, setFormData] = useState<FormData>(initialValues || {
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    relevantExperience: '',
    recipientName: '',
    recipientTitle: '',
    companyAddress: '',
    tone: 'professional',
  });

  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('1');
  const [progress, setProgress] = useState(0);
  const [currentFormId, setCurrentFormId] = useState<string | null>(formId || null);
  const [userId, setUserId] = useState<string | null>(null);

  const [sectionProgress, setSectionProgress] = useState({
    '1': false,
    '2': false,
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [template, setTemplate] = useState<keyof typeof LETTER_TEMPLATES>('modern');
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [history, setHistory] = useState<FormHistory[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [keywordAnalysis, setKeywordAnalysis] = useState<{
    keywords: string[];
    skills: string[];
    suggestions: string[];
  }>({ keywords: [], skills: [], suggestions: [] });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showATSTips, setShowATSTips] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showSaveDraftDialog, setShowSaveDraftDialog] = useState(false);

  const [showSignInDialog, setShowSignInDialog] = useState(false);

  useEffect(() => {
    // Calculate form completion progress
    const requiredFields = ['fullName', 'companyName', 'jobTitle', 'jobDescription'] as const;
    const completedFields = requiredFields.filter(field => formData[field as keyof FormData].trim().length > 0);
    setProgress((completedFields.length / requiredFields.length) * 100);

    // Update section completion status
    setSectionProgress({
      '1': ['fullName'].every(field => formData[field as keyof FormData].trim().length > 0),
      '2': ['companyName', 'jobTitle', 'jobDescription'].every(field => formData[field as keyof FormData].trim().length > 0),
    });
  }, [formData]);

  // Check authentication and limits
  useEffect(() => {
    const checkAuthAndLimits = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to save your progress');
        router.push('/auth/signin');
        return;
      }
      setUserId(session.user.id);

      // Only load saved data if we have a formId (editing mode)
      if (formId) {
        loadSavedData(session.user.id);
      }
    };

    checkAuthAndLimits();
  }, [router, formId]);

  // Load saved data
  const loadSavedData = async (userId: string) => {
    try {
      console.log('Loading data for form:', formId);
      const { data, error } = await supabase
        .from('cover_letter_forms')
        .select('*')
        .eq('id', formId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Supabase error loading data:', error);
        throw error;
      }

      if (data) {
        const savedData = data as DatabaseFormData;
        console.log('Found saved data:', savedData);
        
        // Map database fields to form fields
        setFormData({
          fullName: savedData.full_name,
          email: savedData.email,
          phone: savedData.phone,
          companyName: savedData.company_name,
          jobTitle: savedData.job_title,
          jobDescription: savedData.job_description,
          relevantExperience: savedData.relevant_experience,
          recipientName: savedData.recipient_name,
          recipientTitle: savedData.recipient_title,
          companyAddress: savedData.company_address,
          tone: savedData.tone,
        });
        
        setCurrentFormId(savedData.id);
        if (savedData.cover_letter) {
          setCoverLetter(savedData.cover_letter);
        }
        toast.success('Loaded cover letter for editing');
      } else {
        console.log('No saved data found for form:', formId);
      }
    } catch (error: any) {
      console.error('Failed to load saved data:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      toast.error('Failed to load saved data: ' + (error.message || 'Unknown error'));
    }
  };

  // Save data to Supabase without setting status
  const saveData = async (status?: 'draft' | 'completed') => {
    if (!userId) {
      console.log('No user ID available, skipping save');
      return;
    }

    try {
      console.log('Saving data for user:', userId);
      const dataToSave: Partial<DatabaseFormData> = {
        user_id: userId,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.companyName,
        job_title: formData.jobTitle,
        job_description: formData.jobDescription,
        relevant_experience: formData.relevantExperience,
        recipient_name: formData.recipientName,
        recipient_title: formData.recipientTitle,
        company_address: formData.companyAddress,
        tone: formData.tone,
        cover_letter: coverLetter || null,
        updated_at: new Date().toISOString()
      };

      // Only set status if explicitly provided
      if (status) {
        dataToSave.status = status;
      }

      console.log('Data to save:', dataToSave);
      let result;
      
      if (currentFormId) {
        console.log('Updating existing form:', currentFormId);
        result = await supabase
          .from('cover_letter_forms')
          .update(dataToSave)
          .eq('id', currentFormId)
          .select()
          .single();
      } else {
        console.log('Creating new form');
        result = await supabase
          .from('cover_letter_forms')
          .insert(dataToSave)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Supabase error saving data:', result.error);
        throw result.error;
      }

      console.log('Save successful:', result.data);
      setCurrentFormId(result.data.id);
      setLastSaved(new Date());

      if (status) {
        toast.success(status === 'completed' ? 'Cover letter saved as completed' : 'Cover letter saved as draft');
        if (status === 'completed') {
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Failed to save data:', error);
      toast.error('Failed to save data: ' + (error.message || 'Unknown error'));
    }
  };

  // Autosave effect
  useEffect(() => {
    if (!userId || !formData.fullName) return; // Don't autosave if no user or empty form

    const timeoutId = setTimeout(() => {
      // Always allow autosave, no need to check limits
      console.log('Autosaving...', { formData, coverLetter });
      saveData();
    }, 30000);
    
    return () => clearTimeout(timeoutId);
  }, [formData, userId, coverLetter, currentFormId]);

  // Validation effect
  useEffect(() => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    
    if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^[\d\s+()-]{10,}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setValidationErrors(errors);
  }, [formData]);

  // Add to history when form changes
  useEffect(() => {
    if (Object.values(formData).some(value => value !== '')) {
      const newHistory = {
        data: { ...formData },
        timestamp: Date.now()
      };
      setHistory(prev => [...prev.slice(0, currentHistoryIndex + 1), newHistory]);
      setCurrentHistoryIndex(prev => prev + 1);
    }
  }, [formData]);

  const undo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(prev => prev - 1);
      setFormData(history[currentHistoryIndex - 1].data);
    }
  }, [currentHistoryIndex, history]);

  const redo = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      setCurrentHistoryIndex(prev => prev + 1);
      setFormData(history[currentHistoryIndex + 1].data);
    }
  }, [currentHistoryIndex, history]);

  // Clear form data
  const clearForm = async () => {
    try {
      setIsClearing(true);
      if (currentFormId) {
        // If we have an existing form, delete it
        await supabase
          .from('cover_letter_forms')
          .delete()
          .eq('id', currentFormId);
      }

      // Reset form state
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        companyName: '',
        jobTitle: '',
        jobDescription: '',
        relevantExperience: '',
        recipientName: '',
        recipientTitle: '',
        companyAddress: '',
        tone: 'professional',
      });
      setCoverLetter('');
      setHistory([]);
      setCurrentHistoryIndex(-1);
      setCurrentFormId(null);
      setKeywordAnalysis({ keywords: [], skills: [], suggestions: [] });
      setActiveSection('1');

      toast.success('Form cleared');
    } catch (error) {
      console.error('Failed to clear form:', error);
      toast.error('Failed to clear form');
    } finally {
      setIsClearing(false);
    }
  };

  // Update analyzeJobDescription to use local constant
  const analyzeJobDescription = async () => {
    // Check if user is authenticated and has enough credits
    const canProceed = await checkAuthAndLimits();
    if (!canProceed) return;

    setIsAnalyzing(true);
    
    try {
      // First check if there's enough credits for analysis
      if (credits < ANALYZE_JOB_COST) {
        toast.error(`You need ${ANALYZE_JOB_COST} credits to analyze a job description.`);
        setIsAnalyzing(false);
        return;
      }

      // Use spendCredits instead of useCredits
      try {
        const creditResult = await spendCredits(ANALYZE_JOB_COST, 'cover-letter', 'Analyze Job Description');
        
        if (!creditResult) {
          setIsAnalyzing(false);
          return; // Exit early if credits couldn't be spent
        }
      } catch (error) {
        console.error('Error spending credits:', error);
        toast.error('Failed to process credits. Please try again.');
        setIsAnalyzing(false);
        return;
      }

      // Rest of the existing code for analyzing job description
      const response = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: formData.jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.result) {
        throw new Error(data.details || data.error || 'Failed to analyze job description');
      }

      try {
        let cleanedResult = '';
        try {
          // Clean the result of any markdown or formatting
          cleanedResult = data.result
            .trim()
            // Remove code block markers
            .replace(/```json\n?|\n?```/g, '')
            // Remove markdown formatting
            .replace(/\*\*/g, '')
            .replace(/[#*_]/g, '')
            // Remove any text before the first {
            .replace(/^[^{]*/, '')
            // Remove any text after the last }
            .replace(/}[^}]*$/, '}')
            // Ensure proper JSON string formatting
            .replace(/'/g, '"')
            .trim();

          const analysis = JSON.parse(cleanedResult);
          
          // Validate the structure
          if (!Array.isArray(analysis.skills) || analysis.skills.length !== 5 ||
              !Array.isArray(analysis.keywords) || analysis.keywords.length !== 5 ||
              !Array.isArray(analysis.suggestions) || analysis.suggestions.length !== 3) {
            throw new Error('Invalid analysis format');
          }
          
          setKeywordAnalysis(analysis);
          toast.success('Job description analyzed successfully');
        } catch (parseError) {
          console.error('Failed to parse analysis:', parseError, '\nCleaned result:', cleanedResult);
          throw new Error('Failed to process analysis results');
        }
      } catch (error) {
        console.error('Analysis error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to analyze job description');
        setKeywordAnalysis({ keywords: [], skills: [], suggestions: [] });
      }
    } catch (error) {
      console.error('Error analyzing job description:', error);
      toast.error("There was an error analyzing the job description. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderFieldTooltip = (fieldName: keyof typeof FIELD_TOOLTIPS) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{FIELD_TOOLTIPS[fieldName]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const getCharacterCount = (field: 'jobDescription' | 'relevantExperience') => {
    return formData[field].length;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Check character limits for textareas
    if ((name === 'jobDescription' || name === 'relevantExperience') && 
        value.length > MAX_CHARS[name]) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const moveToNextSection = () => {
    const currentIndex = parseInt(activeSection);
    if (currentIndex < Object.keys(SECTIONS).length) {
      setActiveSection((currentIndex + 1).toString());
    }
  };

  const generateCoverLetter = async () => {
    // Check if user is authenticated and has enough credits
    const canProceed = await checkAuthAndLimits();
    if (!canProceed) return;
    
    try {
      setIsGenerating(true);
      
      // Use spendCredits with proper error handling
      try {
        const creditResult = await spendCredits(
          CREDIT_COSTS.COVER_LETTER.GENERATE_LETTER, 
          'cover-letter', 
          `Generate cover letter for ${formData.jobTitle} at ${formData.companyName}`
        );
        
        if (!creditResult) {
          setIsGenerating(false);
          return; // Exit early if credits couldn't be spent
        }
      } catch (error) {
        console.error('Error spending credits:', error);
        toast.error('Failed to process credits. Please try again.');
        setIsGenerating(false);
        return;
      }
      
      // Continue with cover letter generation only if credits were successfully spent
      const prompt = {
        content: {
          ...formData,
          keywordAnalysis,
          context: `Generate a professional cover letter for a ${formData.jobTitle} position at ${formData.companyName}. 

Style and Tone:
- Use a ${formData.tone} tone
- Format as a proper business letter with date and addresses
- Make it concise but impactful (250-350 words)
- Use natural, conversational language while maintaining professionalism
- Begin paragraphs with strong action verbs
- Keep paragraphs concise (3-4 sentences maximum)

ATS Optimization:
- Use standard section headings
- Start with a strong opening mentioning the exact job title and company name
- Include a dedicated skills section highlighting the following required skills:
${keywordAnalysis.skills.map(skill => `  • ${skill}`).join('\n')}
- Naturally incorporate these key terms throughout the letter:
${keywordAnalysis.keywords.map(keyword => `  • ${keyword}`).join('\n')}
- Include these specific experience points:
${keywordAnalysis.suggestions.map(suggestion => `  • ${suggestion}`).join('\n')}
- Use both full terms and acronyms where applicable
- Place important keywords in context within achievements
- Use standard formatting without special characters

Structure:
1. Professional Header with contact details
2. Date and recipient's information
3. Formal greeting ${formData.recipientName ? `to "${formData.recipientName}"` : '(appropriate general greeting)'}
4. Strong opening paragraph mentioning position and company
5. Skills section highlighting relevant abilities
6. Experience paragraphs demonstrating achievements
7. Closing paragraph with call to action
8. Professional signature

Use the following information:
- Applicant Name: ${formData.fullName}
- Job Title: ${formData.jobTitle}
- Company: ${formData.companyName}
${formData.recipientName ? `- Recipient: ${formData.recipientName}${formData.recipientTitle ? `, ${formData.recipientTitle}` : ''}` : ''}
${formData.companyAddress ? `- Company Address: ${formData.companyAddress}` : ''}
${formData.email ? `- Email: ${formData.email}` : ''}
${formData.phone ? `- Phone: ${formData.phone}` : ''}

Job Description:
${formData.jobDescription}

${formData.relevantExperience ? `Relevant Experience:\n${formData.relevantExperience}` : ''}

Additional Requirements:
- Quantify achievements with specific metrics where possible
- Demonstrate cultural fit while maintaining professionalism
- Avoid generic phrases and focus on specific, relevant experience
- Ensure all key terms are used naturally in context`
        }
      };

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, type: 'generate' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to generate cover letter');
      }

      if (!data.result) {
        throw new Error('No cover letter generated');
      }

      // Set the cover letter content
      setCoverLetter(data.result);
      
      // Immediately save the data to ensure it's persisted
      await saveData();
      
      toast.success('Cover letter generated successfully!');
      setActiveSection('3');
    } catch (error: any) {
      console.error('Error generating cover letter:', error);
      toast.error(error.message || 'Failed to generate cover letter');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      toast.success('Cover letter copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadAsTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([coverLetter], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `cover-letter-${formData.companyName.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const regenerateLetter = () => {
    setCoverLetter('');
    generateCoverLetter();
  };

  const generateExperienceSuggestions = async () => {
    if (!formData.jobDescription) {
      toast.error('Please fill in the job description first');
      return;
    }

    try {
      setIsGeneratingSuggestions(true);
      
      const prompt = {
        content: {
          jobDescription: formData.jobDescription,
          context: `Based on this job description, suggest 3-4 relevant experiences or achievements that would be compelling for this role. Format them as bullet points and focus on specific, measurable accomplishments that match the job requirements.`
        }
      };

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, type: 'generate' }),
      });

      const data = await response.json();

      if (!response.ok || !data.result) {
        throw new Error('Failed to generate suggestions');
      }

      setFormData(prev => ({
        ...prev,
        relevantExperience: prev.relevantExperience ? 
          `${prev.relevantExperience}\n\nSuggested points:\n${data.result}` : 
          `Suggested points:\n${data.result}`
      }));

      toast.success('Added AI suggestions to your experience');
    } catch (error) {
      toast.error('Failed to generate suggestions');
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  useEffect(() => {
    const fetchCoverLetters = async () => {
      if (!userId) return;
      
      try {
        const { data, error } = await supabase
          .from('cover_letter_forms')
          .select('*')
          .eq('user_id', userId);
          
        if (error) throw error;
        setCoverLetters(data || []);
      } catch (error) {
        console.error('Error fetching cover letters:', error);
      }
    };
    
    fetchCoverLetters();
  }, [userId]);

  const saveAsCompleted = () => saveData('completed');

  // Add beforeunload event handler
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): string | undefined => {
      if (formData.fullName || coverLetter) {
        e.preventDefault();
        setShowSaveDraftDialog(true);
        e.returnValue = '';
        return '';
      }
      return undefined;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, coverLetter]);

  // Check if the user is authenticated and has enough credits
  const checkAuthAndLimits = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setShowSignInDialog(true);
      return false;
    }

    // No need to check for form limits when editing
    if (formId) {
      return true;
    }

    // Only check if the user has enough credits for generating a cover letter
    if (credits < CREDIT_COSTS.COVER_LETTER.GENERATE_LETTER) {
      setShowUpgradeDialog(true);
      return false;
    }

    return true;
  };

  return (
    <>
      <div className="space-y-4 md:space-y-6">
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {lastSaved && (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={currentHistoryIndex <= 0}
                className="group flex-1 md:flex-none"
              >
                <Undo className="h-4 w-4 mr-2 group-hover:-rotate-45 transition-transform" />
                Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={currentHistoryIndex >= history.length - 1}
                className="group flex-1 md:flex-none"
              >
                <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-45 transition-transform" />
                Redo
              </Button>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="group flex-1 md:flex-none">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Cover Letter</DialogTitle>
                    <DialogDescription>
                      This will save your cover letter as completed and return you to the dashboard.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      const closeButton = document.querySelector('[data-dialog-close]');
                      if (closeButton instanceof HTMLElement) closeButton.click();
                    }}>Cancel</Button>
                    <Button onClick={async () => {
                      await saveAsCompleted();
                      const closeButton = document.querySelector('[data-dialog-close]');
                      if (closeButton instanceof HTMLElement) closeButton.click();
                    }}>Save as Completed</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="group flex-1 md:flex-none">
                    <Trash2 className="h-4 w-4 mr-2 group-hover:text-red-500 transition-colors" />
                    Clear
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Clear Form</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to clear the form? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      const closeButton = document.querySelector('[data-dialog-close]');
                      if (closeButton instanceof HTMLElement) closeButton.click();
                    }}>Cancel</Button>
                    <Button 
                      variant="destructive" 
                      onClick={async () => {
                        await clearForm();
                        const closeButton = document.querySelector('[data-dialog-close]');
                        if (closeButton instanceof HTMLElement) closeButton.click();
                      }}
                      disabled={isClearing}
                    >
                      {isClearing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Clearing...
                        </>
                      ) : (
                        'Clear Form'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Smart Features Panel */}
        {formData.jobDescription && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5" />
                Smart Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  onClick={analyzeJobDescription}
                  disabled={isAnalyzing || !formData.jobDescription || formData.jobDescription.length < 50}
                  variant="secondary"
                  className="w-full md:w-auto"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Analyze Job ({ANALYZE_JOB_COST} Credits)
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowATSTips(true)}
                  className="group w-full sm:w-auto"
                >
                  <ListChecks className="h-4 w-4 mr-2" />
                  ATS Tips
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
              ) : keywordAnalysis.keywords.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Analysis Results</h4>
                    <div className="grid gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <FileSearch className="h-4 w-4" />
                          Key Requirements
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {keywordAnalysis.keywords.map((keyword, i) => (
                            <span key={i} className="px-2 py-1 bg-muted rounded-md text-sm">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <ListChecks className="h-4 w-4" />
                          Required Skills
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {keywordAnalysis.skills.map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Sparkles className="h-4 w-4" />
                      Recommended Experience Points
                    </div>
                    <ul className="list-disc pl-5 space-y-1">
                      {keywordAnalysis.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ATS Tips Dialog */}
        <Dialog open={showATSTips} onOpenChange={setShowATSTips}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-h-[85vh] w-[95vw] sm:w-auto">
            <DialogHeader className="space-y-2 sm:space-y-4">
              <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                <ListChecks className="h-5 w-5 sm:h-6 sm:w-6" />
                ATS Optimization Guide
              </DialogTitle>
              <DialogDescription className="text-base">
                Learn how to optimize your cover letter for Applicant Tracking Systems
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h4 className="font-medium mb-3">Content Structure</h4>
                <ul className="grid gap-2 sm:gap-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 mt-1 text-green-500 shrink-0" />
                    <span className="text-sm">Use clear section headings like "Professional Experience," "Technical Skills"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-green-500 shrink-0" />
                    <span className="text-sm">Start with a strong opening that mentions the exact job title and company</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-green-500 shrink-0" />
                    <span className="text-sm">Include a skills section that matches the job requirements</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-3">Formatting Guidelines</h4>
                <ul className="grid gap-2 sm:gap-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-green-500 shrink-0" />
                    <span className="text-sm">Use standard fonts (Arial, Calibri) and simple formatting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-green-500 shrink-0" />
                    <span className="text-sm">Avoid tables, columns, headers, footers, and images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-green-500 shrink-0" />
                    <span className="text-sm">Use standard bullet points (• or -) instead of custom symbols</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-3">Keyword Optimization</h4>
                <ul className="grid gap-2 sm:gap-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-green-500 shrink-0" />
                    <span className="text-sm">Use both full terms and acronyms (e.g., "Artificial Intelligence (AI)")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-green-500 shrink-0" />
                    <span className="text-sm">Include variations of key terms (manage, managed, management)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-green-500 shrink-0" />
                    <span className="text-sm">Place important keywords in context within achievements</span>
                  </li>
                </ul>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Info className="h-4 w-4 shrink-0" />
                  Writing Tips
                </div>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">• Begin sentences with action verbs (e.g., "Developed," "Implemented")</li>
                  <li className="flex items-start gap-2">• Use specific metrics and numbers to quantify achievements</li>
                  <li className="flex items-start gap-2">• Keep paragraphs concise (3-4 sentences maximum)</li>
                  <li className="flex items-start gap-2">• Maintain a professional tone throughout the letter</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Upgrade Dialog */}
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Credits Required
              </DialogTitle>
              <DialogDescription>
                You need {CREDIT_COSTS.COVER_LETTER.GENERATE_LETTER} credits to generate a cover letter. 
                You currently have {credits} credits.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Why we charge credits</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Our AI-powered cover letter generator uses advanced language models to create highly personalized
                  and effective cover letters. Credits ensure we can continue providing high-quality AI services.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium">With credits you can:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Generate professional, ATS-optimized cover letters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Get tailored content based on job descriptions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Choose from various tones and styles</span>
                  </li>
                </ul>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => router.push('/profile?tab=credits')}>
                Purchase Credits
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Save Draft Dialog */}
        <Dialog open={showSaveDraftDialog} onOpenChange={setShowSaveDraftDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as Draft?</DialogTitle>
              <DialogDescription>
                Would you like to save your progress as a draft before leaving?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowSaveDraftDialog(false);
                router.back();
              }}>Don't Save</Button>
              <Button onClick={async () => {
                await saveData('draft');
                setShowSaveDraftDialog(false);
                router.back();
              }}>Save as Draft</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Accordion
          type="single"
          value={activeSection}
          onValueChange={setActiveSection}
          className="space-y-3 md:space-y-4"
        >
          {Object.entries(SECTIONS).map(([value, label]) => (
            <AccordionItem
              key={value}
              value={value}
              className="border rounded-lg transition-all duration-200 data-[state=open]:shadow-md overflow-visible"
            >
              <AccordionTrigger className="px-4 md:px-6 py-3 md:py-4 transition-all">
                <div className="flex items-center gap-3">
                  <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">
                    {value}
                  </div>
                  <span>{label}</span>
                  {(value === '1' || value === '2') && sectionProgress[value] && (
                    <CheckCircle2 className="h-4 w-4 text-green-500 ml-2" />
                  )}
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 md:px-6 pb-4 md:pb-6">
                {value === '1' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName" className="flex items-center gap-2">
                          Full Name *
                          {renderFieldTooltip('fullName')}
                        </Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="flex items-center gap-2">
                          Email
                          {renderFieldTooltip('email')}
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="john@example.com"
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          Phone
                          {renderFieldTooltip('phone')}
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+1 (555) 123-4567"
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => moveToNextSection()}
                        className="group"
                      >
                        Next Step
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                )}

                {value === '2' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName" className="flex items-center gap-2">
                          Company Name *
                          {renderFieldTooltip('companyName')}
                        </Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder="Company Inc."
                          className="mt-1.5"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="jobTitle" className="flex items-center gap-2">
                          Job Title *
                          {renderFieldTooltip('jobTitle')}
                        </Label>
                        <Input
                          id="jobTitle"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleInputChange}
                          placeholder="Software Engineer"
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="recipientName" className="flex items-center gap-2">
                          Recipient's Name
                          {renderFieldTooltip('recipientName')}
                        </Label>
                        <Input
                          id="recipientName"
                          name="recipientName"
                          value={formData.recipientName}
                          onChange={handleInputChange}
                          placeholder="Jane Smith"
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="recipientTitle" className="flex items-center gap-2">
                          Recipient's Title
                          {renderFieldTooltip('recipientTitle')}
                        </Label>
                        <Input
                          id="recipientTitle"
                          name="recipientTitle"
                          value={formData.recipientTitle}
                          onChange={handleInputChange}
                          placeholder="Hiring Manager"
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="companyAddress" className="flex items-center gap-2">
                        Company Address
                        {renderFieldTooltip('companyAddress')}
                      </Label>
                      <Input
                        id="companyAddress"
                        name="companyAddress"
                        value={formData.companyAddress}
                        onChange={handleInputChange}
                        placeholder="123 Business St, City, State 12345"
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="jobDescription" className="flex items-center gap-2">
                        Job Description *
                        {renderFieldTooltip('jobDescription')}
                      </Label>
                      <div className="mt-1.5 relative">
                        <Textarea
                          id="jobDescription"
                          name="jobDescription"
                          value={formData.jobDescription}
                          onChange={handleInputChange}
                          placeholder="Paste the job description here..."
                          className="h-32"
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                          {getCharacterCount('jobDescription')}/{MAX_CHARS.jobDescription}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="tone" className="flex items-center gap-2">
                        Letter Tone
                        {renderFieldTooltip('tone')}
                      </Label>
                      <select
                        id="tone"
                        name="tone"
                        value={formData.tone}
                        onChange={handleInputChange}
                        className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {Object.entries(TONES).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col md:flex-row justify-end gap-2 md:gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setActiveSection('1')}
                      >
                        Previous
                      </Button>
                      <Button
                        type="button"
                        onClick={generateCoverLetter}
                        className="w-full md:w-auto rounded-full"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-2" />
                            Generate Cover Letter ({CREDIT_COSTS.COVER_LETTER.GENERATE_LETTER} Credits)
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {value === '3' && (
                  <>
                    {!coverLetter ? (
                      <Card className="border-dashed">
                        <CardHeader>
                          <CardTitle>Ready to Generate</CardTitle>
                          <CardDescription>
                            Fill in the required fields above and click the generate button to create your cover letter.
                          </CardDescription>
                        </CardHeader>
                        <CardFooter>
                          <Button
                            type="button"
                            onClick={generateCoverLetter}
                            className="w-full md:w-auto rounded-full"
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Wand2 className="h-4 w-4 mr-2" />
                                Generate Cover Letter ({CREDIT_COSTS.COVER_LETTER.GENERATE_LETTER} Credits)
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
                          <h2 className="text-xl font-semibold">Your Cover Letter</h2>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={copyToClipboard}
                              className="group"
                            >
                              <Copy className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={downloadAsTxt}
                              className="group"
                            >
                              <Download className="h-4 w-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
                              Download
                            </Button>
                            <Button
                              type="button"
                              variant="outline" 
                              onClick={regenerateLetter}
                              className="md:w-auto"
                              disabled={isGenerating}
                            >
                              {isGenerating ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Regenerating...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Regenerate ({CREDIT_COSTS.COVER_LETTER.GENERATE_LETTER} Credits)
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="bg-muted p-4 md:p-6 rounded-lg whitespace-pre-wrap">
                          {coverLetter}
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Add the SignInDialog component */}
      <SignInDialog 
        open={showSignInDialog} 
        onOpenChange={setShowSignInDialog} 
      />
    </>
  );
} 