"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface SkillCategory {
  name: string;
  skills: string[];
}

export default function SkillsForm() {
  const { resumeData, updateSkills } = useResume();
  const [categories, setCategories] = useState<SkillCategory[]>(
    resumeData.skills.length > 0
      ? resumeData.skills
      : [
          {
            name: "Technical Skills",
            skills: [""],
          },
        ]
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const addCategory = () => {
    setCategories([
      ...categories,
      {
        name: "",
        skills: [""],
      },
    ]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
    updateSkills(categories.filter((_, i) => i !== index));
  };

  const updateCategoryName = (index: number, name: string) => {
    const newCategories = [...categories];
    newCategories[index].name = name;
    setCategories(newCategories);
    updateSkills(newCategories);
  };

  const addSkill = (categoryIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].skills.push("");
    setCategories(newCategories);
    updateSkills(newCategories);
  };

  const updateSkill = (categoryIndex: number, skillIndex: number, value: string) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].skills[skillIndex] = value;
    setCategories(newCategories);
    updateSkills(newCategories);
  };

  const removeSkill = (categoryIndex: number, skillIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].skills = newCategories[categoryIndex].skills.filter(
      (_, i) => i !== skillIndex
    );
    setCategories(newCategories);
    updateSkills(newCategories);
  };

  const suggestSkills = async (categoryIndex: number) => {
    try {
      const category = categories[categoryIndex];
      
      if (!category.name.trim()) {
        toast.error("Please enter a category name first");
        return;
      }

      // Check if required personal info exists
      if (!resumeData.personalInfo.title?.trim()) {
        toast.error("Please fill in your professional title in the Personal Info section first");
        return;
      }

      if (!resumeData.personalInfo.summary?.trim()) {
        toast.error("Please add a professional summary in the Personal Info section first");
        return;
      }

      setIsGenerating(true);
      
      const prompt = {
        content: {
          category: category.name,
          title: resumeData.personalInfo.title,
          summary: resumeData.personalInfo.summary,
          context: `Based on the professional title "${resumeData.personalInfo.title}" and the category "${category.name}", suggest 5-7 relevant skills. The skills should be specific and aligned with current industry standards.

Format the response as a JSON array of strings:
["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"]

Example for a "Technical Skills" category for a "Full Stack Developer":
["React.js", "Node.js", "TypeScript", "AWS", "Docker"]

Make sure the skills are:
1. Relevant to both the job title and category
2. Modern and currently in-demand
3. Specific rather than generic
4. Properly capitalized and formatted`
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
        throw new Error(data.details || data.error || 'Failed to generate skills');
      }

      if (!data.result) {
        throw new Error('No skills generated');
      }

      // Parse the result as JSON array
      let suggestedSkills;
      try {
        suggestedSkills = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        if (!Array.isArray(suggestedSkills)) {
          throw new Error('Invalid skills format');
        }
      } catch (e) {
        // Fallback: try to extract skills from text
        suggestedSkills = data.result
          .split(/[,\n]/)
          .map((skill: string) => skill.trim())
          .filter((skill: string) => skill.length > 0);
      }

      const newCategories = [...categories];
      newCategories[categoryIndex].skills = suggestedSkills;
      setCategories(newCategories);
      updateSkills(newCategories);
      toast.success("Generated skill suggestions!");
    } catch (error: any) {
      console.error('Error generating skills:', error);
      toast.error(error.message || 'Failed to generate skills');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {categories.map((category, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-xl">Skill Category {index + 1}</CardTitle>
            <CardDescription>Group your skills by category</CardDescription>
            {index > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                onClick={() => removeCategory(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Category Name (e.g., Technical Skills, Soft Skills)"
              value={category.name}
              onChange={(e) => updateCategoryName(index, e.target.value)}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Skills</label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => suggestSkills(index)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  Suggest Skills
                </Button>
              </div>
              {category.skills.map((skill, skillIndex) => (
                <div key={skillIndex} className="flex gap-2">
                  <Input
                    placeholder="Skill"
                    value={skill}
                    onChange={(e) => updateSkill(index, skillIndex, e.target.value)}
                  />
                  {skillIndex > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSkill(index, skillIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSkill(index)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button onClick={addCategory} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Another Category
      </Button>
    </div>
  );
} 