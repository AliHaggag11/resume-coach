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
  ArrowRight,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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

interface CoverLetter {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  cover_letter?: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'completed';
}

interface ResumeError {
  message: string;
  code?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { tier, features } = useSubscription();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<ResumeError | null>(null);
  const [activeTab, setActiveTab] = useState<'resumes' | 'cover-letters'>('resumes');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Validate Supabase client
        if (!supabase) {
          throw new Error('Supabase client is not initialized');
        }

        // Fetch resumes with error handling
        let resumesResult;
        try {
          resumesResult = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', user.id)
            .order('last_modified', { ascending: false });

          if (resumesResult.error) {
            throw resumesResult.error;
          }
        } catch (resumeError: any) {
          console.error('Resume fetch error:', resumeError);
          throw new Error(resumeError?.message || 'Failed to fetch resumes');
        }

        // Set resumes state
        setResumes(resumesResult?.data || []);

        // Fetch cover letters with error handling
        let coverLettersResult;
        try {
          coverLettersResult = await supabase
            .from('cover_letter_forms')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

          if (coverLettersResult.error) {
            throw coverLettersResult.error;
          }
        } catch (coverLetterError: any) {
          console.error('Cover letter fetch error:', coverLetterError);
          throw new Error(coverLetterError?.message || 'Failed to fetch cover letters');
        }

        // Set cover letters state
        setCoverLetters(coverLettersResult?.data || []);

        // Clear any existing errors
        setError(null);

      } catch (err: any) {
        console.error('Dashboard data fetch error:', err);
        setError({
          message: err?.message || 'Failed to load dashboard data. Please check your connection and try again.',
          code: err?.code || 'FETCH_ERROR'
        });
        toast.error('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDeleteResume = async (id: string) => {
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

  const handleDeleteCoverLetter = async (id: string) => {
    if (!user) return;

    try {
      setIsDeletingId(id);
      const { error } = await supabase
        .from('cover_letter_forms')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setCoverLetters(prev => prev.filter(letter => letter.id !== id));
      toast.success('Cover letter deleted successfully');
    } catch (err: any) {
      console.error('Error deleting cover letter:', err);
      toast.error(err.message || 'Failed to delete cover letter');
    } finally {
      setIsDeletingId(null);
    }
  };

  const getStats = () => {
    const resumeStats = {
      completed: resumes.filter(r => r.status === 'completed').length,
      drafts: resumes.filter(r => r.status === 'draft').length,
      shared: resumes.filter(r => r.shared).length
    };

    const coverLetterStats = {
      total: coverLetters.length,
      withLetter: coverLetters.filter(cl => cl.cover_letter).length,
      recent: coverLetters.filter(cl => {
        const date = new Date(cl.updated_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return date > thirtyDaysAgo;
      }).length
    };

    return { resumeStats, coverLetterStats };
  };

  const stats = getStats();

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
            Manage your resumes and cover letters
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/builder">
            <Button className="w-full md:w-auto">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Resume
            </Button>
          </Link>
          <Link href="/cover-letter">
            <Button variant="outline" className="w-full md:w-auto">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Cover Letter
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <h3 className="font-medium text-destructive">Error Loading Data</h3>
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

      {/* Content */}
      {!error && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resume Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Resume Statistics</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold">{stats.resumeStats.completed}</div>
                  <p className="text-muted-foreground text-sm">Completed</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.resumeStats.drafts}</div>
                  <p className="text-muted-foreground text-sm">Drafts</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.resumeStats.shared}</div>
                  <p className="text-muted-foreground text-sm">Shared</p>
                </div>
              </CardContent>
            </Card>

            {/* Cover Letter Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Cover Letter Statistics</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold">{stats.coverLetterStats.total}</div>
                  <p className="text-muted-foreground text-sm">Total</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.coverLetterStats.withLetter}</div>
                  <p className="text-muted-foreground text-sm">Generated</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.coverLetterStats.recent}</div>
                  <p className="text-muted-foreground text-sm">Last 30 Days</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Usage</CardTitle>
              <CardDescription>
                Your current plan allows up to {features.maxResumes} resumes and {features.maxCoverLetters || "unlimited"} cover letters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              {features.maxCoverLetters && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cover Letters Created</span>
                    <span>{coverLetters.length} / {features.maxCoverLetters}</span>
                  </div>
                  <Progress 
                    value={(coverLetters.length / features.maxCoverLetters) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <div className="space-y-4">
            <Tabs defaultValue="resumes" onValueChange={(value) => setActiveTab(value as 'resumes' | 'cover-letters')}>
              <TabsList>
                <TabsTrigger value="resumes">Resumes</TabsTrigger>
                <TabsTrigger value="cover-letters">Cover Letters</TabsTrigger>
              </TabsList>
            </Tabs>

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
            ) : activeTab === 'resumes' ? (
              resumes.length === 0 ? (
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
                              onClick={() => handleDeleteResume(resume.id)}
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
              )
            ) : (
              coverLetters.length === 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-2">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                      <h3 className="font-medium">No cover letters yet</h3>
                      <p className="text-muted-foreground text-sm">
                        Create your first cover letter to get started
                      </p>
                      <Link href="/cover-letter">
                        <Button className="mt-2">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create Cover Letter
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coverLetters.map((letter, index) => (
                    <Card key={letter.id} className="group hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {letter.job_title ? letter.job_title : `Untitled ${index + 1}`}
                            </CardTitle>
                            <CardDescription>{letter.company_name || 'No company specified'}</CardDescription>
                          </div>
                          <Badge variant={letter.status === 'completed' ? 'default' : 'secondary'}>
                            {letter.status === 'completed' ? 'Completed' : 'Draft'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {new Date(letter.updated_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              asChild
                              className="hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              <Link href={`/cover-letter/${letter.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCoverLetter(letter.id)}
                              disabled={isDeletingId === letter.id}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              {isDeletingId === letter.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
} 