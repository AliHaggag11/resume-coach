"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Wand2, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useResume } from "@/app/context/ResumeContext";
import { toast } from "sonner";

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

export default function ExperienceForm() {
  const { resumeData, updateExperiences } = useResume();
  const [experiences, setExperiences] = useState<Experience[]>(
    resumeData.experiences.length > 0
      ? resumeData.experiences
      : [
          {
            company: "",
            position: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
            achievements: [""],
          },
        ]
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
        achievements: [""],
      },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const newExperiences = [...experiences];
    newExperiences[index] = { ...newExperiences[index], [field]: value };
    setExperiences(newExperiences);
    updateExperiences(newExperiences);
  };

  const addAchievement = (experienceIndex: number) => {
    const newExperiences = [...experiences];
    newExperiences[experienceIndex].achievements.push("");
    setExperiences(newExperiences);
    updateExperiences(newExperiences);
  };

  const updateAchievement = (experienceIndex: number, achievementIndex: number, value: string) => {
    const newExperiences = [...experiences];
    newExperiences[experienceIndex].achievements[achievementIndex] = value;
    setExperiences(newExperiences);
    updateExperiences(newExperiences);
  };

  const removeAchievement = (experienceIndex: number, achievementIndex: number) => {
    const newExperiences = [...experiences];
    newExperiences[experienceIndex].achievements = newExperiences[experienceIndex].achievements.filter(
      (_, i) => i !== achievementIndex
    );
    setExperiences(newExperiences);
    updateExperiences(newExperiences);
  };

  const generateDescription = async (index: number) => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockDescriptions = [
      "Led a team of 5 developers in building a high-performance web application using React and Node.js. Implemented CI/CD pipelines and reduced deployment time by 60%.",
      "Developed and maintained multiple microservices using Spring Boot and Docker. Improved system reliability and reduced downtime by implementing robust error handling and monitoring.",
      "Architected and implemented a scalable backend system using AWS services. Reduced infrastructure costs by 40% through optimization of cloud resources.",
    ];
    
    const randomDescription = mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)];
    const newExperiences = [...experiences];
    newExperiences[index] = { ...newExperiences[index], description: randomDescription };
    setExperiences(newExperiences);
    updateExperiences(newExperiences);
    setIsGenerating(false);
    toast.success("Generated job description!");
  };

  const generateAchievements = async (index: number) => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockAchievements = [
      "Increased application performance by 40% through code optimization and caching strategies",
      "Implemented automated testing suite resulting in 80% reduction in bug reports",
      "Led migration to microservices architecture, improving system scalability",
      "Mentored 3 junior developers, accelerating their professional growth",
    ];
    
    const selectedAchievements = mockAchievements
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const newExperiences = [...experiences];
    newExperiences[index] = { ...newExperiences[index], achievements: selectedAchievements };
    setExperiences(newExperiences);
    updateExperiences(newExperiences);
    setIsGenerating(false);
    toast.success("Generated achievements!");
  };

  return (
    <div className="space-y-6 p-6">
      {experiences.map((experience, index) => (
        <Card key={index} className="relative">
          <CardHeader>
            <CardTitle className="text-xl">Experience {index + 1}</CardTitle>
            <CardDescription>Add your work experience details</CardDescription>
            {index > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                onClick={() => removeExperience(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Company"
                value={experience.company}
                onChange={(e) => updateExperience(index, "company", e.target.value)}
              />
              <Input
                placeholder="Position"
                value={experience.position}
                onChange={(e) => updateExperience(index, "position", e.target.value)}
              />
            </div>
            <Input
              placeholder="Location"
              value={experience.location}
              onChange={(e) => updateExperience(index, "location", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                placeholder="Start Date"
                value={experience.startDate}
                onChange={(e) => updateExperience(index, "startDate", e.target.value)}
              />
              <Input
                type="date"
                placeholder="End Date"
                value={experience.endDate}
                onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                disabled={experience.current}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={experience.current}
                onChange={(e) => updateExperience(index, "current", e.target.checked)}
                className="rounded border-gray-300"
              />
              <label>I currently work here</label>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Job Description</label>
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
                placeholder="Job Description"
                value={experience.description}
                onChange={(e) => updateExperience(index, "description", e.target.value)}
                className="h-24"
              />
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
              {experience.achievements.map((achievement, achievementIndex) => (
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
      <Button onClick={addExperience} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Another Experience
      </Button>
    </div>
  );
} 