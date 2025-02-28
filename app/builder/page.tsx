"use client";

import { useState, useRef, useEffect } from "react";
import type { ReactElement } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ResumeProvider, useResume } from "../context/ResumeContext";
import { ResumeStyleProvider, useResumeStyle } from "../context/ResumeStyleContext";
import PersonalInfoForm from "./components/PersonalInfoForm";
import ExperienceForm from "./components/ExperienceForm";
import EducationForm from "./components/EducationForm";
import SkillsForm from "./components/SkillsForm";
import ProjectsForm from "./components/ProjectsForm";
import AwardsForm from "./components/AwardsForm";
import ResumePreview from "./components/ResumePreview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ResumeStyleDialog from "./components/ResumeStyleDialog";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Experience {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

interface Education {
  school: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa: string;
  achievements: string[];
}

interface SkillCategory {
  name: string;
  skills: string[];
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
  link: string;
  startDate: string;
  endDate: string;
  current: boolean;
  achievements: string[];
}

interface Award {
  title: string;
  issuer: string;
  date: string;
  description: string;
  link: string;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  summary: string;
  linkedin: string;
  github: string;
  website: string;
  fullName: string;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: SkillCategory[];
  projects: Project[];
  awards: Award[];
}

// Add template definitions
const resumeTemplates = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and contemporary design with a focus on readability",
    preview: "/templates/modern.png",
    className: "font-sans",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Traditional layout perfect for corporate positions",
    preview: "/templates/professional.png",
    className: "font-serif",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Unique design for creative industry professionals",
    preview: "/templates/creative.png",
    className: "font-sans",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant design that lets your content shine",
    preview: "/templates/minimal.png",
    className: "font-sans",
  },
] as const;

