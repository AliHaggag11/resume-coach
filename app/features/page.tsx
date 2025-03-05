"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Layout,
  Target,
  FileText,
  PenTool,
  Bot,
  Download,
  Palette,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Trophy,
  User,
  Search,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Resume Assistant",
    description: "Let AI help you craft compelling professional summaries, work descriptions, and achievements that highlight your true potential.",
    benefits: [
      "Tailored professional summary",
      "Impact-focused achievements",
      "Job-specific descriptions",
      "Skill and keyword suggestions"
    ],
    gradient: "from-blue-500/10 via-indigo-500/10 to-purple-500/10",
    image: "/features/ai-assistant.webp",
    alt: "AI writing assistant interface"
  },
  {
    icon: Target,
    title: "ATS Optimization",
    description: "Get instant feedback on your resume's ATS compatibility, keyword matching, format analysis, and improvement suggestions.",
    benefits: [
      "Detailed ATS score analysis",
      "Keyword match detection",
      "Missing content identification",
      "Format & structure feedback"
    ],
    gradient: "from-emerald-500/10 via-teal-500/10 to-cyan-500/10",
    image: "/features/ats-analysis.webp",
    alt: "ATS analysis dashboard"
  },
  {
    icon: Briefcase,
    title: "AI Job Search Tools",
    description: "Find the perfect job and tailor your resume with our AI-powered job search and optimization tools.",
    benefits: [
      "Personalized job recommendations",
      "Resume keyword optimization",
      "Job description analysis",
      "Custom cover letter generation"
    ],
    gradient: "from-violet-500/10 via-purple-500/10 to-fuchsia-500/10",
    image: "/features/job-search.webp",
    alt: "AI job search interface"
  },
  {
    icon: Palette,
    title: "Professional Styling",
    description: "Customize your resume's appearance with our comprehensive style options featuring 7 professionally designed themes.",
    benefits: [
      "Modern, Classic, Minimal themes",
      "Professional, Creative layouts",
      "Technical & Executive designs",
      "Custom color schemes & fonts"
    ],
    gradient: "from-orange-500/10 via-amber-500/10 to-yellow-500/10",
    image: "/features/style-customization.webp",
    alt: "Resume style customization interface"
  },
  {
    icon: Download,
    title: "Multiple Export Options",
    description: "Export your resume in various formats with precise control over quality, page size, and personal information.",
    benefits: [
      "PDF with custom quality",
      "A4, Letter & Legal formats",
      "Portrait & Landscape options",
      "Control over contact details"
    ],
    gradient: "from-pink-500/10 via-rose-500/10 to-red-500/10",
    image: "/features/export-options.webp",
    alt: "Export format options"
  }
];

const sections = [
  {
    icon: User,
    title: "Personal Info",
    description: "Create a compelling professional profile with AI-generated summaries.",
    gradient: "from-blue-500/10 to-indigo-500/10"
  },
  {
    icon: Briefcase,
    title: "Work Experience",
    description: "Detail your professional journey with impact-focused achievements.",
    gradient: "from-emerald-500/10 to-teal-500/10"
  },
  {
    icon: GraduationCap,
    title: "Education",
    description: "Showcase your academic achievements and qualifications.",
    gradient: "from-orange-500/10 to-amber-500/10"
  },
  {
    icon: PenTool,
    title: "Skills",
    description: "Highlight your technical and professional competencies.",
    gradient: "from-pink-500/10 to-rose-500/10"
  },
  {
    icon: FolderGit2,
    title: "Projects",
    description: "Feature your notable projects and their impact.",
    gradient: "from-purple-500/10 to-violet-500/10"
  },
  {
    icon: Trophy,
    title: "Awards",
    description: "Display your certifications and professional recognition.",
    gradient: "from-cyan-500/10 to-blue-500/10"
  },
  {
    icon: Search,
    title: "Job Search",
    description: "Find and apply to jobs with AI-powered matching and optimization.",
    gradient: "from-violet-500/10 to-fuchsia-500/10"
  }
];

const stats = [
  { 
    label: "ATS Success Rate", 
    value: "95%",
    icon: Target,
    gradient: "from-blue-500 to-indigo-500"
  },
  { 
    label: "Export Options", 
    value: "3+",
    icon: Download,
    gradient: "from-emerald-500 to-teal-500"
  },
  { 
    label: "Theme Options", 
    value: "7+",
    icon: Layout,
    gradient: "from-orange-500 to-amber-500"
  },
  { 
    label: "Available Jobs", 
    value: "1000+",
    icon: Briefcase,
    gradient: "from-pink-500 to-rose-500"
  }
];

export default function FeaturesPage() {
  return (
    <>
      <div className="relative isolate">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 md:pt-32">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.15]" />
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
          </div>
          
          {/* Floating shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
          </div>
          
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4 max-w-[800px]"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4 border border-primary/20 shadow-glow">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium text-primary">Resume Builder Features</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Create Professional
                  <span className="block mt-1">ATS-Optimized Resumes & Find Jobs</span>
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl max-w-[600px] mx-auto mt-6">
                  Our intelligent platform combines AI assistance, professional styling, ATS optimization, and job matching to help you land your dream job.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                <Link href="/signup">
                  <Button 
                    size="lg" 
                    className="min-w-[200px] h-12 text-base gap-2 rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-glow"
                  >
                    Start Building Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/builder">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="min-w-[200px] h-12 text-base rounded-full border-primary/20 shadow-glow-light"
                  >
                    Try Demo
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 pt-12"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br opacity-20 rounded-xl blur-sm transition-opacity duration-300 group-hover:opacity-30" />
                    <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-background/50 backdrop-blur-sm border shadow-glow-light relative">
                      <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-glow`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Features Section */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 md:gap-24">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="grid md:grid-cols-2 gap-8 md:gap-12 items-center"
                >
                  <div className="space-y-6">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className={`relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br ${feature.gradient}`}>
                    <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/20 backdrop-blur-sm" />
                    <div className="relative h-full flex items-center justify-center p-8">
                      <feature.icon className="h-16 w-16 text-primary/80" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Resume Sections */}
        <section className="py-24 md:py-32 relative overflow-hidden bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Comprehensive Resume & Job Tools
              </h2>
              <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
                Build your professional profile and find perfect job matches with our comprehensive tools
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
                  <div className="relative p-6 rounded-xl bg-background/50 backdrop-blur-sm border">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <section.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">{section.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{section.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="relative rounded-3xl overflow-hidden bg-primary/5 border p-8 md:p-12">
              <div className="absolute inset-0 bg-grid-pattern opacity-10" />
              <div className="relative z-10 text-center space-y-8 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Build Your Professional Resume?
                </h2>
                <p className="text-muted-foreground text-lg">
                  Join thousands of professionals who trust our AI-powered resume builder to advance their careers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button 
                      size="lg" 
                      className="min-w-[200px] h-12 text-base gap-2 rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-glow"
                    >
                      Get Started Free
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
} 