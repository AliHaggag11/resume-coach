"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useResume } from "@/app/context/ResumeContext";

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

export default function EducationForm() {
  const { resumeData, updateEducation } = useResume();
  const [educations, setEducations] = useState<Education[]>(
    resumeData.education.length > 0
      ? resumeData.education
      : [
          {
            school: "",
            degree: "",
            field: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            gpa: "",
            achievements: [""],
          },
        ]
  );

  const degrees = [
    "High School Diploma",
    "Associate's Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "Ph.D.",
    "Other",
  ];

  const addEducation = () => {
    setEducations([
      ...educations,
      {
        school: "",
        degree: "",
        field: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        gpa: "",
        achievements: [""],
      },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
    updateEducation(educations.filter((_, i) => i !== index));
  };

  const updateEducationField = (index: number, field: keyof Education, value: any) => {
    const newEducations = [...educations];
    newEducations[index] = { ...newEducations[index], [field]: value };
    setEducations(newEducations);
    updateEducation(newEducations);
  };

  const addAchievement = (educationIndex: number) => {
    const newEducations = [...educations];
    newEducations[educationIndex].achievements.push("");
    setEducations(newEducations);
    updateEducation(newEducations);
  };

  const updateAchievement = (educationIndex: number, achievementIndex: number, value: string) => {
    const newEducations = [...educations];
    newEducations[educationIndex].achievements[achievementIndex] = value;
    setEducations(newEducations);
    updateEducation(newEducations);
  };

  const removeAchievement = (educationIndex: number, achievementIndex: number) => {
    const newEducations = [...educations];
    newEducations[educationIndex].achievements = newEducations[educationIndex].achievements.filter(
      (_, i) => i !== achievementIndex
    );
    setEducations(newEducations);
    updateEducation(newEducations);
  };

  return (
    <div className="space-y-6 p-6">
      {educations.map((education, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-xl">Education {index + 1}</CardTitle>
            <CardDescription>Add your educational background</CardDescription>
            {index > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                onClick={() => removeEducation(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="School/University"
              value={education.school}
              onChange={(e) => updateEducationField(index, "school", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={education.degree}
                onValueChange={(value: string) => updateEducationField(index, "degree", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Degree" />
                </SelectTrigger>
                <SelectContent>
                  {degrees.map((degree) => (
                    <SelectItem key={degree} value={degree}>
                      {degree}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Field of Study"
                value={education.field}
                onChange={(e) => updateEducationField(index, "field", e.target.value)}
              />
            </div>
            <Input
              placeholder="Location"
              value={education.location}
              onChange={(e) => updateEducationField(index, "location", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                placeholder="Start Date"
                value={education.startDate}
                onChange={(e) => updateEducationField(index, "startDate", e.target.value)}
              />
              <Input
                type="date"
                placeholder="End Date"
                value={education.endDate}
                onChange={(e) => updateEducationField(index, "endDate", e.target.value)}
                disabled={education.current}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={education.current}
                onChange={(e) => updateEducationField(index, "current", e.target.checked)}
                className="rounded border-gray-300"
              />
              <label>I am currently studying here</label>
            </div>
            <Input
              placeholder="GPA (optional)"
              value={education.gpa}
              onChange={(e) => updateEducationField(index, "gpa", e.target.value)}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Achievements & Activities</label>
              {education.achievements.map((achievement, achievementIndex) => (
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
      <Button onClick={addEducation} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Another Education
      </Button>
    </div>
  );
} 