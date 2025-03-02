"use client";

import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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

interface ResumeData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: SkillCategory[];
  projects: Project[];
  awards: Award[];
}

interface ResumeContextType {
  resumeData: ResumeData;
  currentResumeId: string | null;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateExperiences: (experiences: Experience[]) => void;
  updateEducation: (education: Education[]) => void;
  updateSkills: (skills: SkillCategory[]) => void;
  updateProjects: (projects: Project[]) => void;
  updateAwards: (awards: Award[]) => void;
  setCurrentResumeId: (id: string | null) => void;
  saveResume: (status?: 'draft' | 'completed') => Promise<void>;
  loadResume: (id: string) => Promise<void>;
}

const defaultResumeData: ResumeData = {
  personalInfo: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    linkedin: "",
    github: "",
    website: "",
  },
  experiences: [],
  education: [],
  skills: [],
  projects: [],
  awards: [],
};

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);

  const updatePersonalInfo = (info: Partial<PersonalInfo>) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...info },
    }));
  };

  const updateExperiences = (experiences: Experience[]) => {
    setResumeData(prev => ({ ...prev, experiences }));
  };

  const updateEducation = (education: Education[]) => {
    setResumeData(prev => ({ ...prev, education }));
  };

  const updateSkills = (skills: SkillCategory[]) => {
    setResumeData(prev => ({ ...prev, skills }));
  };

  const updateProjects = (projects: Project[]) => {
    setResumeData(prev => ({ ...prev, projects }));
  };

  const updateAwards = (awards: Award[]) => {
    setResumeData(prev => ({ ...prev, awards }));
  };

  const saveResume = async (status?: 'draft' | 'completed') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to save your progress');
        return;
      }

      let result;
      if (currentResumeId) {
        // Update existing resume
        const { error: updateError } = await supabase
          .from('resumes')
          .update({
            content: resumeData,
            status: status || 'draft',
            title: resumeData.personalInfo.fullName ? 
              `${resumeData.personalInfo.fullName}'s Resume` : 
              'Untitled Resume'
          })
          .eq('id', currentResumeId);

        if (updateError) throw updateError;
        result = { data: { id: currentResumeId } };
      } else {
        // Create new resume
        const { data, error: insertError } = await supabase
          .from('resumes')
          .insert({
            user_id: session.user.id,
            content: resumeData,
            status: status || 'draft',
            title: resumeData.personalInfo.fullName ? 
              `${resumeData.personalInfo.fullName}'s Resume` : 
              'Untitled Resume'
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        result = { data };
      }

      setCurrentResumeId(result.data.id);
      
      if (status) {
        toast.success(status === 'completed' ? 'Resume saved as completed' : 'Resume saved as draft');
      }
    } catch (error: any) {
      console.error('Failed to save resume:', error);
      toast.error(error.message || 'Failed to save resume');
      throw error;
    }
  };

  const loadResume = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to load your resume');
        return;
      }

      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Failed to load resume:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Resume not found');
      }

      setResumeData(data.content);
      setCurrentResumeId(data.id);
      toast.success('Resume loaded successfully');
    } catch (error: any) {
      console.error('Failed to load resume:', error);
      toast.error(error.message || 'Failed to load resume');
      throw error; // Re-throw to handle in the component
    }
  };

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        currentResumeId,
        updatePersonalInfo,
        updateExperiences,
        updateEducation,
        updateSkills,
        updateProjects,
        updateAwards,
        setCurrentResumeId,
        saveResume,
        loadResume,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return context;
} 