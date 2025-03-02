"use client";

import { useState, useRef, useEffect } from "react";
import type { ReactElement } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Share2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wand2,
  FileText,
  Linkedin,
  Mail,
  Copy,
  Github,
  Palette,
  File,
  Layout,
  User,
  Briefcase,
  GraduationCap,
  Star,
  FolderGit2,
  Trophy,
  Eye,
  EyeOff,
  X,
  Sparkles,
  LineChart,
  AlertCircle,
  CheckCircle2,
  Menu,
  Save,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useResume } from "@/app/context/ResumeContext";
import { useResumeStyle } from "@/app/context/ResumeStyleContext";
import PersonalInfoForm from "./PersonalInfoForm";
import ExperienceForm from "./ExperienceForm";
import EducationForm from "./EducationForm";
import SkillsForm from "./SkillsForm";
import ProjectsForm from "./ProjectsForm";
import AwardsForm from "./AwardsForm";
import ResumePreview from "./ResumePreview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ResumeStyleDialog from "./ResumeStyleDialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export interface DatabaseResume {
  id: string;
  user_id: string;
  title: string;
  content: any;
  status: string;
  shared: boolean;
  created_at: string;
  last_modified: string;
}

interface BuilderPageContentProps {
  initialData?: DatabaseResume;
}

export function BuilderPageContent({ initialData }: BuilderPageContentProps): ReactElement {
  const { loadResume, saveResume } = useResume();
  const { style, updateStyle } = useResumeStyle();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>("personal-info");
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showStyleDialog, setShowStyleDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData?.id) {
      loadResume(initialData.id);
    }
  }, [initialData?.id]);

  const handleDownload = async () => {
    if (!previewRef.current) return;

    try {
      setIsGeneratingPDF(true);
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("resume.pdf");
      toast.success("Resume downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const sections = [
    {
      id: "personal-info",
      label: "Personal Info",
      icon: User,
      component: <PersonalInfoForm />,
    },
    {
      id: "experience",
      label: "Experience",
      icon: Briefcase,
      component: <ExperienceForm />,
    },
    {
      id: "education",
      label: "Education",
      icon: GraduationCap,
      component: <EducationForm />,
    },
    {
      id: "skills",
      label: "Skills",
      icon: Star,
      component: <SkillsForm />,
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderGit2,
      component: <ProjectsForm />,
    },
    {
      id: "awards",
      label: "Awards",
      icon: Trophy,
      component: <AwardsForm />,
    },
  ];

  const currentSectionIndex = sections.findIndex((s) => s.id === activeSection);
  const currentSection = sections[currentSectionIndex];
  const hasNext = currentSectionIndex < sections.length - 1;
  const hasPrev = currentSectionIndex > 0;

  const goToNextSection = () => {
    if (hasNext) {
      setActiveSection(sections[currentSectionIndex + 1].id);
    }
  };

  const goToPrevSection = () => {
    if (hasPrev) {
      setActiveSection(sections[currentSectionIndex - 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="relative">
        <div className="sticky top-[3.5rem] z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center">
            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "md:hidden",
                    showPreview && "hidden" // Hide sections button when preview is shown
                  )}
                >
                  <Menu className="h-4 w-4 mr-2" />
                  Sections
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] max-w-sm pr-0">
                <SheetHeader className="px-4 pb-4 border-b">
                  <SheetTitle>Resume Sections</SheetTitle>
                </SheetHeader>
                <nav className="grid gap-1 p-4">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => {
                          setActiveSection(section.id);
                          // Close sheet
                          const closeButton = document.querySelector(
                            '[data-dismiss="sheet"]'
                          );
                          if (closeButton instanceof HTMLElement)
                            closeButton.click();
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {section.label}
                      </button>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4 flex-1">
              {/* Section Tabs */}
              <Tabs
                value={activeSection}
                className="w-full"
                onValueChange={(value) => setActiveSection(value)}
              >
                <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <TabsTrigger
                        key={section.id}
                        value={section.id}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow flex-1"
                      >
                        <div className="flex items-center gap-2 justify-center">
                          <Icon className="h-4 w-4" />
                          <span>{section.label}</span>
                        </div>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center justify-end space-x-2">
              <div className="w-full flex-1 md:w-auto md:flex-none">
                {lastSaved && (
                  <p className="text-sm text-muted-foreground">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isGeneratingPDF ? "Generating..." : "Download"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStyleDialog(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Style
              </Button>
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Resume</DialogTitle>
                    <DialogDescription>
                      This will save your resume as completed and return you to the dashboard.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        onClick={async () => {
                          await saveResume('completed');
                          router.push('/dashboard');
                        }}
                      >
                        Save and Exit
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center ml-auto gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowPreview(!showPreview)}
                className={cn(
                  "transition-colors",
                  showPreview && "bg-primary text-primary-foreground"
                )}
              >
                {showPreview ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[40vh]">
                  <SheetHeader className="text-left">
                    <SheetTitle>Actions</SheetTitle>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      disabled={isGeneratingPDF}
                      className="justify-start"
                    >
                      {isGeneratingPDF ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      {isGeneratingPDF ? "Generating..." : "Download Resume"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowStyleDialog(true)}
                      className="justify-start"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Change Style
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowSaveDialog(true)}
                      className="justify-start"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save and Exit
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="container py-4 md:py-8 relative z-10">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className={cn(
              "relative",
              showPreview && "hidden md:block" // Hide form when preview is shown on mobile
            )}>
              {currentSection.component}
            </div>

            <div
              className={cn(
                "lg:block",
                showPreview ? "block" : "hidden lg:block"
              )}
            >
              <div className="sticky top-[7rem]">
                <div ref={previewRef}>
                  <ResumePreview template="modern" scale={0.7} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ResumeStyleDialog
        open={showStyleDialog}
        onOpenChange={setShowStyleDialog}
      />
    </div>
  );
} 