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
import ReactDOM from "react-dom/client";

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

interface ResumeStyle {
  font: string;
  fontSize: string;
  spacing: string;
  accentColor: string;
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

type ResumeContextType = ReturnType<typeof useResume>;

const ExportWrapper: React.FC<{ 
  resumeData: ResumeContextType['resumeData'], 
  style: ResumeStyle, 
  template: string 
}> = ({ 
  resumeData, 
  style, 
  template 
}) => {
  return (
    <ResumeStyleProvider>
      <ResumeProvider>
        <div style={{ width: '794px', backgroundColor: 'white' }}>
          <ResumePreview 
            template={template} 
            forExport={true} 
            data={resumeData}
            styleOverride={style}
          />
        </div>
      </ResumeProvider>
    </ResumeStyleProvider>
  );
};

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
      
      const prompt = {
        role: "assistant",
        content: `You are an ATS (Applicant Tracking System) analyzer. Your task is to analyze the resume data and return ONLY a JSON object containing scores and feedback. DO NOT return the resume text or any other format.

Analysis criteria:
1. ATS Compatibility (0-100): Evaluate formatting, keyword optimization, section organization
2. Impact Statements (0-100): Assess use of action verbs, quantifiable achievements, clarity
3. Keywords Match (0-100): Check industry-relevant terms, technical skills alignment

Resume data to analyze:
${JSON.stringify(resumeData, null, 2)}

IMPORTANT: Your response must be ONLY the following JSON object, with no additional text, markdown, or formatting:
{
  "atsCompatibility": {
    "score": <number 0-100>,
    "feedback": "<clear, specific feedback with actionable improvements>"
  },
  "impactStatements": {
    "score": <number 0-100>,
    "feedback": "<clear, specific feedback with actionable improvements>"
  },
  "keywordsMatch": {
    "score": <number 0-100>,
    "feedback": "<clear, specific feedback with actionable improvements>"
  }
}

DO NOT include any text before or after the JSON object. DO NOT format as a code block. Return ONLY the JSON object.`
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

      type AnalysisSection = {
        score: number;
        feedback: string;
      };

      type Analysis = {
        atsCompatibility: AnalysisSection;
        impactStatements: AnalysisSection;
        keywordsMatch: AnalysisSection;
      };

      let analysis: Analysis;
      try {
        // Clean the response string and parse it
        const cleanResult = data.result
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim();

        // Attempt to parse, with additional error context if it fails
        try {
          analysis = JSON.parse(cleanResult) as Analysis;
        } catch (parseError: unknown) {
          console.error('Parse error. Raw response:', cleanResult);
          throw new Error(`Failed to parse analysis result: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }

        // Validate the analysis structure
        const validateScore = (score: number) => {
          return typeof score === 'number' && score >= 0 && score <= 100;
        };

        const validateFeedback = (feedback: string) => {
          return typeof feedback === 'string' && feedback.length > 0;
        };

        // Type-safe way to check sections
        const sections: (keyof Analysis)[] = ['atsCompatibility', 'impactStatements', 'keywordsMatch'];
        for (const section of sections) {
          if (!analysis[section] || 
              !validateScore(analysis[section].score) || 
              !validateFeedback(analysis[section].feedback)) {
            throw new Error(`Invalid or missing ${section} data in analysis result`);
          }
        }

        // Normalize scores
        sections.forEach(section => {
          analysis[section].score = Math.round(analysis[section].score);
        });

      } catch (error) {
        console.error('Analysis validation error:', error);
        throw new Error('Invalid analysis format received. Please try again.');
      }

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
          // Create a temporary container for the export version
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.top = '-9999px';
          container.style.width = '794px'; // A4 width
          container.style.backgroundColor = 'white';
          
          // Add specific styles to prevent section splitting
          const styleSheet = document.createElement('style');
          styleSheet.textContent = `
            .pdf-section {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
              position: relative !important;
              display: block !important;
              margin-bottom: 20px !important;
            }
            .project-item {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
              position: relative !important;
              display: block !important;
              margin-bottom: 15px !important;
            }
            .project-items-container {
              position: relative !important;
              display: block !important;
            }
            @media print {
              .pdf-section, .project-item {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                position: relative !important;
                display: block !important;
              }
              .project-items-container {
                position: relative !important;
                display: block !important;
              }
            }
          `;
          container.appendChild(styleSheet);
          document.body.appendChild(container);

          // Create a root for React rendering
          const root = ReactDOM.createRoot(container);

          // Render the export version
          root.render(
            <ExportWrapper 
              resumeData={resumeData} 
              style={style} 
              template={selectedTemplate} 
            />
          );

          try {
            // Wait for React to finish rendering and fonts to load
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Get the rendered content
            const content = container.firstChild as HTMLElement;
            if (!content) throw new Error('Failed to render resume content');

            // Create PDF with A4 dimensions
            const pdf = new jsPDF({
              orientation: 'portrait',
              unit: 'pt',
              format: 'a4',
            });

            // Get page dimensions
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 40;

            // Capture the content with high quality settings
            const canvas = await html2canvas(content, {
              scale: 3,
              useCORS: true,
              allowTaint: true,
              backgroundColor: 'white',
              logging: false,
              windowWidth: 794,
              onclone: (clonedDoc) => {
                // Add additional styles to the cloned document
                const style = clonedDoc.createElement('style');
                style.textContent = `
                  .pdf-section, .project-item {
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                  }
                `;
                clonedDoc.head.appendChild(style);
              }
            });

            // Calculate dimensions
            const imgWidth = pageWidth - (margin * 2);
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Calculate total pages needed
            const totalPages = Math.ceil(imgHeight / (pageHeight - (margin * 2)));
            
            // Add each page
            for (let page = 0; page < totalPages; page++) {
              // Add new page if not the first page
              if (page > 0) {
                pdf.addPage();
              }

              // Calculate the portion of the image to use for this page
              const sourceY = page * (pageHeight - (margin * 2)) * (canvas.width / imgWidth);
              const sourceHeight = Math.min(
                canvas.height - sourceY,
                (pageHeight - (margin * 2)) * (canvas.width / imgWidth)
              );
              
              // Create a temporary canvas for this page's content
              const pageCanvas = document.createElement('canvas');
              pageCanvas.width = canvas.width;
              pageCanvas.height = sourceHeight;
              const ctx = pageCanvas.getContext('2d');
              
              if (ctx) {
                // Draw the portion of the content for this page
                ctx.drawImage(
                  canvas,
                  0,
                  sourceY,
                  canvas.width,
                  sourceHeight,
                  0,
                  0,
                  canvas.width,
                  sourceHeight
                );

                // Add the page content to the PDF
                const pageData = pageCanvas.toDataURL('image/jpeg', 1.0);
                pdf.addImage(
                  pageData,
                  'JPEG',
                  margin,
                  margin,
                  imgWidth,
                  (sourceHeight * imgWidth) / canvas.width,
                  undefined,
                  'FAST'
                );
              }
            }

            // Save the PDF
            pdf.save('resume.pdf');
          } finally {
            // Cleanup
            root.unmount();
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

              ${resumeData.education.length > 0 ? `
                <div class="section">
                  <h2>Education</h2>
                  ${resumeData.education.map(edu => `
                    <div class="item">
                      <h3>${edu.degree} in ${edu.field}</h3>
                      <p>${edu.school} • ${edu.location}</p>
                      <p>${edu.startDate} - ${edu.current ? "Present" : edu.endDate}</p>
                      ${edu.gpa ? `<p>GPA: ${edu.gpa}</p>` : ''}
                      ${edu.achievements.length > 0 ? `
                        <ul>
                          ${edu.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                        </ul>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              ${resumeData.skills.length > 0 ? `
                <div class="section">
                  <h2>Skills</h2>
                  ${resumeData.skills.map(category => `
                    <div class="item">
                      <h3>${category.name}</h3>
                      <p>${category.skills.join(", ")}</p>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              ${resumeData.projects.length > 0 ? `
                <div class="section">
                  <h2>Projects</h2>
                  ${resumeData.projects.map(project => `
                    <div class="item">
                      <h3>${project.name}</h3>
                      <p>${project.startDate} - ${project.current ? "Present" : project.endDate}</p>
                      <p>${project.description}</p>
                      ${project.technologies.length > 0 ? `
                        <p>Technologies: ${project.technologies.join(", ")}</p>
                      ` : ''}
                      ${project.link ? `
                        <p><a href="${project.link}">View Project</a></p>
                      ` : ''}
                      ${project.achievements.length > 0 ? `
                        <ul>
                          ${project.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                        </ul>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              ${resumeData.awards.length > 0 ? `
                <div class="section">
                  <h2>Awards & Certifications</h2>
                  ${resumeData.awards.map(award => `
                    <div class="item">
                      <h3>${award.title}</h3>
                      <p>${award.issuer} • ${award.date}</p>
                      <p>${award.description}</p>
                      ${award.link ? `
                        <p><a href="${award.link}">View Certificate</a></p>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : ''}
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

          // Add Projects section
          if (resumeData.projects.length > 0) {
            textContent += '\nProjects:\n';
            resumeData.projects.forEach((project) => {
              textContent += `${project.name}\n`;
              textContent += `${project.startDate} - ${project.current ? "Present" : project.endDate}\n`;
              textContent += `${project.description}\n`;
              if (project.technologies.length > 0) {
                textContent += `Technologies: ${project.technologies.join(", ")}\n`;
              }
              if (project.link) {
                textContent += `Link: ${project.link}\n`;
              }
              if (project.achievements.length > 0) {
                textContent += "Achievements:\n";
                project.achievements.forEach(achievement => {
                  textContent += `• ${achievement}\n`;
                });
              }
              textContent += "\n";
            });
          }

          // Add Awards section
          if (resumeData.awards.length > 0) {
            textContent += '\nAwards & Certifications:\n';
            resumeData.awards.forEach((award) => {
              textContent += `${award.title}\n`;
              textContent += `${award.issuer} • ${award.date}\n`;
              textContent += `${award.description}\n`;
              if (award.link) {
                textContent += `Link: ${award.link}\n`;
              }
              textContent += "\n";
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
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="flex items-center gap-2 w-full justify-between">
            {/* Mobile Menu */}
            <div className="flex items-center gap-2 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-background border shadow-md w-56">
                  <DropdownMenuItem onClick={() => setShowStyleDialog(true)}>
                    <Palette className="h-4 w-4 mr-2" />
                    Style Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={analyzeResume} disabled={isAnalyzing}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Resume
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    <File className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('word')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as Word
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Section Tabs */}
            <Tabs
              value={currentSection}
              className="w-full md:w-auto"
              onValueChange={(value) => setCurrentSection(value)}
            >
              <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full md:w-auto">
                {sections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow flex-1 md:flex-initial"
                  >
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      {section.icon}
                      <span className="hidden sm:inline">{section.name}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Desktop Actions */}
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

              <Button
                variant="outline"
                size="sm"
                onClick={analyzeResume}
                disabled={isAnalyzing}
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
        {/* Mobile Progress Bar */}
        <div className="md:hidden mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Resume Progress</span>
            <span className="text-sm text-muted-foreground">{calculateProgress()}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>

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
            showPreview ? "hidden md:block" : "block"
          )}>
            <Card className="p-4 sm:p-6">
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
            "md:col-span-1 w-full",
            !showPreview && "hidden md:block",
            showPreview && "block"
          )}>
            <Card className="p-4 sm:p-6 overflow-x-hidden">
              <div 
                ref={resumeRef} 
                className="relative w-full overflow-x-auto"
                style={{
                  maxWidth: '100%',
                  overflowY: 'visible'
                }}
              >
                <ResumePreview 
                  template={selectedTemplate} 
                  scale={showPreview ? 0.5 : 0.7}
                />
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