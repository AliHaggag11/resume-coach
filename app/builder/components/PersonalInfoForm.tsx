"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, RefreshCw } from "lucide-react";
import { useResume } from "@/app/context/ResumeContext";
import { toast } from "sonner";

export default function PersonalInfoForm() {
  const { resumeData, updatePersonalInfo } = useResume();
  const { personalInfo } = resumeData;
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    updatePersonalInfo({ [name]: value });
  };

  const generateSummary = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockSummaries = [
      "Results-driven software engineer with 5+ years of experience in developing scalable web applications. Proficient in modern JavaScript frameworks and cloud technologies. Strong focus on code quality and performance optimization.",
      "Innovative full-stack developer with a passion for creating user-centric solutions. Experienced in agile methodologies and cross-functional team collaboration. Proven track record of delivering high-impact projects on time.",
      "Detail-oriented frontend specialist with expertise in React and TypeScript. Committed to creating accessible and performant web applications. Strong background in UI/UX design principles.",
    ];
    
    const randomSummary = mockSummaries[Math.floor(Math.random() * mockSummaries.length)];
    updatePersonalInfo({ summary: randomSummary });
    setIsGenerating(false);
    toast.success("Generated professional summary!");
  };

  const suggestJobTitle = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockTitles = [
      "Senior Software Engineer",
      "Full Stack Developer",
      "Frontend Engineer",
      "Software Development Engineer",
      "Web Application Developer",
    ];
    
    const randomTitle = mockTitles[Math.floor(Math.random() * mockTitles.length)];
    updatePersonalInfo({ title: randomTitle });
    setIsGenerating(false);
    toast.success("Generated job title suggestion!");
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={personalInfo.fullName}
          onChange={handleChange}
          placeholder="John Doe"
        />
      </div>

      <div>
        <Label htmlFor="title">Professional Title</Label>
        <Input
          id="title"
          name="title"
          value={personalInfo.title}
          onChange={handleChange}
          placeholder="Software Engineer"
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={personalInfo.email}
          onChange={handleChange}
          placeholder="john@example.com"
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={personalInfo.phone}
          onChange={handleChange}
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          value={personalInfo.location}
          onChange={handleChange}
          placeholder="City, Country"
        />
      </div>

      <div>
        <Label htmlFor="linkedin">LinkedIn URL</Label>
        <Input
          id="linkedin"
          name="linkedin"
          value={personalInfo.linkedin}
          onChange={handleChange}
          placeholder="https://linkedin.com/in/johndoe"
        />
      </div>

      <div>
        <Label htmlFor="github">GitHub URL</Label>
        <Input
          id="github"
          name="github"
          value={personalInfo.github}
          onChange={handleChange}
          placeholder="https://github.com/johndoe"
        />
      </div>

      <div>
        <Label htmlFor="website">Portfolio Website</Label>
        <Input
          id="website"
          name="website"
          value={personalInfo.website}
          onChange={handleChange}
          placeholder="https://johndoe.com"
        />
      </div>

      <div>
        <Label htmlFor="summary">Professional Summary</Label>
        <Textarea
          id="summary"
          name="summary"
          value={personalInfo.summary}
          onChange={handleChange}
          placeholder="Write a brief summary of your professional background and key qualifications..."
          className="h-32"
        />
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={() => updatePersonalInfo({
          fullName: "",
          title: "",
          email: "",
          phone: "",
          location: "",
          summary: "",
        })}>Reset</Button>
        <Button onClick={generateSummary}>Generate Summary</Button>
        <Button onClick={suggestJobTitle}>Get Job Title Suggestion</Button>
      </div>
    </div>
  );
} 