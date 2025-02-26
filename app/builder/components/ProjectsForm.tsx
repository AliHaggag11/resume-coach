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
  const [isGenerating, setIsGenerating] = useState(false);

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
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockDescriptions = [
      "Developed a full-stack web application using React and Node.js that streamlined the company's project management process. Implemented real-time collaboration features and automated task tracking.",
      "Created a mobile-responsive e-commerce platform using Next.js and Stripe, resulting in a 50% increase in mobile conversions. Integrated inventory management and analytics dashboard.",
      "Built a RESTful API service using Express and MongoDB that handles user authentication and data management. Implemented caching and rate limiting for improved performance.",
    ];
    
    const randomDescription = mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)];
    const newProjects = [...projects];
    newProjects[index] = { ...newProjects[index], description: randomDescription };
    setProjects(newProjects);
    updateProjects(newProjects);
    setIsGenerating(false);
    toast.success("Generated project description!");
  };

  const suggestTechnologies = async (index: number) => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockTechStacks = [
      ["React", "TypeScript", "Node.js", "Express", "MongoDB"],
      ["Next.js", "TailwindCSS", "Prisma", "PostgreSQL", "AWS"],
      ["Vue.js", "Python", "Django", "Redis", "Docker"],
      ["Angular", "NestJS", "GraphQL", "MySQL", "Azure"],
    ];
    
    const randomStack = mockTechStacks[Math.floor(Math.random() * mockTechStacks.length)];
    const newProjects = [...projects];
    newProjects[index] = { ...newProjects[index], technologies: randomStack };
    setProjects(newProjects);
    updateProjects(newProjects);
    setIsGenerating(false);
    toast.success("Generated technology stack!");
  };

  const generateAchievements = async (index: number) => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockAchievements = [
      "Reduced page load time by 60% through code optimization and lazy loading",
      "Implemented automated testing achieving 90% code coverage",
      "Decreased API response time by 40% using caching strategies",
      "Integrated CI/CD pipeline reducing deployment time by 70%",
      "Enhanced security with OAuth 2.0 and rate limiting",
    ];
    
    const selectedAchievements = mockAchievements
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const newProjects = [...projects];
    newProjects[index] = { ...newProjects[index], achievements: selectedAchievements };
    setProjects(newProjects);
    updateProjects(newProjects);
    setIsGenerating(false);
    toast.success("Generated project achievements!");
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
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  Generate Description
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
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  Suggest Tech Stack
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
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  Generate Achievements
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