"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth/signin');
          return;
        }

        const { data, error } = await supabase
          .from('cover_letter_forms')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          toast.error('Cover letter not found');
          router.push('/dashboard');
          return;
        }

        setFormData({
          fullName: data.full_name,
          email: data.email,
          phone: data.phone,
          companyName: data.company_name,
          jobTitle: data.job_title,
          jobDescription: data.job_description,
          relevantExperience: data.relevant_experience,
          recipientName: data.recipient_name,
          recipientTitle: data.recipient_title,
          companyAddress: data.company_address,
          tone: data.tone,
        });
      } catch (error) {
        console.error('Error fetching cover letter:', error);
        toast.error('Failed to load cover letter');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoverLetter();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-4 md:py-8 space-y-4 md:space-y-8">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent className="p-4 md:p-6">
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
    <div className="container max-w-4xl py-4 md:py-8">
      <CoverLetterForm initialValues={formData} formId={id as string} />
    </div>
  );
} 