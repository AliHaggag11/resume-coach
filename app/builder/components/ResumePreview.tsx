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

  const A4_DIMENSIONS = {
    width: 794, // ~210mm in px at 96dpi
    height: 1123, // ~297mm in px at 96dpi
    padding: forExport ? 40 : 72, // Use smaller padding for export
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    if (!contentRef.current) return;

    const calculatePages = () => {
      setIsCalculating(true);
      const content = contentRef.current;
      if (!content) return;

      // Reset content height to get full height
      content.style.height = 'auto';
      
      const contentHeight = content.scrollHeight;
      const pageHeight = A4_DIMENSIONS.height - (A4_DIMENSIONS.padding * 2);
      const calculatedTotalPages = Math.ceil(contentHeight / pageHeight);
      
      // Only show pagination if we actually have content that spans multiple pages
      setTotalPages(contentHeight > pageHeight ? calculatedTotalPages : 1);
      setCurrentPage(1);
      
      // Set the content height to match the current page
      if (!forExport) {
        content.style.height = `${pageHeight}px`;
        content.style.overflow = 'hidden';
      }
      
      setIsCalculating(false);
    };

    calculatePages();
    window.addEventListener('resize', calculatePages);

    return () => {
      window.removeEventListener('resize', calculatePages);
    };
  }, [resumeData, style, forExport]);

  const containerStyle = {
    width: `${A4_DIMENSIONS.width}px`,
    minHeight: forExport ? 'auto' : `${A4_DIMENSIONS.height}px`,
    padding: `${A4_DIMENSIONS.padding}px`,
    transform: forExport ? 'none' : `scale(${scale})`,
    transformOrigin: 'top left',
  };

  const wrapperStyle = {
    width: `${A4_DIMENSIONS.width * scale}px`,
    height: forExport ? 'auto' : `${A4_DIMENSIONS.height * scale}px`,
    overflow: 'hidden',
  };

  const renderContent = () => {
    return (
      <div className={cn(
        forExport ? "space-y-3" : "space-y-6",
        style.font,
        {
          'text-sm': style.fontSize === 'small',
          'text-base': style.fontSize === 'medium',
          'text-lg': style.fontSize === 'large',
          'space-y-2': style.spacing === 'compact' || forExport,
          'space-y-4': style.spacing === 'comfortable' && !forExport,
          'space-y-6': style.spacing === 'spacious' && !forExport,
        }
      )} style={{ 
        letterSpacing: '0.01em', 
        lineHeight: forExport ? '1.3' : '1.6',
      }}>
        {/* Header */}
        <section className={cn(
          "text-center pdf-section",
          forExport ? "space-y-1.5 mb-3" : "space-y-3 mb-8"
        )} style={{ 
          pageBreakInside: 'avoid', 
          breakInside: 'avoid',
          display: 'block',
          position: 'relative',
        }}>
          <h1 className="text-2xl font-bold tracking-wide" style={{ color: style.accentColor }}>
            {resumeData.personalInfo.fullName}
          </h1>
          <p className="text-lg tracking-wide">
            {resumeData.personalInfo.title}
          </p>
          <div className="flex items-center justify-center gap-6 text-sm tracking-wide">
            <span>{resumeData.personalInfo.email}</span>
            <span>{resumeData.personalInfo.phone}</span>
            <span>{resumeData.personalInfo.location}</span>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm tracking-wide">
            {resumeData.personalInfo.linkedin && (
              <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" 
                className="hover:underline" style={{ color: style.accentColor }}>
                LinkedIn
              </a>
            )}
            {resumeData.personalInfo.github && (
              <a href={resumeData.personalInfo.github} target="_blank" rel="noopener noreferrer" 
                className="hover:underline" style={{ color: style.accentColor }}>
                GitHub
              </a>
            )}
            {resumeData.personalInfo.website && (
              <a href={resumeData.personalInfo.website} target="_blank" rel="noopener noreferrer" 
                className="hover:underline" style={{ color: style.accentColor }}>
                Portfolio
              </a>
            )}
          </div>
        </section>

        {/* Summary */}
        {resumeData.personalInfo.summary && (
          <section className={cn("pdf-section", forExport ? "mb-3" : "mb-6")} style={{ 
            pageBreakInside: 'avoid', 
            breakInside: 'avoid',
            display: 'block',
            position: 'relative',
          }}>
            <h2 className="text-lg font-semibold border-b pb-1.5 mb-2 tracking-wide" style={{ borderColor: style.accentColor }}>
              Professional Summary
            </h2>
            <p className="text-sm tracking-wide leading-relaxed">{resumeData.personalInfo.summary}</p>
          </section>
        )}

        {/* Experience */}
        {resumeData.experiences.length > 0 && (
          <section className={cn("pdf-section", forExport ? "mb-3" : "mb-6")} style={{ 
            pageBreakInside: 'avoid', 
            breakInside: 'avoid',
            display: 'block',
            position: 'relative',
          }}>
            <h2 className="text-lg font-semibold border-b pb-1.5 mb-2 tracking-wide" style={{ borderColor: style.accentColor }}>
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
            "pdf-section relative block",
            forExport ? "mb-3" : "mb-6"
          )} style={{ borderColor: style.accentColor }}>
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
                )}>
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
          <section className={cn("pdf-section", forExport ? "mb-3" : "mb-6")} style={{ 
            pageBreakInside: 'avoid', 
            breakInside: 'avoid',
            display: 'block',
            position: 'relative',
          }}>
            <h2 className="text-lg font-semibold border-b pb-1.5 mb-2 tracking-wide" style={{ borderColor: style.accentColor }}>
              Awards & Certifications
            </h2>
            <div className={forExport ? "space-y-2" : "space-y-5"}>
              {resumeData.awards.map((award, index) => (
                <div key={index} className="space-y-1" style={{ 
                  pageBreakInside: 'avoid', 
                  breakInside: 'avoid',
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
      <div style={containerStyle} className="bg-white" ref={contentRef}>
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="relative" style={wrapperStyle}>
      <div 
        style={{
          ...containerStyle,
          marginTop: forExport ? 0 : `${-A4_DIMENSIONS.height * (currentPage - 1)}px`,
          transition: 'margin-top 0.3s ease-in-out'
        }} 
        className={cn(
          "bg-white shadow-lg mx-auto",
          isCalculating && "opacity-0"
        )}
        ref={contentRef}
      >
        {renderContent()}
      </div>

      {totalPages > 1 && !isCalculating && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white rounded-full shadow px-3 py-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResumePreview; 