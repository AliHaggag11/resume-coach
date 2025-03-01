"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import CoverLetterForm from "../components/CoverLetterForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface DatabaseCoverLetter {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  job_title: string;
  job_description: string;
  relevant_experience: string;
  recipient_name: string;
  recipient_title: string;
  company_address: string;
  tone: 'professional' | 'enthusiastic' | 'confident' | 'humble';
  cover_letter: string | null;
  created_at: string;
  updated_at: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  relevantExperience: string;
  recipientName: string;
  recipientTitle: string;
  companyAddress: string;
  tone: 'professional' | 'enthusiastic' | 'confident' | 'humble';
}

export default function EditCoverLetterPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData | null>(null);

  useEffect(() => {
    const fetchCoverLetter = async () => {
      if (!user || !id) {
        router.push("/cover-letter");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("cover_letter_forms")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          toast.error("Cover letter not found");
          router.push("/cover-letter");
          return;
        }

        // Transform database data to form data format
        const formattedData: FormData = {
          fullName: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          companyName: data.company_name || '',
          jobTitle: data.job_title || '',
          jobDescription: data.job_description || '',
          relevantExperience: data.relevant_experience || '',
          recipientName: data.recipient_name || '',
          recipientTitle: data.recipient_title || '',
          companyAddress: data.company_address || '',
          tone: data.tone || 'professional'
        };

        setFormData(formattedData);
      } catch (err: any) {
        console.error("Error fetching cover letter:", err);
        toast.error(err.message || "Failed to load cover letter");
        router.push("/cover-letter");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoverLetter();
  }, [id, user, router]);

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-8">
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

  if (!formData) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-8">
      <CoverLetterForm initialValues={formData} formId={id as string} />
    </div>
  );
} 