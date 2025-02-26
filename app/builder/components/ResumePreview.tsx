"use client";

import { useResume } from "@/app/context/ResumeContext";
import { useResumeStyle } from "@/app/context/ResumeStyleContext";
import { cn } from "@/lib/utils";

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

interface ResumePreviewProps {
  template: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ template }) => {
  const { resumeData } = useResume();
  const { style } = useResumeStyle();

  const themeStyles = {
    modern: {
      heading: "text-3xl font-bold mb-4 text-zinc-900 border-b border-primary/20 pb-4",
      subheading: "text-xl font-semibold mb-3 text-primary",
      section: "mb-8",
      item: "mb-6",
      title: "font-medium text-zinc-900",
      subtitle: "text-zinc-600",
      link: "text-primary hover:text-primary/80 hover:underline",
      container: "space-y-6",
      header: "mb-8",
      contactInfo: "flex flex-wrap gap-4 text-sm mt-4 text-zinc-600",
      description: "text-zinc-700 leading-relaxed",
      achievementList: "list-none space-y-2 mt-3",
      achievementItem: "flex items-start gap-2 text-zinc-700",
      bullet: "text-primary mt-1.5",
    },
    professional: {
      heading: "text-4xl font-serif font-bold mb-6 text-zinc-900",
      subheading: "text-2xl font-serif font-semibold mb-4 border-b-2 border-zinc-200 pb-2",
      section: "mb-10",
      item: "mb-8",
      title: "font-serif font-semibold text-zinc-900 text-lg",
      subtitle: "text-zinc-600 font-serif",
      link: "text-blue-600 hover:text-blue-800 font-serif",
      container: "space-y-8",
      header: "mb-10 text-center",
      contactInfo: "flex flex-wrap justify-center gap-6 text-sm mt-4 text-zinc-600 font-serif",
      description: "text-zinc-700 font-serif leading-relaxed",
      achievementList: "list-disc list-inside mt-3 space-y-2",
      achievementItem: "text-zinc-700 font-serif",
      bullet: "text-zinc-400",
    },
    creative: {
      heading: "text-4xl font-bold mb-4 text-primary bg-primary/5 inline-block px-4 py-2 rounded-lg",
      subheading: "text-xl font-bold mb-4 text-primary flex items-center gap-2 before:content-[''] before:h-px before:flex-1 before:bg-primary/20",
      section: "mb-8",
      item: "mb-6 bg-zinc-50 p-4 rounded-lg border border-zinc-100",
      title: "font-bold text-zinc-900",
      subtitle: "text-zinc-500",
      link: "text-primary hover:text-primary/80 font-medium",
      container: "space-y-8",
      header: "mb-8",
      contactInfo: "flex flex-wrap gap-4 text-sm mt-4 bg-zinc-50 p-4 rounded-lg",
      description: "text-zinc-700 mt-2",
      achievementList: "space-y-2 mt-3",
      achievementItem: "flex items-start gap-2 text-zinc-700 bg-white p-2 rounded border border-zinc-100",
      bullet: "text-primary",
    },
    minimal: {
      heading: "text-2xl font-medium mb-6 text-zinc-900",
      subheading: "text-lg font-medium mb-4 text-zinc-800 uppercase tracking-wider",
      section: "mb-8",
      item: "mb-6",
      title: "font-medium text-zinc-900",
      subtitle: "text-zinc-500 text-sm",
      link: "text-zinc-900 hover:text-zinc-600",
      container: "space-y-6",
      header: "mb-8",
      contactInfo: "flex flex-wrap gap-4 text-sm mt-3 text-zinc-500",
      description: "text-zinc-700 leading-relaxed",
      achievementList: "space-y-2 mt-2",
      achievementItem: "text-zinc-700 flex items-start gap-2",
      bullet: "text-zinc-300",
    },
  };

  const theme = themeStyles[template as keyof typeof themeStyles] || themeStyles.modern;

  return (
    <div className={cn("print:p-0 text-zinc-900", theme.container)}>
      {/* Header */}
      <header className={theme.header}>
        <h1 className={theme.heading}>
          {resumeData.personalInfo.fullName}
        </h1>
        <p className={theme.subtitle}>
          {resumeData.personalInfo.title}
        </p>
        <div className={theme.contactInfo}>
          <a href={`mailto:${resumeData.personalInfo.email}`} className={theme.link}>
            {resumeData.personalInfo.email}
          </a>
          <span>{resumeData.personalInfo.phone}</span>
          <span>{resumeData.personalInfo.location}</span>
          {resumeData.personalInfo.linkedin && (
            <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className={theme.link}>
              LinkedIn
            </a>
          )}
          {resumeData.personalInfo.github && (
            <a href={resumeData.personalInfo.github} target="_blank" rel="noopener noreferrer" className={theme.link}>
              GitHub
            </a>
          )}
          {resumeData.personalInfo.website && (
            <a href={resumeData.personalInfo.website} target="_blank" rel="noopener noreferrer" className={theme.link}>
              Portfolio
            </a>
          )}
        </div>
      </header>

      {/* Summary */}
      {resumeData.personalInfo.summary && (
        <section className={theme.section}>
          <h2 className={theme.subheading}>Professional Summary</h2>
          <p className={theme.description}>{resumeData.personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {resumeData.experiences.length > 0 && (
        <section className={theme.section}>
          <h2 className={theme.subheading}>Experience</h2>
          {resumeData.experiences.map((exp, index) => (
            <div key={index} className={theme.item}>
              <div className="flex justify-between items-start">
                <h3 className={theme.title}>{exp.position}</h3>
                <span className={theme.subtitle}>
                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              <p className={theme.subtitle}>{exp.company} • {exp.location}</p>
              <p className={theme.description}>{exp.description}</p>
              {exp.achievements.length > 0 && (
                <ul className={theme.achievementList}>
                  {exp.achievements.map((achievement, i) => (
                    <li key={i} className={theme.achievementItem}>
                      <span className={theme.bullet}>•</span>
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {resumeData.education.length > 0 && (
        <section className={theme.section}>
          <h2 className={theme.subheading}>Education</h2>
          {resumeData.education.map((edu, index) => (
            <div key={index} className={theme.item}>
              <div className="flex justify-between items-start">
                <h3 className={theme.title}>{edu.degree} in {edu.field}</h3>
                <span className={theme.subtitle}>
                  {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                </span>
              </div>
              <p className={theme.subtitle}>{edu.school} • {edu.location}</p>
              {edu.gpa && <p className={cn(theme.description, "mt-1")}>GPA: {edu.gpa}</p>}
              {edu.achievements.length > 0 && (
                <ul className={theme.achievementList}>
                  {edu.achievements.map((achievement, i) => (
                    <li key={i} className={theme.achievementItem}>
                      <span className={theme.bullet}>•</span>
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {resumeData.skills.length > 0 && (
        <section className={theme.section}>
          <h2 className={theme.subheading}>Skills</h2>
          {resumeData.skills.map((category, index) => (
            <div key={index} className={theme.item}>
              <h3 className={theme.title}>{category.name}</h3>
              <p className={cn(theme.description, "mt-1")}>{category.skills.join(", ")}</p>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {resumeData.projects.length > 0 && (
        <section className={theme.section}>
          <h2 className={theme.subheading}>Projects</h2>
          {resumeData.projects.map((project, index) => (
            <div key={index} className={theme.item}>
              <div className="flex justify-between items-start">
                <h3 className={theme.title}>{project.name}</h3>
                <span className={theme.subtitle}>
                  {project.startDate} - {project.current ? "Present" : project.endDate}
                </span>
              </div>
              <p className={theme.description}>{project.description}</p>
              {project.technologies.length > 0 && (
                <p className={cn(theme.description, "mt-2")}>
                  <span className="font-medium">Technologies:</span> {project.technologies.join(", ")}
                </p>
              )}
              {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer" className={cn(theme.link, "mt-2 block")}>
                  View Project
                </a>
              )}
              {project.achievements.length > 0 && (
                <ul className={theme.achievementList}>
                  {project.achievements.map((achievement, i) => (
                    <li key={i} className={theme.achievementItem}>
                      <span className={theme.bullet}>•</span>
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Awards */}
      {resumeData.awards.length > 0 && (
        <section className={theme.section}>
          <h2 className={theme.subheading}>Awards & Certifications</h2>
          {resumeData.awards.map((award, index) => (
            <div key={index} className={theme.item}>
              <div className="flex justify-between items-start">
                <h3 className={theme.title}>{award.title}</h3>
                <span className={theme.subtitle}>{award.date}</span>
              </div>
              <p className={theme.subtitle}>{award.issuer}</p>
              <p className={theme.description}>{award.description}</p>
              {award.link && (
                <a href={award.link} target="_blank" rel="noopener noreferrer" className={cn(theme.link, "mt-2 block")}>
                  View Certificate
                </a>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default ResumePreview; 