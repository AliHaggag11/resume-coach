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
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

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
    try {
      setIsGenerating(true);
      const experience = experiences[index];
      
      const prompt = {
        content: {
          position: experience.position,
          company: experience.company,
          current: experience.current,
          context: "Generate a professional and impactful job description highlighting responsibilities and impact. Focus on action verbs and quantifiable achievements."
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

      const newExperiences = [...experiences];
      newExperiences[index] = { ...newExperiences[index], description: data.result };
      setExperiences(newExperiences);
      updateExperiences(newExperiences);
      toast.success("Generated job description!");
    } catch (error: any) {
      console.error('Error generating description:', error);
      toast.error(error.message || 'Failed to generate description');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAchievements = async (index: number) => {
    try {
      setIsGenerating(true);
      const experience = experiences[index];
      
      const prompt = {
        content: {
          position: experience.position,
          company: experience.company,
          description: experience.description,
          context: "Generate 3-4 bullet points of specific, quantifiable achievements for this role. Each achievement should be on a new line and start with a bullet point (•). Focus on metrics, impact, and specific technologies or skills used."
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

      // Split the result into individual achievements and clean them up
      const achievementsList = data.result
        .split('\n')
        .map((achievement: string) => achievement.trim())
        .filter((achievement: string) => achievement.length > 0)
        .map((achievement: string) => achievement.replace(/^[•\-*]\s*/, '')); // Remove bullet points and spaces

      // Create a new experience object with the first achievement replacing the empty one
      const newExperiences = [...experiences];
      const currentExperience = newExperiences[index];
      
      // If there's only an empty achievement, replace it
      if (currentExperience.achievements.length === 1 && !currentExperience.achievements[0]) {
        currentExperience.achievements = [achievementsList[0]];
        achievementsList.shift(); // Remove the first achievement since we used it
      }
      
      // Add the remaining achievements
      achievementsList.forEach((achievement: string) => {
        currentExperience.achievements.push(achievement);
      });

      setExperiences(newExperiences);
      updateExperiences(newExperiences);
      toast.success("Generated achievements!");
    } catch (error: any) {
      console.error('Error generating achievements:', error);
      toast.error(error.message || 'Failed to generate achievements');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiSuggestion = async (index: number) => {
    try {
      setIsGenerating(true);
      const experience = experiences[index];
      
      const prompt = {
        content: {
          position: experience.position,
          company: experience.company,
          location: experience.location,
          startDate: experience.startDate,
          endDate: experience.endDate,
          current: experience.current,
          description: experience.description,
          achievements: experience.achievements,
          context: "Review and improve this work experience entry. Suggest improvements for the job description and achievements. Focus on making it more impactful and professional."
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
        throw new Error(data.details || data.error || 'Failed to get suggestions');
      }

      if (!data.result) {
        throw new Error('No suggestions generated');
      }

      setAiSuggestion(data.result);
      toast.success("AI suggestions received!");
    } catch (error: any) {
      console.error('Error getting suggestions:', error);
      toast.error(error.message || 'Failed to get suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {experiences.map((experience, index) => (
        <Card key={index} className="relative">
          <CardHeader>
            <CardTitle className="text-xl">Experience {index + 1}</CardTitle>
            <CardDescription>Add your work experience details</CardDescription>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => handleAiSuggestion(index)}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                Get Suggestions
              </Button>
              {index > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeExperience(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
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
                placeholder="* Increased revenue by 25% through implementation of new sales strategies
* Led a team of 5 developers in successful project delivery
* Reduced customer churn rate by 15% through improved service quality"
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
            {aiSuggestion && index === experiences.length - 1 && (
              <div className="mt-4 p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Wand2 className="h-4 w-4 text-primary" />
                    AI Suggestions
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAiSuggestion(null)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{aiSuggestion}</p>
              </div>
            )}
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