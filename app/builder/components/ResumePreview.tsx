"use client";

import { useResume } from "@/app/context/ResumeContext";
import { useResumeStyle } from "@/app/context/ResumeStyleContext";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

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
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  linkedin: string;
  github: string;
  website: string;
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
  theme: string;
}

interface ResumePreviewProps {
  template: string;
  scale?: number;
  forExport?: boolean;
  data?: ResumeData;
  styleOverride?: ResumeStyle;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ 
  template, 
  scale = 1, 
  forExport = false,
  data,
  styleOverride
}) => {
  const { resumeData: contextData } = useResume();
  const { style: contextStyle } = useResumeStyle();
  
  // Use provided data/style or fall back to context
  const resumeData = data || contextData;
  const style = styleOverride || contextStyle;

  // Debug log when style changes
  useEffect(() => {
    console.log('ResumePreview style updated:', style);
    console.log('ResumePreview template:', template);
  }, [style, template]);

  const A4_DIMENSIONS = {
    width: 794, // ~210mm in px at 96dpi
    height: 1123, // ~297mm in px at 96dpi
    padding: forExport ? 40 : 72, // Use smaller padding for export
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const [isCalculating, setIsCalculating] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;

    const calculatePages = () => {
      setIsCalculating(true);
      const content = contentRef.current;
      if (!content) return;
      
      content.style.height = 'auto';
      content.style.overflow = 'visible';
      setIsCalculating(false);
    };

    calculatePages();
    window.addEventListener('resize', calculatePages);

    return () => {
      window.removeEventListener('resize', calculatePages);
    };
  }, [resumeData, style, forExport]);

  const containerStyle: React.CSSProperties = {
    width: `${A4_DIMENSIONS.width * scale}px`,
    minHeight: `${A4_DIMENSIONS.height * scale}px`,
    padding: `${A4_DIMENSIONS.padding * scale}px`,
      margin: '0 auto',
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
    boxShadow: forExport ? 'none' : '0 4px 24px rgba(0, 0, 0, 0.1)',
    color: '#000', // Explicit black text color regardless of theme mode
  };

  const wrapperStyle: React.CSSProperties = {
    paddingTop: '1.5rem',
    paddingBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
    overflow: 'auto',
  };

  // Function to render different header layouts based on theme
  const renderHeader = () => {
    // Modern theme (default) header
    if (style.theme === 'modern' || !style.theme) {
      return (
        <section className={cn(
           "text-center pdf-section",
           forExport ? "space-y-1.5 mb-3" : "space-y-3 mb-8"
         )} style={{ 
           pageBreakInside: 'avoid', 
           breakInside: 'avoid',
           display: 'block',
           position: 'relative',
         }}>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">
            {resumeData.personalInfo.fullName}
          </h1>
          <h2 className="text-lg font-medium tracking-wide">
            {resumeData.personalInfo.title}
          </h2>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            {resumeData.personalInfo.email && (
              <span className="whitespace-nowrap">{resumeData.personalInfo.email}</span>
            )}
            {resumeData.personalInfo.phone && (
              <span className="whitespace-nowrap">{resumeData.personalInfo.phone}</span>
            )}
            {resumeData.personalInfo.location && (
              <span className="whitespace-nowrap">{resumeData.personalInfo.location}</span>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {resumeData.personalInfo.linkedin && (
              <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="resume-link hover:underline">
                LinkedIn
              </a>
            )}
            {resumeData.personalInfo.github && (
              <a href={resumeData.personalInfo.github} target="_blank" rel="noopener noreferrer" className="resume-link hover:underline">
                GitHub
              </a>
            )}
            {resumeData.personalInfo.website && (
              <a href={resumeData.personalInfo.website} target="_blank" rel="noopener noreferrer" className="resume-link hover:underline">
                Portfolio
              </a>
            )}
          </div>
        </section>
      );
    }
    
    // Classic theme header
    if (style.theme === 'classic') {
      return (
        <section className={cn(
           "pdf-section",
           forExport ? "space-y-1.5 mb-3" : "space-y-2 mb-6"
         )} style={{ 
           pageBreakInside: 'avoid', 
           breakInside: 'avoid',
           display: 'block',
           position: 'relative',
         }}>
          <h1 className="text-2xl font-bold tracking-wide text-center border-b-2 pb-2 mb-2" style={{ borderColor: style.accentColor }}>
            {resumeData.personalInfo.fullName}
          </h1>
          <div className="text-lg font-medium text-center mb-2">
            {resumeData.personalInfo.title}
          </div>
          <div className="flex flex-wrap justify-between gap-3 text-sm">
            <div className="flex gap-4">
              {resumeData.personalInfo.email && (
                <span>{resumeData.personalInfo.email}</span>
              )}
              {resumeData.personalInfo.phone && (
                <span>{resumeData.personalInfo.phone}</span>
              )}
            </div>
            <div>
              {resumeData.personalInfo.location && (
                <span>{resumeData.personalInfo.location}</span>
              )}
            </div>
          </div>
          <div className="flex justify-center gap-4 text-sm border-t pt-2" style={{ borderColor: style.accentColor }}>
            {resumeData.personalInfo.linkedin && (
              <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="resume-link">
                LinkedIn
              </a>
            )}
            {resumeData.personalInfo.github && (
              <a href={resumeData.personalInfo.github} target="_blank" rel="noopener noreferrer" className="resume-link">
                GitHub
              </a>
            )}
            {resumeData.personalInfo.website && (
              <a href={resumeData.personalInfo.website} target="_blank" rel="noopener noreferrer" className="resume-link">
                Portfolio
              </a>
            )}
          </div>
        </section>
      );
    }
    
    // Minimal theme header
    if (style.theme === 'minimal') {
      return (
        <section className={cn(
           "pdf-section grid grid-cols-2",
           forExport ? "mb-4" : "mb-8"
         )} style={{ 
           pageBreakInside: 'avoid', 
           breakInside: 'avoid',
           display: 'grid',
           position: 'relative',
         }}>
          <div className="header-left">
            <h1 className="text-2xl font-normal tracking-wide">
              {resumeData.personalInfo.fullName}
            </h1>
            <div className="mt-1 text-sm text-gray-600">
              {resumeData.personalInfo.title}
            </div>
          </div>
          <div className="header-right">
            <div className="flex flex-col gap-1 text-right text-sm">
              {resumeData.personalInfo.email && (
                <span>{resumeData.personalInfo.email}</span>
              )}
              {resumeData.personalInfo.phone && (
                <span>{resumeData.personalInfo.phone}</span>
              )}
              {resumeData.personalInfo.location && (
                <span>{resumeData.personalInfo.location}</span>
              )}
              <div className="flex justify-end gap-3 mt-1">
                {resumeData.personalInfo.linkedin && (
                  <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="resume-link">
                    LinkedIn
                  </a>
                )}
                {resumeData.personalInfo.github && (
                  <a href={resumeData.personalInfo.github} target="_blank" rel="noopener noreferrer" className="resume-link">
                    GitHub
                  </a>
                )}
                {resumeData.personalInfo.website && (
                  <a href={resumeData.personalInfo.website} target="_blank" rel="noopener noreferrer" className="resume-link">
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    }
    
    // Professional theme header
    if (style.theme === 'professional') {
      return (
        <section className={cn(
           "pdf-section",
           forExport ? "mb-3" : "mb-6"
         )} style={{ 
           pageBreakInside: 'avoid', 
           breakInside: 'avoid',
           display: 'block',
           position: 'relative',
           background: `linear-gradient(to right, ${style.accentColor}20, transparent)`,
           padding: '15px',
           borderLeft: `4px solid ${style.accentColor}`
         }}>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">
            {resumeData.personalInfo.fullName}
          </h1>
          <div className="header-title text-lg mt-1">
            {resumeData.personalInfo.title}
          </div>
          <div className="header-contacts flex flex-wrap gap-3 mt-2 text-sm">
            {resumeData.personalInfo.email && (
              <span>{resumeData.personalInfo.email}</span>
            )}
            {resumeData.personalInfo.phone && (
              <span>{resumeData.personalInfo.phone}</span>
            )}
            {resumeData.personalInfo.location && (
              <span>{resumeData.personalInfo.location}</span>
            )}
          </div>
          <div className="flex gap-4 mt-2 text-sm">
            {resumeData.personalInfo.linkedin && (
              <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="resume-link">
                LinkedIn
              </a>
            )}
            {resumeData.personalInfo.github && (
              <a href={resumeData.personalInfo.github} target="_blank" rel="noopener noreferrer" className="resume-link">
                GitHub
              </a>
            )}
            {resumeData.personalInfo.website && (
              <a href={resumeData.personalInfo.website} target="_blank" rel="noopener noreferrer" className="resume-link">
                Portfolio
              </a>
            )}
          </div>
        </section>
      );
    }
    
    // Creative theme header
    if (style.theme === 'creative') {
      return (
        <section className="pdf-section resume-header" style={{ 
          pageBreakInside: 'avoid', 
          breakInside: 'avoid',
        }}>
          <h1>
            {resumeData.personalInfo.fullName}
          </h1>
          <h2 className="mt-2 mb-4">
            {resumeData.personalInfo.title}
          </h2>
          <div className="flex flex-wrap justify-center gap-4 text-sm mt-4">
            {resumeData.personalInfo.email && (
              <span className="text-white opacity-90">{resumeData.personalInfo.email}</span>
            )}
            {resumeData.personalInfo.phone && (
              <span className="text-white opacity-90">{resumeData.personalInfo.phone}</span>
            )}
            {resumeData.personalInfo.location && (
              <span className="text-white opacity-90">{resumeData.personalInfo.location}</span>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-3">
            {resumeData.personalInfo.linkedin && (
              <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="resume-link bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm hover:bg-opacity-30 transition-all">
                LinkedIn
              </a>
            )}
            {resumeData.personalInfo.github && (
              <a href={resumeData.personalInfo.github} target="_blank" rel="noopener noreferrer" className="resume-link bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm hover:bg-opacity-30 transition-all">
                GitHub
              </a>
            )}
            {resumeData.personalInfo.website && (
              <a href={resumeData.personalInfo.website} target="_blank" rel="noopener noreferrer" className="resume-link bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm hover:bg-opacity-30 transition-all">
                Portfolio
              </a>
            )}
          </div>
        </section>
      );
    }
    
    // Technical theme header
    if (style.theme === 'technical') {
      return (
        <section className="pdf-section resume-header" style={{ 
          pageBreakInside: 'avoid', 
          breakInside: 'avoid',
        }}>
          <div className="header-left">
            <h1>
              {resumeData.personalInfo.fullName}
            </h1>
            <div className="mt-1">
              {resumeData.personalInfo.title}
            </div>
          </div>
          <div className="header-right">
            {resumeData.personalInfo.email && (
              <span>{resumeData.personalInfo.email}</span>
            )}
            {resumeData.personalInfo.phone && (
              <span>{resumeData.personalInfo.phone}</span>
            )}
            {resumeData.personalInfo.location && (
              <span>{resumeData.personalInfo.location}</span>
            )}
            <div className="flex justify-end gap-3">
              {resumeData.personalInfo.linkedin && (
                <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="resume-link">
                  LinkedIn
                </a>
              )}
              {resumeData.personalInfo.github && (
                <a href={resumeData.personalInfo.github} target="_blank" rel="noopener noreferrer" className="resume-link">
                  GitHub
                </a>
              )}
              {resumeData.personalInfo.website && (
                <a href={resumeData.personalInfo.website} target="_blank" rel="noopener noreferrer" className="resume-link">
                  Portfolio
                </a>
              )}
            </div>
          </div>
        </section>
      );
    }
    
    // Executive theme header
    if (style.theme === 'executive') {
      return (
        <section className="pdf-section resume-header" style={{ 
          pageBreakInside: 'avoid', 
          breakInside: 'avoid',
        }}>
          <h1>
            {resumeData.personalInfo.fullName}
          </h1>
          <div className="text-lg my-2">
            {resumeData.personalInfo.title}
          </div>
          <div className="flex justify-center gap-6 text-sm">
            {resumeData.personalInfo.email && (
              <span>{resumeData.personalInfo.email}</span>
            )}
            {resumeData.personalInfo.phone && (
              <span>{resumeData.personalInfo.phone}</span>
            )}
            {resumeData.personalInfo.location && (
              <span>{resumeData.personalInfo.location}</span>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-3 text-sm">
            {resumeData.personalInfo.linkedin && (
              <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="resume-link">
                LinkedIn
              </a>
            )}
            {resumeData.personalInfo.github && (
              <a href={resumeData.personalInfo.github} target="_blank" rel="noopener noreferrer" className="resume-link">
                GitHub
              </a>
            )}
            {resumeData.personalInfo.website && (
              <a href={resumeData.personalInfo.website} target="_blank" rel="noopener noreferrer" className="resume-link">
                Portfolio
              </a>
            )}
          </div>
        </section>
      );
    }
    
    // Default fallback (should never reach here)
    return null;
  };

  const renderContent = () => {
    return (
      <div className={cn(
        forExport ? "space-y-3 print:block" : "space-y-6",
        {
          'font-inter': style.font === 'inter',
          'font-roboto': style.font === 'roboto',
          'font-merriweather': style.font === 'merriweather',
          'font-playfair': style.font === 'playfair',
          'text-sm': style.fontSize === 'small',
          'text-base': style.fontSize === 'medium',
          'text-lg': style.fontSize === 'large',
          'space-y-2': style.spacing === 'compact' || forExport,
          'space-y-4': style.spacing === 'comfortable' && !forExport,
          'space-y-6': style.spacing === 'spacious' && !forExport,
          'resume-theme-modern': style.theme === 'modern',
          'resume-theme-classic': style.theme === 'classic',
          'resume-theme-minimal': style.theme === 'minimal',
          'resume-theme-professional': style.theme === 'professional',
          'resume-theme-creative': style.theme === 'creative',
          'resume-theme-technical': style.theme === 'technical',
          'resume-theme-executive': style.theme === 'executive',
        }
      )} style={{ 
        letterSpacing: '0.01em', 
        lineHeight: forExport ? '1.3' : '1.6',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        color: style.theme === 'minimal' ? '#333' : 'inherit',
        ...(forExport && {
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
          breakInside: 'auto',
          pageBreakInside: 'auto',
        })
      }}>
        {renderHeader()}

        {/* Summary */}
        {resumeData.personalInfo.summary && (
          <section className={cn(
            "pdf-section", 
            forExport ? "mb-3" : "mb-6"
          )} style={{ 
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
            display: 'block',
            position: 'relative',
          }}>
            <h2 className="text-lg font-semibold border-b pb-1.5 mb-2 tracking-wide" style={{ borderColor: style.accentColor }}>
              Summary
            </h2>
            <p className="whitespace-pre-line leading-relaxed">{resumeData.personalInfo.summary}</p>
          </section>
        )}

        {/* Experience */}
        {resumeData.experiences.length > 0 && (
          <section className={cn(
            "pdf-section print:block", 
            forExport ? "mb-3" : "mb-6"
          )} style={{ 
            pageBreakInside: 'auto', 
            breakInside: 'auto',
            display: 'block',
            position: 'relative',
          }}>
            <h2 className="text-lg font-semibold pb-1.5 mb-2 tracking-wide">
              Experience
            </h2>
            <div className={forExport ? "space-y-2" : "space-y-5"}>
              {resumeData.experiences.map((exp, index) => (
                <div key={index} className="space-y-1" style={{ 
                  pageBreakInside: 'avoid', 
                  breakInside: 'avoid',
                  display: 'block',
                  position: 'relative',
                }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium tracking-wide">{exp.position}</h3>
                      <p className="text-sm tracking-wide">{exp.company} • {exp.location}</p>
                    </div>
                    <p className="text-sm tracking-wide">
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </p>
                  </div>
                  <p className="text-sm tracking-wide leading-relaxed">{exp.description}</p>
                  {exp.achievements.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="text-sm tracking-wide leading-relaxed">{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {resumeData.education.length > 0 && (
          <section className={cn("pdf-section", forExport ? "mb-3" : "mb-6")} style={{ 
            pageBreakInside: 'avoid', 
            breakInside: 'avoid',
            display: 'block',
            position: 'relative',
          }}>
            <h2 className="text-lg font-semibold border-b pb-1.5 mb-2 tracking-wide" style={{ borderColor: style.accentColor }}>
              Education
            </h2>
            <div className={forExport ? "space-y-2" : "space-y-5"}>
              {resumeData.education.map((edu, index) => (
                <div key={index} className="space-y-1" style={{ 
                  pageBreakInside: 'avoid', 
                  breakInside: 'avoid',
                  display: 'block',
                  position: 'relative',
                }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium tracking-wide">{edu.degree} in {edu.field}</h3>
                      <p className="text-sm tracking-wide">{edu.school} • {edu.location}</p>
                    </div>
                    <p className="text-sm tracking-wide">
                      {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                    </p>
                  </div>
                  {edu.gpa && <p className="text-sm tracking-wide">GPA: {edu.gpa}</p>}
                  {edu.achievements.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      {edu.achievements.map((achievement, i) => (
                        <li key={i} className="text-sm tracking-wide leading-relaxed">{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {resumeData.skills.length > 0 && (
          <section className={cn("pdf-section", forExport ? "mb-3" : "mb-6")} style={{ 
            pageBreakInside: 'avoid', 
            breakInside: 'avoid',
            display: 'block',
            position: 'relative',
          }}>
            <h2 className="text-lg font-semibold border-b pb-1.5 mb-2 tracking-wide" style={{ borderColor: style.accentColor }}>
              Skills
            </h2>
            <div className={forExport ? "space-y-1.5" : "space-y-4"}>
              {resumeData.skills.map((category, index) => (
                <div key={index} style={{ 
                  pageBreakInside: 'avoid', 
                  breakInside: 'avoid',
                  display: 'block',
                  position: 'relative',
                }}>
                  <h3 className="font-medium text-sm tracking-wide mb-0.5">{category.name}</h3>
                  <p className="text-sm tracking-wide leading-relaxed">{category.skills.join(" • ")}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {resumeData.projects.length > 0 && (
          <section className={cn(
            "pdf-section print:block", 
            forExport ? "mb-3" : "mb-6"
          )} style={{ 
            breakInside: 'auto',
            pageBreakInside: 'auto',
            display: 'block',
            position: 'relative',
          }}>
            <h2 className="text-lg font-semibold border-b pb-1.5 mb-2 tracking-wide" style={{ borderColor: style.accentColor }}>
              Projects
            </h2>
            <div className={cn(
              "project-items-container",
              forExport ? "space-y-2" : "space-y-5"
            )}>
              {resumeData.projects.map((project, index) => (
                <div key={index} className={cn(
                  "project-item relative block space-y-1",
                  forExport ? "mb-4" : "mb-6"
                )} style={{
                  breakInside: 'auto',
                  pageBreakInside: 'auto',
                }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium tracking-wide">
                        {project.name}
                        {project.link && (
                          <a 
                            href={project.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="ml-2 text-sm hover:underline tracking-wide"
                            style={{ color: style.accentColor }}
                          >
                            View Project →
                          </a>
                        )}
                      </h3>
                      <p className="text-sm tracking-wide">{project.technologies.join(" • ")}</p>
                    </div>
                    {(project.startDate || project.endDate) && (
                      <p className="text-sm tracking-wide">
                        {project.startDate} - {project.current ? "Present" : project.endDate}
                      </p>
                    )}
                  </div>
                  <p className="text-sm tracking-wide leading-relaxed">{project.description}</p>
                  {project.achievements.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      {project.achievements.map((achievement, i) => (
                        <li key={i} className="text-sm tracking-wide leading-relaxed">{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Awards */}
        {resumeData.awards.length > 0 && (
          <section className={cn(
            "pdf-section print:block", 
            forExport ? "mb-3" : "mb-6"
          )} style={{ 
            breakInside: 'auto',
            pageBreakInside: 'auto',
            display: 'block',
            position: 'relative',
          }}>
            <h2 className="text-lg font-semibold border-b pb-1.5 mb-2 tracking-wide" style={{ borderColor: style.accentColor }}>
              Awards & Certifications
            </h2>
            <div className={forExport ? "space-y-2" : "space-y-5"}>
              {resumeData.awards.map((award, index) => (
                <div key={index} className="space-y-1" style={{ 
                  breakInside: 'auto',
                  pageBreakInside: 'auto',
                  display: 'block',
                  position: 'relative',
                }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium tracking-wide">{award.title}</h3>
                      <p className="text-sm tracking-wide">{award.issuer}</p>
                    </div>
                    <p className="text-sm tracking-wide">{award.date}</p>
                  </div>
                  <p className="text-sm tracking-wide leading-relaxed">{award.description}</p>
                  {award.link && (
                    <a 
                      href={award.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm hover:underline tracking-wide"
                      style={{ color: style.accentColor }}
                    >
                      View Certificate →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  if (forExport) {
    return (
      <div className="bg-white text-black print:block" style={{
        width: '100%',
        minHeight: '100%',
        overflow: 'visible',
        position: 'relative',
        breakInside: 'auto',
        pageBreakInside: 'auto',
        display: 'flex',
        flexDirection: 'column',
        color: '#000',
      }}>
        <div style={{
          ...containerStyle,
          minHeight: 'auto',
          height: 'auto',
          breakInside: 'auto',
          pageBreakInside: 'auto',
          margin: '0 auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          transform: 'none', // Ensure no scaling during export
          color: '#000',
        }} className="text-black print:block" ref={contentRef}>
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="resume-preview-wrapper" style={wrapperStyle}>
          <div
            ref={contentRef}
            className={cn(
          "resume-preview",
          "bg-white shadow-sm text-black", // Ensure text is black regardless of dark mode
          `resume-theme-${style.theme}`,
          {
            "print:shadow-none print:scale-100": forExport,
            "transition-all duration-300": !forExport,
          }
        )}
        style={containerStyle}
          >
            {renderContent()}
          </div>
    </div>
  );
};

export default ResumePreview; 