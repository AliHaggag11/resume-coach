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

  const containerStyle = {
    width: `${A4_DIMENSIONS.width}px`,
    minHeight: forExport ? 'auto' : `${A4_DIMENSIONS.height}px`,
    padding: `${A4_DIMENSIONS.padding}px`,
    transform: forExport ? 'none' : `scale(${isMobile ? 0.35 : scale})`,
    transformOrigin: 'top left',
    overflow: 'visible',
    ...(forExport && {
      backgroundColor: 'white',
      position: 'relative' as const,
      margin: '0 auto',
    })
  };

  const wrapperStyle = {
    width: `${A4_DIMENSIONS.width * (isMobile ? 0.35 : scale)}px`,
    height: forExport ? 'auto' : `${A4_DIMENSIONS.height * (isMobile ? 0.35 : scale)}px`,
    overflow: forExport ? 'visible' : 'auto',
  };

  const renderContent = () => {
    return (
      <div className={cn(
        forExport ? "space-y-3 print:block" : "space-y-6",
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
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        ...(forExport && {
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
          breakInside: 'auto',
          pageBreakInside: 'auto',
        })
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
          <section className={cn(
            "pdf-section print:block", 
            forExport ? "mb-3" : "mb-6"
          )} style={{ 
            pageBreakInside: 'auto', 
            breakInside: 'auto',
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
      <div className="bg-white [&_*]:text-black print:block" style={{
        width: '100%',
        minHeight: '100%',
        overflow: 'visible',
        position: 'relative',
        breakInside: 'auto',
        pageBreakInside: 'auto',
        display: 'flex',
        flexDirection: 'column',
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
        }} className="[&_*]:text-black print:block" ref={contentRef}>
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="resume-preview relative bg-white shadow-lg">
      <div className="flex justify-center">
        <div 
          style={wrapperStyle} 
          className={cn(
            "relative bg-white shadow-lg transition-transform duration-200 [&_*]:text-black",
            isMobile && "touch-pan-y md:touch-auto"
          )}
        >
          <div
            ref={contentRef}
            style={{
              ...containerStyle,
              marginTop: 0,
            }}
            className={cn(
              "bg-white transition-transform duration-200",
              !forExport && "hover:shadow-xl"
            )}
          >
            {renderContent()}
          </div>
        </div>
      </div>

      {isCalculating && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default ResumePreview; 