"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { ResumeProvider } from "@/app/context/ResumeContext";
import { ResumeStyleProvider } from "@/app/context/ResumeStyleContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { BuilderPageContent } from "../components/BuilderPageContent";

interface DatabaseResume {
  id: string;
  user_id: string;
  title: string;
  content: any;
  status: 'draft' | 'completed';
  shared: boolean;
  created_at: string;
  last_modified: string;
}

function EditResumeContent() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [resumeData, setResumeData] = useState<DatabaseResume | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      if (!user) {
        router.push("/builder");
        return;
      }

      // Handle 'new' as a special case for creating a new resume
      if (id === 'new') {
        setResumeData({
          id: 'new',
          user_id: user.id,
          title: 'Untitled Resume',
          content: {
            personalInfo: {
              fullName: '',
              title: '',
              email: '',
              phone: '',
              location: '',
              summary: '',
              linkedin: '',
              github: '',
              website: ''
            },
            experiences: [],
            education: [],
            skills: [],
            projects: [],
            awards: []
          },
          status: 'draft',
          shared: false,
          created_at: new Date().toISOString(),
          last_modified: new Date().toISOString()
        });
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("resumes")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          toast.error("Resume not found");
          router.push("/builder");
          return;
        }

        setResumeData(data);
      } catch (err: any) {
        console.error("Error fetching resume:", err);
        setError(err.message || "Failed to load resume");
        toast.error(err.message || "Failed to load resume");
        router.push("/builder");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResume();
  }, [id, user, router]);

  if (isLoading) {
    return (
      <div className="container max-w-7xl py-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !resumeData) {
    return null;
  }

  return <BuilderPageContent initialData={resumeData} />;
}

export default function EditResumePage() {
  return (
    <ResumeProvider>
      <ResumeStyleProvider>
        <EditResumeContent />
      </ResumeStyleProvider>
    </ResumeProvider>
  );
} 