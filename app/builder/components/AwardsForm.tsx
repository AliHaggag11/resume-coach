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
  const [isGenerating, setIsGenerating] = useState(false);

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
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockDescriptions = [
      "Awarded for exceptional leadership in developing innovative solutions that significantly improved team productivity and project delivery timelines.",
      "Recognized for outstanding contributions to open-source projects and community development initiatives.",
      "Certified in advanced cloud architecture, demonstrating expertise in designing and implementing scalable cloud solutions.",
      "Received for excellence in technical problem-solving and implementing best practices in software development.",
    ];
    
    const randomDescription = mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)];
    const newAwards = [...awards];
    newAwards[index] = { ...newAwards[index], description: randomDescription };
    setAwards(newAwards);
    updateAwards(newAwards);
    setIsGenerating(false);
    toast.success("Generated award description!");
  };

  const suggestAward = async (index: number) => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockAwards = [
      {
        title: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        description: "Professional certification demonstrating expertise in designing distributed systems on AWS.",
      },
      {
        title: "Google Cloud Professional Developer",
        issuer: "Google Cloud",
        description: "Advanced certification for building scalable and reliable applications on Google Cloud Platform.",
      },
      {
        title: "Microsoft Certified: Azure Developer Associate",
        issuer: "Microsoft",
        description: "Certification validating expertise in cloud development using Microsoft Azure services.",
      },
      {
        title: "Certified Kubernetes Administrator",
        issuer: "Cloud Native Computing Foundation",
        description: "Professional certification in managing and orchestrating containerized applications using Kubernetes.",
      },
    ];
    
    const randomAward = mockAwards[Math.floor(Math.random() * mockAwards.length)];
    const newAwards = [...awards];
    newAwards[index] = { 
      ...newAwards[index], 
      title: randomAward.title,
      issuer: randomAward.issuer,
      description: randomAward.description,
    };
    setAwards(newAwards);
    updateAwards(newAwards);
    setIsGenerating(false);
    toast.success("Generated award suggestion!");
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
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => suggestAward(index)}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                Suggest Award
              </Button>
            </div>
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