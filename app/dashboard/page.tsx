"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  PlusCircle,
  FileText,
  Star,
  Download,
  Share2,
  Trash2,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Resume {
  id: string;
  title: string;
  content: Record<string, any>;
  status: 'draft' | 'completed';
  shared: boolean;
  created_at: string;
  last_modified: string;
  user_id: string;
}

interface ResumeError {
  message: string;
  code?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { tier, features } = useSubscription();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<ResumeError | null>(null);

  useEffect(() => {
    const fetchResumes = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', user.id)
          .order('last_modified', { ascending: false });

        if (error) {
          throw error;
        }

        // Type assertion since we know the shape of our data
        setResumes(data as Resume[]);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching resumes:', err);
        setError({
          message: err.message || 'Failed to load resumes',
          code: err.code
        });
        toast.error('Failed to load resumes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumes();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      setIsDeletingId(id);
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setResumes(prev => prev.filter(resume => resume.id !== id));
      toast.success('Resume deleted successfully');
    } catch (err: any) {
      console.error('Error deleting resume:', err);
      toast.error(err.message || 'Failed to delete resume');
    } finally {
      setIsDeletingId(null);
    }
  };

  const getResumeStats = () => {
    const completed = resumes.filter(r => r.status === 'completed').length;
    const drafts = resumes.filter(r => r.status === 'draft').length;
    const shared = resumes.filter(r => r.shared).length;
    return { completed, drafts, shared };
  };

  const stats = getResumeStats();

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-7xl py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your resumes and track your progress
          </p>
        </div>
        <Link href="/builder">
          <Button className="w-full md:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Resume
          </Button>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <h3 className="font-medium text-destructive">Error Loading Resumes</h3>
                <p className="text-sm text-muted-foreground">{error.message}</p>
              </div>
              <Button
                variant="outline"
                className="ml-auto"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Completed Resumes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completed}</div>
            <p className="text-muted-foreground text-sm mt-1">
              Ready to use resumes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Draft Resumes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.drafts}</div>
            <p className="text-muted-foreground text-sm mt-1">
              Work in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Shared Resumes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.shared}</div>
            <p className="text-muted-foreground text-sm mt-1">
              Publicly accessible
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>
            Your current plan allows up to {features.maxResumes} resumes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Resumes Created</span>
              <span>{resumes.length} / {features.maxResumes}</span>
            </div>
            <Progress 
              value={(resumes.length / features.maxResumes) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Resumes List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Resumes</h2>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="font-medium">No resumes yet</h3>
                <p className="text-muted-foreground text-sm">
                  Create your first resume to get started
                </p>
                <Link href="/builder">
                  <Button className="mt-2">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Resume
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{resume.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            Last modified {new Date(resume.last_modified).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/builder/${resume.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => handleDelete(resume.id)}
                        disabled={isDeletingId === resume.id}
                      >
                        {isDeletingId === resume.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 