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

interface Award {
  title: string;
  issuer: string;
  date: string;
  description: string;
  link: string;
}

export default function AwardsForm() {
  const { resumeData, updateAwards } = useResume();
  const [awards, setAwards] = useState<Award[]>(
    resumeData.awards.length > 0
      ? resumeData.awards
      : [
          {
            title: "",
            issuer: "",
            date: "",
            description: "",
            link: "",
          },
        ]
  );
  const [generatingDescription, setGeneratingDescription] = useState<number | null>(null);

  const addAward = () => {
    setAwards([
      ...awards,
      {
        title: "",
        issuer: "",
        date: "",
        description: "",
        link: "",
      },
    ]);
  };

  const removeAward = (index: number) => {
    setAwards(awards.filter((_, i) => i !== index));
    updateAwards(awards.filter((_, i) => i !== index));
  };

  const updateAward = (index: number, field: keyof Award, value: string) => {
    const newAwards = [...awards];
    newAwards[index] = { ...newAwards[index], [field]: value };
    setAwards(newAwards);
    updateAwards(newAwards);
  };

  const generateDescription = async (index: number) => {
    try {
      const award = awards[index];
      
      // Validate required fields
      if (!award.title.trim()) {
        toast.error("Please enter an award title before generating description");
        return;
      }

      setGeneratingDescription(index);
      
      const prompt = {
        content: {
          awardTitle: award.title,
          issuer: award.issuer,
          context: `Generate a detailed and professional description for the award/certification "${award.title}"${award.issuer ? ` from ${award.issuer}` : ''}. The description should:
1. Highlight the significance and prestige of the award/certification
2. Mention specific skills or knowledge areas validated
3. Describe the impact or value in professional context
4. Keep it to 1-2 impactful sentences

Example format:
"Demonstrated advanced expertise in cloud architecture and security best practices, validating ability to design and implement scalable, secure solutions across multiple cloud platforms. Recognized for exceptional problem-solving skills and deep technical knowledge in modern cloud technologies."

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

      const newAwards = [...awards];
      newAwards[index] = { ...newAwards[index], description: data.result.trim() };
      setAwards(newAwards);
      updateAwards(newAwards);
      toast.success("Generated award description!");
    } catch (error: any) {
      console.error('Error generating description:', error);
      toast.error(error.message || 'Failed to generate description');
    } finally {
      setGeneratingDescription(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {awards.map((award, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-xl">Award/Certification {index + 1}</CardTitle>
            <CardDescription>Add details about your award or certification</CardDescription>
            {index > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                onClick={() => removeAward(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Award/Certification Title"
              value={award.title}
              onChange={(e) => updateAward(index, "title", e.target.value)}
            />
            <Input
              placeholder="Issuing Organization"
              value={award.issuer}
              onChange={(e) => updateAward(index, "issuer", e.target.value)}
            />
            <Input
              type="date"
              placeholder="Date Received"
              value={award.date}
              onChange={(e) => updateAward(index, "date", e.target.value)}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Description</label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => generateDescription(index)}
                  disabled={generatingDescription !== null || !award.title.trim()}
                >
                  {generatingDescription === index ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  Generate Description
                </Button>
              </div>
              <Textarea
                placeholder="Description or Additional Details"
                value={award.description}
                onChange={(e) => updateAward(index, "description", e.target.value)}
                className="h-24"
              />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Verification URL"
                value={award.link}
                onChange={(e) => updateAward(index, "link", e.target.value)}
              />
              {award.link && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(award.link, "_blank")}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      <Button onClick={addAward} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Another Award/Certification
      </Button>
    </div>
  );
} 