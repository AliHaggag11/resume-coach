"use client";

import { useState, useRef, useEffect } from "react";
import type { ReactElement } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LucideIcon } from 'lucide-react';
import {
  Download,
  Share2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wand2,
  FileText,
  Linkedin,
  Mail,
  Copy,
  Github,
  Palette,
  File,
  Layout,
  User,
  Briefcase,
  GraduationCap,
  Star,
  FolderGit2,
  Trophy,
  Eye,
  EyeOff,
  X,
  Sparkles,
  LineChart,
  AlertCircle,
  CheckCircle2,
  Menu,
  Save,
  Trash2,
  Loader2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useResume } from "@/app/context/ResumeContext";
import { useResumeStyle } from "@/app/context/ResumeStyleContext";
import PersonalInfoForm from "./PersonalInfoForm";
import ExperienceForm from "./ExperienceForm";
import EducationForm from "./EducationForm";
import SkillsForm from "./SkillsForm";
import ProjectsForm from "./ProjectsForm";
import AwardsForm from "./AwardsForm";
import ResumePreview from "./ResumePreview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ResumeStyleDialog from "./ResumeStyleDialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export interface DatabaseResume {
  id: string;
  user_id: string;
  title: string;
  content: any;
  status: string;
  shared: boolean;
  created_at: string;
  last_modified: string;
}

interface Section {
  id: string;
  label: string;
  icon: LucideIcon;
  component: ReactElement;
}

interface BuilderPageContentProps {
  initialData?: DatabaseResume;
}

