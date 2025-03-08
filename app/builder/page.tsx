"use client";

import { useState, useEffect } from "react";
import { ResumeProvider } from "@/app/context/ResumeContext";
import { ResumeStyleProvider } from "@/app/context/ResumeStyleContext";
import { BuilderPageContent } from "./components/BuilderPageContent";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function BuilderPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [recentResumes, setRecentResumes] = useState<any[]>([]);
  const [isCreatingResume, setIsCreatingResume] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchRecentResumes();
    }
  }, [user]);

  const fetchRecentResumes = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("last_modified", { ascending: false })
        .limit(4);

      if (error) throw error;
      setRecentResumes(data || []);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      toast.error("Failed to load your recent resumes");
    } finally {
      setIsLoading(false);
    }
  };

  const createNewResume = async () => {
    if (!user) {
      toast.error("Please sign in to create a resume");
      return;
    }

    setIsCreatingResume(true);
    try {
      const defaultContent = {
        personalInfo: {
          fullName: "",
          title: "",
          email: "",
          phone: "",
          location: "",
          summary: "",
          linkedin: "",
          github: "",
          website: ""
        },
        experiences: [],
        education: [],
        skills: [],
        projects: [],
        awards: []
      };

      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: "Untitled Resume",
          content: defaultContent,
          status: "draft",
          shared: false
        })
        .select();

      if (error) throw error;

      if (data && data[0]) {
        router.push(`/builder/${data[0].id}`);
      }
    } catch (error) {
      console.error("Error creating resume:", error);
      toast.error("Failed to create a new resume");
    } finally {
      setIsCreatingResume(false);
    }
  };

  const continueEditing = (id: string) => {
    router.push(`/builder/${id}`);
  };

  if (user && recentResumes.length > 0) {
    return (
      <div className="container max-w-7xl px-4 py-4 sm:p-6 mx-auto space-y-4 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Resume Builder</h1>
          <Button 
            onClick={createNewResume} 
            disabled={isCreatingResume}
            size="lg"
            className="gap-2 w-full sm:w-auto"
          >
            {isCreatingResume ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                Create New Resume
              </>
            )}
          </Button>
        </div>
        
        <section>
          <h2 className="text-xl font-semibold mb-3 sm:mb-4">Recent Resumes</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="h-[180px] sm:h-[200px] animate-pulse bg-muted"></Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {recentResumes.map((resume) => (
                <Card key={resume.id} className="overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
                    <CardTitle className="text-base sm:text-lg truncate">{resume.title}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Last edited: {new Date(resume.last_modified).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    <div className="h-20 sm:h-24 flex items-center justify-center bg-muted/50 rounded-md">
                      <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/70" />
                    </div>
                  </CardContent>
                  <CardFooter className="p-3 sm:p-4 pt-0">
                    <Button 
                      variant="default" 
                      className="w-full text-sm sm:text-base" 
                      onClick={() => continueEditing(resume.id)}
                    >
                      Continue Editing
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <ResumeProvider>
      <ResumeStyleProvider>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-6">
          <Card className="w-full max-w-3xl">
            <CardHeader className="sm:pb-2">
              <CardTitle className="text-xl sm:text-2xl">Create Your First Resume</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Get started by creating a professional resume in minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base">Our resume builder makes it easy to create a professional resume that highlights your skills and experience.</p>
              <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base">
                <li>Choose from multiple professional templates</li>
                <li>Easily customize fonts, colors, and layouts</li>
                <li>Export to PDF for sharing and printing</li>
                <li>Get AI-powered feedback and suggestions</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={createNewResume} 
                disabled={isCreatingResume} 
                className="w-full gap-2"
                size="lg"
              >
                {isCreatingResume ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Resume...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    Create New Resume
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </ResumeStyleProvider>
    </ResumeProvider>
  );
} 