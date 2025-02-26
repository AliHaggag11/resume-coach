"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  MessageSquare,
  PenLine,
  Download,
  Share2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wand2,
  RefreshCw,
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
import Navbar from "@/components/Navbar";
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

function BuilderPageContent() {
  const { resumeData } = useResume();
  const { style } = useResumeStyle();
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
  const [currentSection, setCurrentSection] = useState("personal");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showStyleDialog, setShowStyleDialog] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);
  const [showEditorSheet, setShowEditorSheet] = useState(false);
  const [showAiSheet, setShowAiSheet] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [showJobAnalyzerDialog, setShowJobAnalyzerDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    match: number;
    missingKeywords: string[];
    missingSkills: string[];
    recommendations: string[];
    strongPoints: string[];
  } | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const sections = [
    { id: "personal", name: "Personal Info" },
    { id: "experience", name: "Experience" },
    { id: "education", name: "Education" },
    { id: "skills", name: "Skills" },
    { id: "projects", name: "Projects" },
    { id: "awards", name: "Awards" },
  ];

  const steps = [
    { 
      id: "personal",
      name: "Personal Info",
      description: "Start with your basic information",
      icon: <User className="h-4 w-4" />,
      component: <PersonalInfoForm />
    },
    { 
      id: "experience", 
      name: "Experience",
      description: "Add your work history",
      icon: <Briefcase className="h-4 w-4" />,
      component: <ExperienceForm />
    },
    { 
      id: "education",
      name: "Education",
      description: "List your educational background",
      icon: <GraduationCap className="h-4 w-4" />,
      component: <EducationForm />
    },
    { 
      id: "skills",
      name: "Skills",
      description: "Highlight your key abilities",
      icon: <Star className="h-4 w-4" />,
      component: <SkillsForm />
    },
    { 
      id: "projects",
      name: "Projects",
      description: "Showcase your best work",
      icon: <FolderGit2 className="h-4 w-4" />,
      component: <ProjectsForm />
    },
    { 
      id: "awards",
      name: "Awards",
      description: "Add your achievements",
      icon: <Trophy className="h-4 w-4" />,
      component: <AwardsForm />
    }
  ];

  const mockAiResponse = async () => {
    setIsAiLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAiLoading(false);
    toast.success("AI suggestions applied successfully!");
  };

  const calculateATSScore = () => {
    const score = {
      total: 0,
      keywordMatches: [] as string[],
      missingKeywords: [] as string[],
      formatScore: 0,
    };

    // Check for key sections
    if (resumeData.personalInfo.summary) score.total += 15;
    if (resumeData.experiences.length > 0) score.total += 20;
    if (resumeData.education.length > 0) score.total += 15;
    if (resumeData.skills.length > 0) score.total += 15;

    // Format scoring
    const hasProperFormatting = 
      resumeData.experiences.every(exp => exp.startDate && (exp.endDate || exp.current)) &&
      resumeData.education.every(edu => edu.startDate && (edu.endDate || edu.current));
    if (hasProperFormatting) score.total += 15;
    score.formatScore = hasProperFormatting ? 100 : 70;

    // Keyword analysis (simulated)
    const commonKeywords = ['leadership', 'management', 'development', 'analysis', 'project', 'team'];
    const content = JSON.stringify(resumeData).toLowerCase();
    
    commonKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        score.keywordMatches.push(keyword);
        score.total += 5;
      } else {
        score.missingKeywords.push(keyword);
      }
    });

    return score;
  };

  const mockAnalyzeJobDescription = async (description: string) => {
    setIsAnalyzing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract keywords from job description
    const keywords = description.toLowerCase().match(/\b\w+\b/g) || [];
    const resumeContent = JSON.stringify(resumeData).toLowerCase();

    // Mock analysis
    const mockKeywords = [
      'leadership', 'management', 'development', 'react', 'nodejs', 'typescript',
      'agile', 'scrum', 'collaboration', 'communication', 'problem-solving'
    ];

    const missingKeywords = mockKeywords.filter(keyword => 
      !resumeContent.includes(keyword) && description.toLowerCase().includes(keyword)
    );

    const mockSkills = ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker'];
    const missingSkills = mockSkills.filter(skill => 
      !resumeData.skills.some(category => 
        category.skills.some(s => s.toLowerCase() === skill.toLowerCase())
      ) && description.toLowerCase().includes(skill.toLowerCase())
    );

    // Calculate match percentage
    const matchScore = Math.min(
      100,
      Math.round(
        ((mockKeywords.length - missingKeywords.length) / mockKeywords.length) * 100
      )
    );

    const result = {
      match: matchScore,
      missingKeywords,
      missingSkills,
      recommendations: [
        "Add more quantifiable achievements to highlight results",
        "Include specific examples of leadership experience",
        "Emphasize collaboration and team achievements",
        "Add relevant technical certifications",
      ],
      strongPoints: [
        "Strong technical background matches requirements",
        "Project experience aligns well",
        "Good demonstration of problem-solving skills",
        "Relevant industry experience",
      ],
    };

    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const aiSuggestions = [
    {
      title: "Job Description Analyzer",
      description: "Analyze how well your resume matches a specific job posting and get tailored recommendations.",
      action: "Analyze",
      onClick: () => setShowJobAnalyzerDialog(true),
    },
    {
      title: "ATS Score Analysis",
      content: () => {
        const score = calculateATSScore();
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{score.total}%</div>
              <div className={`text-sm ${score.total >= 70 ? 'text-green-500' : 'text-yellow-500'}`}>
                {score.total >= 70 ? 'Good Standing' : 'Needs Improvement'}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Format Compatibility</div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${score.formatScore}%` }}
                />
              </div>
            </div>

            {score.keywordMatches.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Keyword Matches</div>
                <div className="flex flex-wrap gap-2">
                  {score.keywordMatches.map(keyword => (
                    <span key={keyword} className="px-2 py-1 rounded-full bg-primary/10 text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {score.missingKeywords.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2 text-yellow-500">Consider Adding</div>
                <div className="flex flex-wrap gap-2">
                  {score.missingKeywords.map(keyword => (
                    <span key={keyword} className="px-2 py-1 rounded-full bg-yellow-500/10 text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      },
      action: "Refresh",
      onClick: mockAiResponse,
    },
    {
      title: "Enhance Your Experience",
      description: "Let AI help you write more impactful bullet points for your experience.",
      action: "Enhance",
      onClick: mockAiResponse,
    },
    {
      title: "Skills Analysis",
      description: "Analyze job descriptions to suggest relevant skills you should add.",
      action: "Analyze",
      onClick: mockAiResponse,
    },
    {
      title: "Language Improvement",
      description: "Improve the language and tone of your resume content.",
      action: "Improve",
      onClick: mockAiResponse,
    },
    {
      title: "ATS Optimization",
      description: "Optimize your resume for Applicant Tracking Systems.",
      action: "Optimize",
      onClick: mockAiResponse,
    },
  ];

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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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

  const handleShare = async (platform: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (platform) {
      case 'link':
        navigator.clipboard.writeText('https://resumecoach.app/share/abc123');
        toast.success("Share link copied to clipboard!");
        break;
      case 'linkedin':
        window.open('https://www.linkedin.com/sharing/share-offsite/?url=https://resumecoach.app/share/abc123', '_blank');
        toast.success("Opening LinkedIn sharing...");
        break;
      case 'email':
        window.location.href = `mailto:?subject=Check out my resume&body=View my resume here: https://resumecoach.app/share/abc123`;
        toast.success("Opening email client...");
        break;
      case 'github':
        window.open('https://gist.github.com/new', '_blank');
        toast.success("Opening GitHub Gist...");
        break;
    }
  };

  // Add Template Dialog component
  const TemplateDialog: React.FC = () => (
    <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
      <DialogContent className="max-w-4xl bg-background">
        <DialogHeader>
          <DialogTitle>Choose Template</DialogTitle>
          <DialogDescription>
            Select a template that best matches your professional style
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          {resumeTemplates.map((template) => (
            <div
              key={template.id}
              className={`relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                selectedTemplate === template.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-muted hover:border-primary/50"
              }`}
              onClick={() => {
                setSelectedTemplate(template.id);
                setShowTemplateDialog(false);
              }}
            >
              <div className="aspect-[210/297] bg-white">
                <img
                  src={template.preview}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/90 backdrop-blur-sm">
                <h3 className="font-medium text-sm">{template.name}</h3>
                <p className="text-xs text-muted-foreground truncate">
                  {template.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  // Update the settings dropdown to include template selection
  const SettingsDropdown: React.FC = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setShowTemplateDialog(true)}>
          <Layout className="h-4 w-4 mr-2" />
          Change Template
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowStyleDialog(true)}>
          <Palette className="h-4 w-4 mr-2" />
          Customize Style
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Add JobAnalyzerDialog component
  const JobAnalyzerDialog = () => (
    <Dialog open={showJobAnalyzerDialog} onOpenChange={setShowJobAnalyzerDialog}>
      <DialogContent className="max-w-3xl bg-background">
        <DialogHeader>
          <DialogTitle>Job Description Analyzer</DialogTitle>
          <DialogDescription>
            Paste the job description to analyze how well your resume matches the requirements
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {!analysisResult ? (
            <Textarea
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="h-[200px]"
            />
          ) : (
            <div className="space-y-6">
              {/* Match Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Match Score</h3>
                  <span className={cn(
                    "text-sm font-medium",
                    analysisResult.match >= 70 ? "text-green-500" :
                    analysisResult.match >= 50 ? "text-yellow-500" :
                    "text-red-500"
                  )}>
                    {analysisResult.match}%
                  </span>
                </div>
                <Progress value={analysisResult.match} className="h-2" />
              </div>

              {/* Missing Keywords */}
              {analysisResult.missingKeywords.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Missing Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.missingKeywords.map((keyword, i) => (
                      <Badge key={i} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {analysisResult.missingSkills.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.missingSkills.map((skill, i) => (
                      <Badge key={i} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Strong Points */}
              <div>
                <h3 className="font-medium mb-2">Strong Points</h3>
                <ul className="space-y-2">
                  {analysisResult.strongPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="font-medium mb-2">Recommendations</h3>
                <ul className="space-y-2">
                  {analysisResult.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!analysisResult ? (
            <Button
              onClick={() => mockAnalyzeJobDescription(jobDescription)}
              disabled={!jobDescription.trim() || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAnalysisResult(null);
                  setJobDescription("");
                }}
              >
                Analyze Another
              </Button>
              <Button onClick={() => setShowJobAnalyzerDialog(false)}>
                Close
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Update the left panel render code
  const renderEditorPanel = () => (
    <div className="hidden md:flex w-[400px] flex-col border-r bg-card/50 backdrop-blur-sm">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-semibold">Resume Builder</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Complete each section to create your resume
        </p>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{calculateProgress()}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Steps List */}
        <div className="p-4 space-y-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(index)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                currentStep === index
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary/10",
                index < currentStep && "text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center border text-xs",
                currentStep === index
                  ? "bg-primary-foreground text-primary border-primary-foreground"
                  : index < currentStep
                  ? "bg-primary/20 border-primary/20"
                  : "border-muted-foreground"
              )}>
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium">{step.name}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
              {step.icon}
            </button>
          ))}
        </div>

        {/* Current Step Form */}
        <div className="flex-1 overflow-y-auto p-4 border-t">
          <div className="mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              {steps[currentStep].icon}
              {steps[currentStep].name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {steps[currentStep].description}
            </p>
          </div>
          {steps[currentStep].component}
        </div>

        {/* Navigation Buttons */}
        <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentStep === steps.length - 1}
              className="flex-1"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="flex gap-2 mt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex-1" variant="outline">
                  {isExporting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border">
                <DropdownMenuLabel>Choose Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <File className="h-4 w-4 mr-2" />
                  PDF Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('word')}>
                  <File className="h-4 w-4 mr-2" />
                  Word Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('text')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Plain Text
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <SettingsDropdown />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {renderEditorPanel()}

        {/* Center Panel - Resume Preview */}
        <div className="flex-1 bg-muted/10 overflow-y-auto">
          {/* Mobile Controls */}
          <div className="flex md:hidden items-center justify-between gap-2 p-4 border-b bg-background/50 backdrop-blur-sm fixed top-[73px] left-0 right-0 z-10">
            <Sheet open={showEditorSheet} onOpenChange={setShowEditorSheet}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <PenLine className="h-4 w-4 mr-2" />
                  Edit Resume
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh]">
                <SheetHeader className="border-b pb-4">
                  <SheetTitle>Resume Builder</SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex flex-col h-[calc(90vh-100px)]">
                  {/* Progress Bar */}
                  <div className="px-4 mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{calculateProgress()}%</span>
                    </div>
                    <Progress value={calculateProgress()} className="h-2" />
                  </div>

                  {/* Steps List */}
                  <div className="px-4 space-y-2 flex-shrink-0">
                    {steps.map((step, index) => (
                      <button
                        key={step.id}
                        onClick={() => setCurrentStep(index)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                          currentStep === index
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-primary/10",
                          index < currentStep && "text-muted-foreground"
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center border text-xs",
                          currentStep === index
                            ? "bg-primary-foreground text-primary border-primary-foreground"
                            : index < currentStep
                            ? "bg-primary/20 border-primary/20"
                            : "border-muted-foreground"
                        )}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{step.name}</div>
                          <div className="text-xs text-muted-foreground">{step.description}</div>
                        </div>
                        {step.icon}
                      </button>
                    ))}
                  </div>

                  {/* Current Step Form */}
                  <div className="flex-1 overflow-y-auto px-4 py-6 border-t mt-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        {steps[currentStep].icon}
                        {steps[currentStep].name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {steps[currentStep].description}
                      </p>
                    </div>
                    {steps[currentStep].component}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="px-4 py-4 border-t mt-auto">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className="flex-1"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button
                        onClick={handleNext}
                        disabled={currentStep === steps.length - 1}
                        className="flex-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Sheet open={showAiSheet} onOpenChange={setShowAiSheet}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Assistant
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader className="border-b pb-4">
                  <SheetTitle>AI Assistant</SheetTitle>
                </SheetHeader>
                <div className="mt-4 overflow-y-auto h-[calc(80vh-100px)]">
                  {aiSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors mb-4"
                    >
                      <h3 className="font-medium">{suggestion.title}</h3>
                      {'description' in suggestion ? (
                        <p className="text-sm text-muted-foreground mt-1">
                          {suggestion.description}
                        </p>
                      ) : (
                        <div className="mt-3">
                          {suggestion.content()}
                        </div>
                      )}
                      <Button 
                        className="mt-3 w-full" 
                        variant="outline"
                        onClick={suggestion.onClick}
                        disabled={isAiLoading}
                      >
                        {isAiLoading ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Wand2 className="h-4 w-4 mr-2" />
                        )}
                        {suggestion.action}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <File className="h-4 w-4 mr-2" />
                  PDF Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('word')}>
                  <File className="h-4 w-4 mr-2" />
                  Word Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('text')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Plain Text
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
              </div>

          {/* Resume Preview */}
          <div className="max-w-[850px] mx-auto p-4 md:p-8 mt-[64px] md:mt-0">
            <div 
              ref={resumeRef} 
              className={`bg-white text-zinc-900 rounded-xl shadow-xl w-full p-6 md:p-8 ${
                resumeTemplates.find(t => t.id === selectedTemplate)?.className
              } ${style.font} ${
                style.fontSize === 'small' ? 'text-sm' :
                style.fontSize === 'large' ? 'text-lg' : 'text-base'
              } ${
                style.spacing === 'compact' ? 'space-y-2' :
                style.spacing === 'spacious' ? 'space-y-6' : 'space-y-4'
              }`}
              style={{
                '--accent-color': style.accentColor,
                minHeight: '1100px',
                width: '100%',
                maxWidth: '850px',
              } as React.CSSProperties}
            >
              <ResumePreview template={selectedTemplate} />
            </div>
          </div>
        </div>

        {/* Right Panel - AI Assistant (Desktop) */}
        <motion.div 
          className="hidden md:flex border-l bg-card/50 backdrop-blur-sm"
          animate={{ 
            width: isAiPanelOpen ? 400 : 0,
            opacity: isAiPanelOpen ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          style={{ overflow: 'hidden' }}
        >
          <div className="w-[400px]">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">AI Assistant</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAiPanelOpen(false)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Get AI-powered suggestions to improve your resume
            </p>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {aiSuggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
              >
                <h3 className="font-medium">{suggestion.title}</h3>
                  {'description' in suggestion ? (
                <p className="text-sm text-muted-foreground mt-1">
                  {suggestion.description}
                </p>
                  ) : (
                    <div className="mt-3">
                      {suggestion.content()}
                    </div>
                  )}
                  <Button 
                    className="mt-3 w-full" 
                    variant="outline"
                    onClick={suggestion.onClick}
                    disabled={isAiLoading}
                  >
                    {isAiLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                    )}
                  {suggestion.action}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
        </motion.div>

        {/* AI Toggle Button - Only show when panel is closed on desktop */}
        {!isAiPanelOpen && (
          <Button
            className="fixed right-4 bottom-4 shadow-lg hidden md:flex"
            onClick={() => setIsAiPanelOpen(true)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Assistant
          </Button>
        )}

        {/* Settings Dialog */}
        <ResumeStyleDialog
          open={showStyleDialog}
          onOpenChange={setShowStyleDialog}
        />
      </main>
      <JobAnalyzerDialog />
      <TemplateDialog />
    </div>
  );
}

export default function BuilderPage() {
  return (
    <>
      <div className="relative isolate">
        <ResumeStyleProvider>
          <ResumeProvider>
            <BuilderPageContent />
          </ResumeProvider>
        </ResumeStyleProvider>
      </div>
    </>
  );
} 