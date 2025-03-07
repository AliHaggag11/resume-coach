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
import { useSubscription } from "@/app/context/SubscriptionContext";
import { CREDIT_COSTS } from "@/app/context/SubscriptionContext";

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
  const { spendCredits } = useSubscription();
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
  const [generatingDescription, setGeneratingDescription] = useState<number | null>(null);
  const [generatingAchievements, setGeneratingAchievements] = useState<number | null>(null);

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
      const experience = experiences[index];
      
      // Validate required fields
      if (!experience.company.trim() || !experience.position.trim()) {
        toast.error("Please enter both company name and position before generating description");
        return;
      }

      // Check and spend credits
      const creditCost = CREDIT_COSTS.RESUME.GENERATE_DESCRIPTION;
      const canSpendCredits = await spendCredits(
        creditCost, 
        'RESUME.GENERATE_DESCRIPTION', 
        `Generated job description for ${experience.position} at ${experience.company}`
      );

      if (!canSpendCredits) {
        return; // The spendCredits function will show appropriate error messages
      }

      setGeneratingDescription(index);
      
      const prompt = {
        content: {
          position: experience.position,
          company: experience.company,
          current: experience.current,
          context: `Based on the ${experience.position} role, complete ONLY the following template with 2-3 strong action verbs and their corresponding achievements. Each should be quantifiable and impactful.

Template to fill (ONLY fill the [...] parts, keep everything else exactly as is):
{
  "verb1": "[first action verb]",
  "achievement1": "[first achievement with metrics]",
  "verb2": "[second action verb]",
  "achievement2": "[second achievement with metrics]",
  "verb3": "[optional third action verb]",
  "achievement3": "[optional third achievement with metrics]"
}

Example response:
{
  "verb1": "Developed",
  "achievement1": "scalable backend services, improving system performance by 40%",
  "verb2": "Led",
  "achievement2": "cross-functional teams in implementing automated testing, reducing deployment time by 60%",
  "verb3": "",
  "achievement3": ""
}

Fill in ONLY the template above. Do not add any other text or context.`
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

      // Parse the template response and construct the description
      let cleanDescription;
      try {
        const template = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        
        // Construct the description from the template parts
        const parts = [];
        if (template.verb1 && template.achievement1) {
          parts.push(`${template.verb1} ${template.achievement1}`);
        }
        if (template.verb2 && template.achievement2) {
          parts.push(`${template.verb2} ${template.achievement2}`);
        }
        if (template.verb3 && template.achievement3) {
          parts.push(`${template.verb3} ${template.achievement3}`);
        }
        
        cleanDescription = parts.join('. ');
        if (cleanDescription) {
          cleanDescription += '.';
        }
      } catch (e) {
        // If parsing fails, use a simple cleanup as fallback
        cleanDescription = data.result
          .replace(/^[^.!?]*(?:Software Engineer|Engineer|Developer|Position|Role|Current|As a|Working as)[^.!?]*[.!?]\s*/i, '')
          .trim();
      }

      const newExperiences = [...experiences];
      newExperiences[index] = { ...newExperiences[index], description: cleanDescription };
      setExperiences(newExperiences);
      updateExperiences(newExperiences);
      toast.success("Generated job description!");
    } catch (error: any) {
      console.error('Error generating description:', error);
      toast.error(error.message || 'Failed to generate description');
    } finally {
      setGeneratingDescription(null);
    }
  };

  const generateAchievements = async (index: number) => {
    try {
      const experience = experiences[index];
      
      // Validate required fields
      if (!experience.company.trim() || !experience.position.trim() || !experience.description.trim()) {
        toast.error("Please enter company name, position, and job description before generating achievements");
        return;
      }

      // Check and spend credits
      const creditCost = CREDIT_COSTS.RESUME.GENERATE_ACHIEVEMENTS;
      const canSpendCredits = await spendCredits(
        creditCost, 
        'RESUME.GENERATE_ACHIEVEMENTS', 
        `Generated achievements for ${experience.position} at ${experience.company}`
      );

      if (!canSpendCredits) {
        return; // The spendCredits function will show appropriate error messages
      }

      setGeneratingAchievements(index);
      
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
      setGeneratingAchievements(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {experiences.map((experience, index) => (
        <Card key={index} className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Experience {index + 1}</CardTitle>
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
            <CardDescription>Add your work experience details</CardDescription>
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
                  disabled={generatingDescription !== null || !experience.company.trim() || !experience.position.trim()}
                >
                  {generatingDescription === index ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Description ({CREDIT_COSTS.RESUME.GENERATE_DESCRIPTION} Credits)
                    </>
                  )}
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
                  disabled={generatingAchievements !== null}
                >
                  {generatingAchievements === index ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Achievements ({CREDIT_COSTS.RESUME.GENERATE_ACHIEVEMENTS} Credits)
                    </>
                  )}
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