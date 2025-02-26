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
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockSkillsByCategory: { [key: string]: string[] } = {
      "Technical Skills": [
        "React.js",
        "TypeScript",
        "Node.js",
        "AWS",
        "Docker",
        "GraphQL",
        "MongoDB",
      ],
      "Soft Skills": [
        "Team Leadership",
        "Problem Solving",
        "Communication",
        "Project Management",
        "Agile Methodologies",
      ],
      "Tools & Technologies": [
        "Git",
        "VS Code",
        "Jira",
        "Jenkins",
        "Kubernetes",
        "Postman",
      ],
      "Languages": [
        "JavaScript",
        "Python",
        "Java",
        "C++",
        "SQL",
        "HTML/CSS",
      ],
    };

    const categoryName = categories[categoryIndex].name;
    let suggestedSkills = mockSkillsByCategory["Technical Skills"]; // default

    for (const [key, skills] of Object.entries(mockSkillsByCategory)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase().split(" ")[0])) {
        suggestedSkills = skills;
        break;
      }
    }

    const selectedSkills = suggestedSkills
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);

    const newCategories = [...categories];
    newCategories[categoryIndex].skills = selectedSkills;
    setCategories(newCategories);
    updateSkills(newCategories);
    setIsGenerating(false);
    toast.success("Generated skill suggestions!");
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