interface Section {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const sections: Section[] = [
  { id: "personal", name: "Personal Info", icon: <User className="h-4 w-4" />, component: <PersonalInfoForm /> },
  { id: "experience", name: "Experience", icon: <Briefcase className="h-4 w-4" />, component: <ExperienceForm /> },
  { id: "education", name: "Education", icon: <GraduationCap className="h-4 w-4" />, component: <EducationForm /> },
  { id: "skills", name: "Skills", icon: <Wand2 className="h-4 w-4" />, component: <SkillsForm /> },
  { id: "projects", name: "Projects", icon: <FolderGit2 className="h-4 w-4" />, component: <ProjectsForm /> },
  { id: "awards", name: "Awards", icon: <Trophy className="h-4 w-4" />, component: <AwardsForm /> },
];

function BuilderPageContent(): ReactElement {
  const { resumeData } = useResume();
  const { style } = useResumeStyle();
  const [currentSection, setCurrentSection] = useState("personal");
  const [isExporting, setIsExporting] = useState(false);
  const [showStyleDialog, setShowStyleDialog] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{
    atsCompatibility: { score: number; feedback: string };
    impactStatements: { score: number; feedback: string };
    keywordsMatch: { score: number; feedback: string };
  } | null>(null);

  const calculateProgress = () => {
    let progress = 0;
    const { personalInfo, experiences, education, skills, projects, awards } = resumeData;

    // Personal Info - check if essential fields are filled
    if (personalInfo.fullName && personalInfo.email) {
      progress += 16.67; // 100/6
    }

    // Experience - at least one experience
    if (experiences.length > 0) {
      progress += 16.67;
    }

    // Education - at least one education
    if (education.length > 0) {
      progress += 16.67;
    }

    // Skills - at least one skill category
    if (skills.length > 0) {
      progress += 16.67;
    }

    // Projects - at least one project
    if (projects.length > 0) {
      progress += 16.67;
    }

    // Awards - at least one award
    if (awards.length > 0) {
      progress += 16.67;
    }

    return Math.round(progress);
  };

  const analyzeResume = async () => {
    try {
      // Validate resume content first
      const { personalInfo, experiences, education, skills } = resumeData;
      
      // Check if essential sections are filled
      if (!personalInfo.fullName || !personalInfo.title || !personalInfo.summary) {
        toast.error("Please complete your personal information first (name, title, and summary)");
        return;
      }

      if (experiences.length === 0) {
        toast.error("Please add at least one work experience");
        return;
      }

      if (education.length === 0) {
        toast.error("Please add your educational background");
        return;
      }

      if (skills.length === 0) {
        toast.error("Please add your skills");
        return;
      }

      setIsAnalyzing(true);
      
      // Simplified and more explicit prompt structure
      const prompt = {
        role: "assistant",
        content: `You are a resume analysis AI. Analyze the following resume and return ONLY a JSON object with scores and feedback.

Required JSON format (copy this format exactly):
{
  "atsCompatibility": {
    "score": 85,
    "feedback": "Your specific feedback here"
  },
  "impactStatements": {
    "score": 75,
    "feedback": "Your specific feedback here"
  },
  "keywordsMatch": {
    "score": 80,
    "feedback": "Your specific feedback here"
  }
}

Analysis criteria:
1. ATS Compatibility (score 0-100): Check formatting, headers, sections, keywords
2. Impact Statements (score 0-100): Evaluate action verbs, achievements, metrics
3. Keywords Match (score 0-100): Assess industry terms and skill alignment

Resume to analyze:
${JSON.stringify(resumeData, null, 2)}

Remember: Return ONLY the JSON object with no additional text or explanation.`
      };

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, type: 'analyze' }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const data = await response.json();
      
      if (!data.result) {
        throw new Error('No analysis result received');
      }

      let analysis;
      try {
        // Clean the response string and attempt to parse
        const cleanResult = data.result
          .trim()
          // Remove any markdown code block indicators
          .replace(/```json/g, '')
          .replace(/```/g, '')
          // Remove any leading/trailing whitespace or newlines
          .trim();

        analysis = JSON.parse(cleanResult);
      } catch (parseError) {
        console.error('Raw AI Response:', data.result);
        throw new Error('Failed to parse analysis result. Please try again.');
      }

      // Validate analysis structure
      if (!analysis || typeof analysis !== 'object') {
        throw new Error('Invalid analysis format');
      }

      const requiredFields = ['atsCompatibility', 'impactStatements', 'keywordsMatch'];
      for (const field of requiredFields) {
        if (!analysis[field]?.score || !analysis[field]?.feedback) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Normalize scores to ensure they're valid numbers between 0-100
      const normalizeScore = (score: number) => Math.min(100, Math.max(0, Math.round(Number(score))));
      
      analysis.atsCompatibility.score = normalizeScore(analysis.atsCompatibility.score);
      analysis.impactStatements.score = normalizeScore(analysis.impactStatements.score);
      analysis.keywordsMatch.score = normalizeScore(analysis.keywordsMatch.score);
      
      // Calculate overall ATS score
      const overallScore = Math.round(
        (analysis.atsCompatibility.score + 
         analysis.impactStatements.score + 
         analysis.keywordsMatch.score) / 3
      );

      setAtsScore(overallScore);
      setAnalysisResults(analysis);
      setShowAnalysis(true);
      toast.success("Resume analysis complete!");
    } catch (error: any) {
      console.error('Error analyzing resume:', error);
      toast.error(error.message || 'Failed to analyze resume');
      setAnalysisResults(null);
      setAtsScore(null);
      setShowAnalysis(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'word' | 'text') => {
    if (!resumeRef.current) return;
    setIsExporting(true);

    try {
      switch (format) {
        case 'pdf':
          const element = resumeRef.current;
          
          // Create PDF with A4 dimensions (595.28 x 841.89 points)
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4',
          });

          // Get PDF dimensions
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          // Create a temporary container
          const container = document.createElement('div');
          container.style.width = `${pageWidth}px`;
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.top = '-9999px';
          container.style.backgroundColor = 'white';

          // Clone the resume content
          const clone = element.cloneNode(true) as HTMLElement;
          clone.style.width = '100%';
          clone.style.height = 'auto';
          clone.style.transform = 'none';
          clone.style.padding = '40px';
          clone.style.margin = '0';
          clone.style.boxSizing = 'border-box';
          clone.style.backgroundColor = 'white';
          container.appendChild(clone);
          document.body.appendChild(container);

          try {
            // Capture the content
            const canvas = await html2canvas(clone, {
              scale: 2, // Higher scale for better quality
              useCORS: true,
              allowTaint: true,
              logging: false,
              width: pageWidth,
              height: container.scrollHeight,
              backgroundColor: 'white',
            });

            // Calculate number of pages needed
            const totalPages = Math.ceil(container.scrollHeight / pageHeight);

            // Add each page
            for (let i = 0; i < totalPages; i++) {
              if (i > 0) {
                pdf.addPage();
              }

              // Calculate the portion of the image to use for this page
              const srcY = i * pageHeight;
              const srcHeight = Math.min(pageHeight, container.scrollHeight - srcY);

              // Create a temporary canvas for this page
              const pageCanvas = document.createElement('canvas');
              pageCanvas.width = pageWidth;
              pageCanvas.height = srcHeight;
              const ctx = pageCanvas.getContext('2d');
              
              if (ctx) {
                ctx.drawImage(
                  canvas,
                  0,
                  srcY,
                  pageWidth,
                  srcHeight,
                  0,
                  0,
                  pageWidth,
                  srcHeight
                );

                // Add the page image
                const pageData = pageCanvas.toDataURL('image/jpeg', 1.0);
                pdf.addImage(
                  pageData,
                  'JPEG',
                  0,
                  0,
                  pageWidth,
                  srcHeight,
                  undefined,
                  'FAST'
                );
              }
            }

            // Add clickable links
            const links = clone.querySelectorAll('a');
            links.forEach(link => {
              const rect = link.getBoundingClientRect();
              const pageNum = Math.floor(rect.top / pageHeight);
              
              if (pageNum >= 0 && pageNum < totalPages) {
                const y = rect.top % pageHeight;
                pdf.setPage(pageNum + 1);
                pdf.link(
                  rect.left,
                  y,
                  rect.width,
                  rect.height,
                  { url: link.href }
                );
              }
            });

            // Save the PDF
            pdf.save('resume.pdf');
          } finally {
            // Cleanup
            document.body.removeChild(container);
          }
          break;

        case 'word':
          // Create a Word-compatible HTML document
          let wordContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
              <meta charset="utf-8">
              <title>Resume</title>
              <style>
                body { font-family: 'Calibri', sans-serif; }
                .section { margin-bottom: 20px; }
                .heading { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                .subheading { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
                .item { margin-bottom: 15px; }
              </style>
            </head>
            <body>
              <h1>${resumeData.personalInfo.fullName}</h1>
              <p>${resumeData.personalInfo.title}</p>
              <p>${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone}</p>
              <p>${resumeData.personalInfo.location}</p>
              
              <div class="section">
                <h2>Professional Summary</h2>
                <p>${resumeData.personalInfo.summary}</p>
          </div>

              <div class="section">
                <h2>Experience</h2>
                ${resumeData.experiences.map(exp => `
                  <div class="item">
                    <h3>${exp.position}</h3>
                    <p>${exp.company} • ${exp.location}</p>
                    <p>${exp.startDate} - ${exp.current ? "Present" : exp.endDate}</p>
                    <p>${exp.description}</p>
                    ${exp.achievements.length > 0 ? `
                      <ul>
                        ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                      </ul>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </body>
            </html>
          `;

          const wordBlob = new Blob([wordContent], { type: 'application/msword' });
          const wordUrl = URL.createObjectURL(wordBlob);
          const wordLink = document.createElement('a');
          wordLink.href = wordUrl;
          wordLink.download = 'resume.doc';
          wordLink.click();
          break;

        case 'text':
          let textContent = `${resumeData.personalInfo.fullName}\n`;
          textContent += `${resumeData.personalInfo.title}\n`;
          textContent += `${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone}\n`;
          textContent += `${resumeData.personalInfo.location}\n\n`;
          textContent += `Summary:\n${resumeData.personalInfo.summary}\n\n`;
          
          textContent += 'Experience:\n';
          resumeData.experiences.forEach((exp) => {
            textContent += `${exp.position} at ${exp.company}\n`;
            textContent += `${exp.startDate} - ${exp.current ? "Present" : exp.endDate}\n`;
            textContent += `${exp.description}\n\n`;
            if (exp.achievements.length > 0) {
              textContent += "Achievements:\n";
              exp.achievements.forEach(achievement => {
                textContent += `• ${achievement}\n`;
              });
              textContent += "\n";
            }
          });

          // Add Education section
          if (resumeData.education.length > 0) {
            textContent += '\nEducation:\n';
            resumeData.education.forEach((edu) => {
              textContent += `${edu.degree} in ${edu.field}\n`;
              textContent += `${edu.school} • ${edu.location}\n`;
              textContent += `${edu.startDate} - ${edu.current ? "Present" : edu.endDate}\n`;
              if (edu.gpa) textContent += `GPA: ${edu.gpa}\n`;
              if (edu.achievements.length > 0) {
                textContent += "Achievements:\n";
                edu.achievements.forEach(achievement => {
                  textContent += `• ${achievement}\n`;
                });
              }
              textContent += "\n";
            });
          }

          // Add Skills section
          if (resumeData.skills.length > 0) {
            textContent += '\nSkills:\n';
            resumeData.skills.forEach((category) => {
              textContent += `${category.name}: ${category.skills.join(", ")}\n`;
            });
          }
          
          const textBlob = new Blob([textContent], { type: 'text/plain' });
          const textUrl = URL.createObjectURL(textBlob);
          const textLink = document.createElement('a');
          textLink.href = textUrl;
          textLink.download = 'resume.txt';
          textLink.click();
          break;
      }
      toast.success(`Resume exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Error exporting resume:', error);
      toast.error('Failed to export resume. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Tabs
              value={currentSection}
              className="w-full"
              onValueChange={(value) => setCurrentSection(value)}
            >
              <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                {sections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                  >
                    <div className="flex items-center gap-2">
                      {section.icon}
                      <span className="hidden md:inline">{section.name}</span>
              </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
        </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              {atsScore !== null && (
                <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
                  <LineChart className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">ATS Score: {atsScore}%</span>
                </div>
              )}
              <Progress 
                value={calculateProgress()} 
                className="h-2 w-[200px]" 
              />
              <span className="text-sm text-muted-foreground">
                {calculateProgress()}% Complete
                  </span>
              </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreview(!showPreview)}
                className="md:hidden"
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={analyzeResume}
                disabled={isAnalyzing}
                className="hidden md:flex"
            >
              {isAnalyzing ? (
                <>
                    <LineChart className="h-4 w-4 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Resume
                </>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <File className="h-4 w-4 mr-2" />
                  PDF Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('word')}>
                    <FileText className="h-4 w-4 mr-2" />
                  Word Document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

                    <Button
                      variant="outline"
                size="sm"
                onClick={() => setShowStyleDialog(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Style
                    </Button>
                  </div>
                </div>
              </div>
      </div>

      {/* Main Content */}
      <div className="container py-6">
        {showAnalysis && analysisResults && (
                          <motion.div
            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">AI Analysis Results</h3>
                              </div>
                            <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAnalysis(false)}
                >
                  <X className="h-4 w-4" />
                            </Button>
                      </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle2 className={cn(
                    "h-4 w-4 mt-1",
                    analysisResults.atsCompatibility.score >= 80 ? "text-green-500" :
                    analysisResults.atsCompatibility.score >= 60 ? "text-yellow-500" : "text-red-500"
                  )} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">ATS Compatibility</p>
                      <Badge variant="outline">{analysisResults.atsCompatibility.score}%</Badge>
                </div>
                    <p className="text-xs text-muted-foreground mt-1">{analysisResults.atsCompatibility.feedback}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <AlertCircle className={cn(
                    "h-4 w-4 mt-1",
                    analysisResults.impactStatements.score >= 80 ? "text-green-500" :
                    analysisResults.impactStatements.score >= 60 ? "text-yellow-500" : "text-red-500"
                  )} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Impact Statements</p>
                      <Badge variant="outline">{analysisResults.impactStatements.score}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{analysisResults.impactStatements.feedback}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <Star className={cn(
                    "h-4 w-4 mt-1",
                    analysisResults.keywordsMatch.score >= 80 ? "text-green-500" :
                    analysisResults.keywordsMatch.score >= 60 ? "text-yellow-500" : "text-red-500"
                  )} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Keywords Match</p>
                      <Badge variant="outline">{analysisResults.keywordsMatch.score}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{analysisResults.keywordsMatch.feedback}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className={cn(
            "space-y-4",
            showPreview ? "hidden md:block" : "col-span-full md:col-span-1"
          )}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  {sections.find(s => s.id === currentSection)?.icon}
                  {sections.find(s => s.id === currentSection)?.name}
                </h2>
              </div>
              {sections.find(s => s.id === currentSection)?.component}
            </Card>
          </div>

          {/* Preview Panel */}
          <div className={cn(
            "md:col-span-1",
            !showPreview && "hidden md:block"
          )}>
            <Card className="p-6">
              <div 
                ref={resumeRef} 
                className={cn(
                  "bg-white rounded-lg shadow-lg p-8 min-h-[1100px] mx-auto",
                  style.font,
                  {
                    'text-sm': style.fontSize === 'small',
                    'text-base': style.fontSize === 'medium',
                    'text-lg': style.fontSize === 'large',
                    'space-y-2': style.spacing === 'compact',
                    'space-y-4': style.spacing === 'comfortable',
                    'space-y-6': style.spacing === 'spacious',
                  }
                )}
                style={{
                  '--accent-color': style.accentColor,
                  maxWidth: '850px',
                } as React.CSSProperties}
              >
                <ResumePreview template={selectedTemplate} />
              </div>
            </Card>
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

export default function BuilderPage() {
  return (
        <ResumeStyleProvider>
          <ResumeProvider>
            <BuilderPageContent />
          </ResumeProvider>
        </ResumeStyleProvider>
  );
} 