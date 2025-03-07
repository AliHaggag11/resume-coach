"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, RefreshCw, Loader2, Info } from "lucide-react";
import { useResume } from "@/app/context/ResumeContext";
import { toast } from "sonner";
import { useSubscription } from "@/app/context/SubscriptionContext";
import { CREDIT_COSTS } from "@/app/context/SubscriptionContext";

export default function PersonalInfoForm() {
  const { resumeData, updatePersonalInfo } = useResume();
  const { spendCredits } = useSubscription();
  const { personalInfo } = resumeData;
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    updatePersonalInfo({ [name]: value });
  };

  const generateSummary = async () => {
    try {
      if (!personalInfo.title) {
        toast.error("Please enter a professional title first");
        return;
      }

      // Check and spend credits
      const creditCost = CREDIT_COSTS.RESUME.GENERATE_SUMMARY;
      const canSpendCredits = await spendCredits(
        creditCost, 
        'RESUME.GENERATE_SUMMARY', 
        `Generated professional summary for ${personalInfo.title}`
      );

      if (!canSpendCredits) {
        return; // The spendCredits function will show appropriate error messages
      }

      setIsGenerating(true);
      
      const prompt = {
        content: {
          title: personalInfo.title,
          context: "Generate a compelling professional summary for a resume. The summary should be 2-3 sentences long, highlighting expertise, skills, and career focus relevant to this role. Make it impactful and modern, focusing on value proposition."
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
        throw new Error(data.details || data.error || 'Failed to generate summary');
      }

      if (!data.result) {
        throw new Error('No summary generated');
      }

      updatePersonalInfo({ summary: data.result });
      toast.success("Generated professional summary!");
    } catch (error: any) {
      console.error('Error generating summary:', error);
      toast.error(error.message || 'Failed to generate summary');
    } finally {
      setIsGenerating(false);
    }
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

      <div className="space-y-2">
        <Label htmlFor="summary">Professional Summary</Label>
        <div className="space-y-2">
          <Textarea
            id="summary"
            name="summary"
            value={personalInfo.summary}
            onChange={handleChange}
            placeholder="Write a brief summary of your professional background and key qualifications..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={generateSummary}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate Summary ({CREDIT_COSTS.RESUME.GENERATE_SUMMARY} Credits)
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 