export function BuilderPageContent({ initialData }: BuilderPageContentProps): ReactElement {
  const { loadResume, saveResume, resumeData } = useResume();
  const { style, updateStyle } = useResumeStyle();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>("personal-info");
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showStyleDialog, setShowStyleDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsScore, setAtsScore] = useState<any>(null);
  const [showAtsDialog, setShowAtsDialog] = useState(false);
  const [isAtsMinimized, setIsAtsMinimized] = useState(false);

  useEffect(() => {
    if (initialData?.id) {
      loadResume(initialData.id);
    }
  }, [initialData?.id]);

  const handleDownload = async () => {
    if (!previewRef.current) return;

    try {
      setIsGeneratingPDF(true);
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("resume.pdf");
      toast.success("Resume downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generateResumeText = async () => {
    if (!resumeData) return '';

    const sections = {
      'Personal Info': resumeData.personalInfo ? [resumeData.personalInfo] : [],
      'Experience': resumeData.experiences || [],
      'Education': resumeData.education || [],
      'Skills': resumeData.skills || [],
      'Projects': resumeData.projects || [],
      'Awards': resumeData.awards || []
    };

    const text = Object.entries(sections)
      .filter(([_, sectionData]) => sectionData && sectionData.length > 0)
      .map(([sectionName, sectionData]) => {
        if (sectionName === 'Personal Info' && sectionData[0]) {
          const info = sectionData[0] as any;
          return `${sectionName.toUpperCase()}\n\n${info.fullName || ''}\n${info.title || ''}\n${info.email || ''}\n${info.phone || ''}\n${info.location || ''}\n\n${info.summary || ''}`;
        }

        if (sectionName === 'Skills' && sectionData.length > 0) {
          return `${sectionName.toUpperCase()}\n\n${(sectionData as any[]).map(category => 
            `${category.name || ''}\n${(category.skills || []).join(', ')}`
          ).join('\n\n')}`;
        }

        if (sectionName === 'Experience' || sectionName === 'Projects') {
          return `${sectionName.toUpperCase()}\n\n${(sectionData as any[]).map((item: any) => {
            if (!item) return '';
            const lines = [
              `${item.title || ''}${item.company ? ` at ${item.company}` : ''}`,
              item.date ? `Date: ${item.date}` : '',
              item.location ? `Location: ${item.location}` : '',
              item.description ? `Description: ${item.description}` : '',
              item.achievements ? `Achievements:\n${item.achievements.map((a: string) => `- ${a}`).join('\n')}` : '',
              item.technologies ? `Technologies: ${item.technologies.join(', ')}` : ''
            ].filter(Boolean);
            return lines.join('\n');
          }).filter(Boolean).join('\n\n')}`;
        }

        if (sectionName === 'Education') {
          return `${sectionName.toUpperCase()}\n\n${(sectionData as any[]).map((item: any) => {
            if (!item) return '';
            const lines = [
              item.degree ? `Degree: ${item.degree}` : '',
              item.school ? `School: ${item.school}` : '',
              item.date ? `Date: ${item.date}` : '',
              item.location ? `Location: ${item.location}` : '',
              item.gpa ? `GPA: ${item.gpa}` : '',
              item.honors ? `Honors: ${item.honors.join(', ')}` : ''
            ].filter(Boolean);
            return lines.join('\n');
          }).filter(Boolean).join('\n\n')}`;
        }

        if (sectionName === 'Awards') {
          return `${sectionName.toUpperCase()}\n\n${(sectionData as any[]).map((item: any) => {
            if (!item) return '';
            const lines = [
              item.title ? `Title: ${item.title}` : '',
              item.issuer ? `Issuer: ${item.issuer}` : '',
              item.date ? `Date: ${item.date}` : '',
              item.description ? `Description: ${item.description}` : ''
            ].filter(Boolean);
            return lines.join('\n');
          }).filter(Boolean).join('\n\n')}`;
        }

        return `${sectionName.toUpperCase()}\n\n${(sectionData as any[]).map((item: any) => {
          if (!item) return '';
          return Object.entries(item)
            .filter(([key]) => !['id', 'userId', 'current'].includes(key))
            .map(([_, value]) => {
              if (Array.isArray(value)) return value.join('\n- ');
              return value || '';
            })
            .filter(Boolean)
            .join('\n');
        }).filter(Boolean).join('\n\n')}`;
      }).filter(Boolean).join('\n\n');

    return text;
  };

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      const resumeContent = await generateResumeText();
      
      if (!resumeContent) {
        toast.error('Please add some content to your resume before analyzing');
        return;
      }

      // Format the resume content for analysis
      const formattedContent = `Resume Content for ATS Analysis:

${resumeContent}

Please analyze this resume for ATS optimization and provide a detailed analysis in the following JSON format:
{
  "score": number between 0-100,
  "matches": [top keyword matches found in the resume],
  "missing": [important keywords that are missing],
  "improvements": [specific suggestions for improvement],
  "format_score": number between 0-100,
  "format_feedback": [formatting suggestions]
}`;

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: formattedContent,
          type: 'analyze'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }
      
      const data = await response.json();
      
      if (!data.result) {
        throw new Error('No analysis results received');
      }

      // Parse the JSON string from the response
      let parsedResult;
      try {
        // Clean the string of any markdown or extra formatting
        const cleanJson = data.result
          .replace(/```json\s*|\s*```/g, '')  // Remove code blocks
          .replace(/[\r\n]+/g, '') // Remove newlines
          .replace(/\/\/.*/g, '')  // Remove comments
          .trim();
        
        parsedResult = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error('Failed to parse AI response. Please try again.');
      }

      // Validate the response structure
      const requiredFields = ['score', 'matches', 'missing', 'improvements', 'format_score', 'format_feedback'];
      const missingFields = requiredFields.filter(field => !(field in parsedResult));
      
      if (missingFields.length > 0) {
        throw new Error(`Invalid analysis response: missing fields ${missingFields.join(', ')}`);
      }

      setAtsScore(parsedResult);
      setShowAtsDialog(true);
    } catch (error: any) {
      console.error('Error analyzing resume:', error);
      toast.error(error.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const builderSections: Section[] = [
    {
      id: "personal-info",
      label: "Personal Info",
      icon: User,
      component: <PersonalInfoForm />,
    },
    {
      id: "experience",
      label: "Experience",
      icon: Briefcase,
      component: <ExperienceForm />,
    },
    {
      id: "education",
      label: "Education",
      icon: GraduationCap,
      component: <EducationForm />,
    },
    {
      id: "skills",
      label: "Skills",
      icon: Star,
      component: <SkillsForm />,
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderGit2,
      component: <ProjectsForm />,
    },
    {
      id: "awards",
      label: "Awards",
      icon: Trophy,
      component: <AwardsForm />,
    },
  ];

  const currentSectionIndex = builderSections.findIndex((section: Section) => section.id === activeSection);
  const currentSection = builderSections[currentSectionIndex];
  const hasNext = currentSectionIndex < builderSections.length - 1;
  const hasPrev = currentSectionIndex > 0;

  const goToNextSection = () => {
    if (hasNext) {
      setActiveSection(builderSections[currentSectionIndex + 1].id);
    }
  };

  const goToPrevSection = () => {
    if (hasPrev) {
      setActiveSection(builderSections[currentSectionIndex - 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="relative">
        <div className="sticky top-[3.5rem] z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center">
            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "md:hidden",
                    showPreview && "hidden" // Hide sections button when preview is shown
                  )}
                >
                  <Menu className="h-4 w-4 mr-2" />
                  Sections
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] max-w-sm pr-0">
                <SheetHeader className="px-4 pb-4 border-b">
                  <SheetTitle>Resume Sections</SheetTitle>
                </SheetHeader>
                <nav className="grid gap-1 p-4">
                  {builderSections.map((section: Section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => {
                          setActiveSection(section.id);
                          // Close sheet
                          const closeButton = document.querySelector(
                            '[data-dismiss="sheet"]'
                          );
                          if (closeButton instanceof HTMLElement)
                            closeButton.click();
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {section.label}
                      </button>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4 flex-1">
              {/* Section Tabs */}
              <Tabs
                value={activeSection}
                className="w-full"
                onValueChange={(value) => setActiveSection(value)}
              >
                <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full">
                  {builderSections.map((section: Section) => {
                    const Icon = section.icon;
                    return (
                      <TabsTrigger
                        key={section.id}
                        value={section.id}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow flex-1"
                      >
                        <div className="flex items-center gap-2 justify-center">
                          <Icon className="h-4 w-4" />
                          <span>{section.label}</span>
                        </div>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center justify-end space-x-2">
              <div className="w-full flex-1 md:w-auto md:flex-none">
                {lastSaved && (
                  <p className="text-sm text-muted-foreground">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isGeneratingPDF ? "Generating..." : "Download"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStyleDialog(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Style
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleAnalyze}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <LineChart className="h-4 w-4" />
                    Analyze Resume
                  </>
                )}
              </Button>
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Resume</DialogTitle>
                    <DialogDescription>
                      This will save your resume as completed and return you to the dashboard.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        onClick={async () => {
                          await saveResume('completed');
                          router.push('/dashboard');
                        }}
                      >
                        Save and Exit
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center ml-auto gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowPreview(!showPreview)}
                className={cn(
                  "transition-colors",
                  showPreview && "bg-primary text-primary-foreground"
                )}
              >
                {showPreview ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[40vh]">
                  <SheetHeader className="text-left">
                    <SheetTitle>Actions</SheetTitle>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      disabled={isGeneratingPDF}
                      className="justify-start"
                    >
                      {isGeneratingPDF ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      {isGeneratingPDF ? "Generating..." : "Download Resume"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowStyleDialog(true)}
                      className="justify-start"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Change Style
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="justify-start"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <LineChart className="h-4 w-4 mr-2" />
                      )}
                      {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowSaveDialog(true)}
                      className="justify-start"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save and Exit
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* ATS Analysis Section */}
        {atsScore && (
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container py-4">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Overall ATS Score</h4>
                    <div className="flex items-baseline gap-1">
                      <p className="text-4xl font-bold">{atsScore.score}</p>
                      <span className="text-sm text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Format Score</h4>
                    <div className="flex items-baseline gap-1">
                      <p className="text-4xl font-bold">{atsScore.format_score}</p>
                      <span className="text-sm text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-end justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="gap-2 h-8"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span className="text-sm">Reanalyzing...</span>
                        </>
                      ) : (
                        <>
                          <LineChart className="h-3.5 w-3.5" />
                          <span className="text-sm">Reanalyze</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAtsMinimized(!isAtsMinimized)}
                      className="h-8 w-8 p-0"
                    >
                      {isAtsMinimized ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              
                {!isAtsMinimized && (
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 mt-2">
                    <Card className="p-3 sm:p-4 bg-card/50">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <h4 className="text-sm font-medium">Top Keyword Matches</h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {atsScore.matches?.map((keyword: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-3 sm:p-4 bg-card/50">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          <h4 className="text-sm font-medium">Missing Keywords</h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {atsScore.missing?.map((keyword: string, i: number) => (
                            <Badge key={i} variant="outline" className="border-yellow-500/20 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-3 sm:p-4 bg-card/50">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-blue-500" />
                          <h4 className="text-sm font-medium">Suggested Improvements</h4>
                        </div>
                        <ul className="space-y-1.5">
                          {atsScore.improvements?.map((improvement: string, i: number) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                    
                    <Card className="p-3 sm:p-4 bg-card/50">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Layout className="h-4 w-4 text-purple-500" />
                          <h4 className="text-sm font-medium">Format Feedback</h4>
                        </div>
                        <ul className="space-y-1.5">
                          {atsScore.format_feedback?.map((feedback: string, i: number) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-purple-500" />
                              {feedback}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="container py-4 md:py-8 relative z-10">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className={cn(
              "relative",
              showPreview && "hidden md:block" // Hide form when preview is shown on mobile
            )}>
              {currentSection.component}
            </div>

            <div
              className={cn(
                "lg:block",
                showPreview ? "block" : "hidden lg:block"
              )}
            >
              <div className="sticky top-[7rem]">
                <div ref={previewRef}>
                  <ResumePreview template="modern" scale={0.7} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ResumeStyleDialog
        open={showStyleDialog}
        onOpenChange={setShowStyleDialog}
      />
    </div>
  );
} 