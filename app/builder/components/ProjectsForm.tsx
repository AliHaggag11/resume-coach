"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Link as LinkIcon, Wand2, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useResume } from "@/app/context/ResumeContext";
import { toast } from "sonner";
import { useSubscription } from "@/app/context/SubscriptionContext";
import { CREDIT_COSTS } from "@/app/context/SubscriptionContext";

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

export default function ProjectsForm() {
  const { resumeData, updateProjects } = useResume();
  const { spendCredits } = useSubscription();
  const [projects, setProjects] = useState<Project[]>(
    resumeData.projects.length > 0
      ? resumeData.projects
      : [
          {
            name: "",
            description: "",
            technologies: [""],
            link: "",
            startDate: "",
            endDate: "",
            current: false,
            achievements: [""],
          },
        ]
  );
  const [generatingDescription, setGeneratingDescription] = useState<number | null>(null);
  const [generatingAchievements, setGeneratingAchievements] = useState<number | null>(null);
  const [generatingTechnologies, setGeneratingTechnologies] = useState<number | null>(null);

  const addProject = () => {
    setProjects([
      ...projects,
      {
        name: "",
        description: "",
        technologies: [""],
        link: "",
        startDate: "",
        endDate: "",
        current: false,
        achievements: [""],
      },
    ]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
    updateProjects(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const newProjects = [...projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setProjects(newProjects);
    updateProjects(newProjects);
  };

  const addTechnology = (projectIndex: number) => {
    const newProjects = [...projects];
    newProjects[projectIndex].technologies.push("");
    setProjects(newProjects);
    updateProjects(newProjects);
  };

  const updateTechnology = (projectIndex: number, techIndex: number, value: string) => {
    const newProjects = [...projects];
    newProjects[projectIndex].technologies[techIndex] = value;
    setProjects(newProjects);
    updateProjects(newProjects);
  };

  const removeTechnology = (projectIndex: number, techIndex: number) => {
    const newProjects = [...projects];
    newProjects[projectIndex].technologies = newProjects[projectIndex].technologies.filter(
      (_, i) => i !== techIndex
    );
    setProjects(newProjects);
    updateProjects(newProjects);
  };

  const addAchievement = (projectIndex: number) => {
    const newProjects = [...projects];
    newProjects[projectIndex].achievements.push("");
    setProjects(newProjects);
    updateProjects(newProjects);
  };

  const updateAchievement = (projectIndex: number, achievementIndex: number, value: string) => {
    const newProjects = [...projects];
    newProjects[projectIndex].achievements[achievementIndex] = value;
    setProjects(newProjects);
    updateProjects(newProjects);
  };

  const removeAchievement = (projectIndex: number, achievementIndex: number) => {
    const newProjects = [...projects];
    newProjects[projectIndex].achievements = newProjects[projectIndex].achievements.filter(
      (_, i) => i !== achievementIndex
    );
    setProjects(newProjects);
    updateProjects(newProjects);
  };

  const generateDescription = async (index: number) => {
    try {
      const project = projects[index];
      
      // Validate required fields
      if (!project.name.trim()) {
        toast.error("Please enter a project name before generating description");
        return;
      }

      // Check and spend credits
      const creditCost = CREDIT_COSTS.RESUME.GENERATE_PROJECT_DESCRIPTION;
      const canSpendCredits = await spendCredits(
        creditCost, 
        'RESUME.GENERATE_PROJECT_DESCRIPTION', 
        `Generated description for project ${project.name}`
      );

      if (!canSpendCredits) {
        return; // The spendCredits function will show appropriate error messages
      }

      setGeneratingDescription(index);
      
      const prompt = {
        content: {
          projectName: project.name,
          context: `Generate a detailed technical description for a project named "${project.name}". The description should:
1. Start with a strong action verb
2. Include the main technologies or methodologies used
3. Highlight the key features or functionality
4. Mention the impact or purpose of the project
5. Keep it to 2-3 impactful sentences

Example format:
"Developed a machine learning-powered recommendation engine using Python and TensorFlow, implementing collaborative filtering algorithms to analyze user behavior patterns. Integrated the system with a React frontend and REST API, resulting in a 40% increase in user engagement."

Respond with ONLY the description, no additional text or context.`
        }
      };

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, type: 'suggest' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to generate description');
      }

      if (!data.result) {
        throw new Error('No description generated');
      }

      const newProjects = [...projects];
      newProjects[index] = { ...newProjects[index], description: data.result.trim() };
      setProjects(newProjects);
      updateProjects(newProjects);
      toast.success("Generated project description!");
    } catch (error: any) {
      console.error('Error generating description:', error);
      toast.error(error.message || 'Failed to generate description');
    } finally {
      setGeneratingDescription(null);
    }
  };

  const suggestTechnologies = async (index: number) => {
    try {
      const project = projects[index];
      
      // Validate required fields
      if (!project.description.trim()) {
        toast.error("Please generate or enter a project description first");
        return;
      }

      setGeneratingTechnologies(index);
      
      const prompt = {
        content: {
          projectName: project.name,
          description: project.description,
          context: `Based on this project description, extract a list of 4-6 specific technologies that would be used to build this project. Focus on:
1. Programming languages
2. Frameworks and libraries
3. Databases or storage solutions
4. Development tools or platforms

Return ONLY the technology names, one per line. Example:
React
TypeScript
Node.js
MongoDB
AWS S3
Docker

Do not include any additional text, bullets, or formatting.`
        }
      };

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, type: 'suggest' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to generate technologies');
      }

      if (!data.result) {
        throw new Error('No technologies generated');
      }

      // Process the technologies
      const techList = data.result
        .split('\n')
        .map((tech: string) => tech.trim())
        .filter((tech: string) => tech.length > 0);

      const newProjects = [...projects];
      const currentProject = newProjects[index];
      
      // If there's only an empty technology, replace it
      if (currentProject.technologies.length === 1 && !currentProject.technologies[0]) {
        currentProject.technologies = techList;
      } else {
        // Otherwise, append new technologies
        currentProject.technologies = [...currentProject.technologies, ...techList];
      }

      setProjects(newProjects);
      updateProjects(newProjects);
      toast.success("Generated technology stack!");
    } catch (error: any) {
      console.error('Error generating technologies:', error);
      toast.error(error.message || 'Failed to generate technologies');
    } finally {
      setGeneratingTechnologies(null);
    }
  };

  const generateAchievements = async (index: number) => {
    try {
      const project = projects[index];
      
      // Validate required fields
      if (!project.description.trim()) {
        toast.error("Please generate or enter a project description first");
        return;
      }

      // Check and spend credits
      const creditCost = CREDIT_COSTS.RESUME.GENERATE_PROJECT_ACHIEVEMENTS;
      const canSpendCredits = await spendCredits(
        creditCost, 
        'RESUME.GENERATE_PROJECT_ACHIEVEMENTS', 
        `Generated achievements for project ${project.name}`
      );

      if (!canSpendCredits) {
        return; // The spendCredits function will show appropriate error messages
      }

      setGeneratingAchievements(index);
      
      const prompt = {
        content: {
          projectName: project.name,
          description: project.description,
          context: `Based on this project description, generate 3-4 specific, quantifiable achievements that demonstrate the project's impact. Each achievement should:
1. Start with a strong action verb
2. Include specific metrics or numbers
3. Highlight technical impact
4. Mention specific technologies when relevant

Format each achievement as a complete, impactful statement.

Example achievements:
- Reduced API response time by 65% through implementation of Redis caching
- Achieved 95% test coverage using Jest and React Testing Library
- Decreased bundle size by 40% through code splitting and lazy loading

Respond with ONLY the achievements, one per line, starting with a dash (-). Each achievement must start with a dash. Do not use asterisks or bullet points.`
        }
      };

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, type: 'suggest' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to generate achievements');
      }

      if (!data.result) {
        throw new Error('No achievements generated');
      }

      // Process the achievements
      const achievementsList = data.result
        .split('\n') // Split by newlines first
        .map((line: string) => line.trim())
        .filter((line: string) => line.startsWith('-')) // Only keep lines that start with a dash
        .map((line: string) => line.substring(1).trim()) // Remove the dash
        .filter((achievement: string) => achievement.length > 0);

      const newProjects = [...projects];
      const currentProject = newProjects[index];
      
      // If there's only an empty achievement, replace it
      if (currentProject.achievements.length === 1 && !currentProject.achievements[0]) {
        currentProject.achievements = achievementsList;
      } else {
        // Otherwise, append new achievements
        currentProject.achievements = [...currentProject.achievements, ...achievementsList];
      }

      setProjects(newProjects);
      updateProjects(newProjects);
      toast.success("Generated project achievements!");
    } catch (error: any) {
      console.error('Error generating achievements:', error);
      toast.error(error.message || 'Failed to generate achievements');
    } finally {
      setGeneratingAchievements(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {projects.map((project, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-xl">Project {index + 1}</CardTitle>
            <CardDescription>Add details about your project</CardDescription>
            {index > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                onClick={() => removeProject(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Project Name"
              value={project.name}
              onChange={(e) => updateProject(index, "name", e.target.value)}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Project Description</label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => generateDescription(index)}
                  disabled={generatingDescription !== null || !project.name.trim()}
                >
                  {generatingDescription === index ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Description ({CREDIT_COSTS.RESUME.GENERATE_PROJECT_DESCRIPTION} Credits)
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                placeholder="Project Description"
                value={project.description}
                onChange={(e) => updateProject(index, "description", e.target.value)}
                className="h-24"
              />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Project URL"
                value={project.link}
                onChange={(e) => updateProject(index, "link", e.target.value)}
              />
              {project.link && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(project.link, "_blank")}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                placeholder="Start Date"
                value={project.startDate}
                onChange={(e) => updateProject(index, "startDate", e.target.value)}
              />
              <Input
                type="date"
                placeholder="End Date"
                value={project.endDate}
                onChange={(e) => updateProject(index, "endDate", e.target.value)}
                disabled={project.current}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={project.current}
                onChange={(e) => updateProject(index, "current", e.target.checked)}
                className="rounded border-gray-300"
              />
              <label>This is a current project</label>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Technologies Used</label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => suggestTechnologies(index)}
                  disabled={generatingTechnologies !== null || !project.description.trim()}
                >
                  {generatingTechnologies === index ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Tech Stack ({CREDIT_COSTS.RESUME.GENERATE_PROJECT_TECH_STACK} Credits)
                    </>
                  )}
                </Button>
              </div>
              {project.technologies.map((tech, techIndex) => (
                <div key={techIndex} className="flex gap-2">
                  <Input
                    placeholder="Technology"
                    value={tech}
                    onChange={(e) => updateTechnology(index, techIndex, e.target.value)}
                  />
                  {techIndex > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTechnology(index, techIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addTechnology(index)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Technology
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Key Achievements</label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => generateAchievements(index)}
                  disabled={generatingAchievements !== null || !project.description.trim()}
                >
                  {generatingAchievements === index ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Achievements ({CREDIT_COSTS.RESUME.GENERATE_PROJECT_ACHIEVEMENTS} Credits)
                    </>
                  )}
                </Button>
              </div>
              {project.achievements.map((achievement, achievementIndex) => (
                <div key={achievementIndex} className="flex gap-2">
                  <Input
                    placeholder="Achievement"
                    value={achievement}
                    onChange={(e) =>
                      updateAchievement(index, achievementIndex, e.target.value)
                    }
                  />
                  {achievementIndex > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAchievement(index, achievementIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addAchievement(index)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Achievement
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button onClick={addProject} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Another Project
      </Button>
    </div>
  );
} 