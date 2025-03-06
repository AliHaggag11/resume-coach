"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles, Layout, Target, ChevronRight, Zap, Star, Crown, Shield, Clock, RefreshCcw, Download, FileCheck, Users, Check, PenTool, Mail, Phone, MapPin, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Feature content from features page
const features = [
  {
    icon: PenTool,
    title: "AI Resume Builder",
    description: "Create professional, ATS-optimized resumes in minutes with our AI-powered builder",
    benefits: [
      "Smart content suggestions",
      "Real-time feedback",
      "Keyword optimization",
      "Professional formatting"
    ],
    gradient: "from-blue-500/30 to-blue-300/30"
  },
  {
    icon: Mail,
    title: "Cover Letter Generator",
    description: "Generate tailored cover letters that complement your resume and impress employers",
    benefits: [
      "Company-specific content",
      "Role-matching language",
      "Professional tone",
      "Multiple style options"
    ],
    gradient: "from-purple-500/30 to-purple-300/30"
  },
  {
    icon: FileCheck,
    title: "ATS Optimization",
    description: "Ensure your resume passes Applicant Tracking Systems with our optimization tools",
    benefits: [
      "Keyword analysis",
      "Format verification",
      "Compatibility checking",
      "Improvement recommendations"
    ],
    gradient: "from-green-500/30 to-green-300/30"
  }
];

// Template preview from templates page
const templates = [
  {
    name: "Modern",
    description: "Clean and contemporary design with a focus on readability",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
    popular: true,
    premium: false,
    features: [
      "Blue accent colors",
      "Streamlined layout",
      "Perfect for most industries",
      "Clean section headers",
    ],
  },
  {
    name: "Classic",
    description: "Traditional format with a timeless professional appeal",
    image: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=800&q=80",
    popular: false,
    premium: false,
    features: [
      "Left-aligned markers",
      "Traditional styling",
      "Subtle formatting",
      "Great for formal industries",
    ],
  },
  {
    name: "Minimal",
    description: "Simple and streamlined layout with minimal styling",
    image: "https://images.unsplash.com/photo-1586281380117-8c2eadb2d094?w=800&q=80",
    popular: true,
    premium: false,
    features: [
      "Clean lines",
      "Maximum whitespace",
      "Minimalist aesthetic",
      "Horizontal section dividers",
    ],
  },
  {
    name: "Professional",
    description: "Polished appearance ideal for corporate environments",
    image: "https://images.unsplash.com/photo-1600267204091-5c1ab8b10c02?w=800&q=80",
    popular: false,
    premium: false,
    features: [
      "Top border accent",
      "Clear section headings",
      "Balanced layout",
      "Professional formatting",
    ],
  },
  {
    name: "Creative",
    description: "Vibrant and distinctive design for creative professionals",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80",
    popular: false,
    premium: false,
    features: [
      "Side column accent",
      "Purple color scheme",
      "Modern typography",
      "Perfect for design roles",
    ],
  },
  {
    name: "Technical",
    description: "Structured layout highlighting technical skills and experience",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    popular: false,
    premium: false,
    features: [
      "Bullet indicators",
      "Tech-focused layout",
      "Clean structure",
      "Skills emphasis",
    ],
  },
  {
    name: "Executive",
    description: "Sophisticated design for leadership and executive roles",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    popular: false,
    premium: false,
    features: [
      "Gold accent details",
      "Understated elegance",
      "Leadership focus",
      "Distinctive headers",
    ],
  },
];

// Pricing tiers from pricing page
const tiers = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for getting started with your resume",
    icon: Star,
    features: [
      "Access to basic templates",
      "Simple resume builder",
      "Export to PDF",
      "Basic formatting options",
      "Up to 1 resume",
    ],
    cta: "Get Started",
    gradient: "from-blue-500/10 via-blue-400/10 to-blue-300/10",
  },
  {
    name: "Pro",
    price: "12",
    description: "Everything you need for a professional resume",
    icon: Zap,
    features: [
      "All Free features",
      "AI writing assistance",
      "Premium templates",
      "Multiple resume versions",
      "Cover letter builder",
    ],
    popular: true,
    cta: "Upgrade to Pro",
    gradient: "from-primary/20 via-primary/10 to-primary/5",
  },
  {
    name: "Enterprise",
    price: "29",
    description: "Advanced features for teams and businesses",
    icon: Crown,
    features: [
      "All Pro features",
      "Team collaboration",
      "Custom branding",
      "Advanced analytics",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    gradient: "from-purple-500/10 via-purple-400/10 to-purple-300/10",
  },
];

export default function HomePage() {
  const [isAIEnhanced, setIsAIEnhanced] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleAIToggle = () => {
    setIsTransitioning(true);
    const content = document.getElementById('resume-content');
    const items = document.querySelectorAll('.magic-reveal-item');
    
    // Start fade out
    content?.classList.add('animate-magicFadeOut');
    items.forEach(item => item.classList.add('opacity-0'));
    
    setTimeout(() => {
      setIsAIEnhanced(!isAIEnhanced);
      content?.classList.remove('animate-magicFadeOut');
      content?.classList.add('animate-magicFadeIn');
      
      // Reveal items one by one
      items.forEach((item, index) => {
        setTimeout(() => {
          item.classList.remove('opacity-0');
          item.classList.add('animate-magicReveal');
        }, index * 100); // Stagger the reveals
      });
      
      setTimeout(() => {
        content?.classList.remove('animate-magicFadeIn');
        setIsTransitioning(false);
      }, 400);
    }, 400);
  };

  const preAIContent = {
    name: "John Smith",
    title: "Web Developer",
    location: "San Francisco, CA",
    status: "Looking for work",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=90",
    summary: "Web developer with 8 years of experience. Good with JavaScript and React. Looking for new opportunities in web development.",
    skills: {
      frontend: ["HTML", "CSS", "JavaScript", "React"],
      backend: ["Node.js", "Express"],
      tools: ["Git", "VS Code"]
    },
    experience: [
      {
        title: "Web Developer",
        company: "Tech Company",
        period: "2020 - Present",
        location: "San Francisco, CA",
        type: "Full-time",
        achievements: [
          "Made websites using React",
          "Fixed bugs in the code",
          "Helped the team with projects",
          "Learned new technologies"
        ]
      },
      {
        title: "Junior Developer",
        company: "Small Studio",
        period: "2018 - 2020",
        location: "Boston, MA",
        type: "Full-time",
        achievements: [
          "Built basic websites",
          "Worked on small projects",
          "Helped with maintenance"
        ]
      }
    ],
    metrics: [
      { name: "Code Quality", score: 75 },
      { name: "Documentation", score: 70 },
      { name: "Team Work", score: 80 },
      { name: "Technical Skills", score: 75 }
    ]
  };

  const aiEnhancedContent = {
    name: "Jonathan Anderson",
    title: "Senior Software Engineer",
    location: "San Francisco Bay Area",
    status: "Open to Senior Engineering Roles",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=90",
    summary: "Distinguished Senior Software Engineer with 8+ years of expertise in full-stack development and cloud architecture. Proven track record of spearheading high-performance engineering teams and architecting scalable solutions that accelerate business growth. Specialized in cutting-edge web technologies and cloud-native development, with a focus on microservices architecture and DevOps excellence.",
    skills: {
      frontend: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Redux", "WebGL"],
      backend: ["Node.js", "Python", "GraphQL", "PostgreSQL", "Redis", "Elasticsearch"],
      cloud: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Microservices"]
    },
    experience: [
      {
        title: "Senior Software Engineer",
        company: "TechCorp Solutions",
        period: "2020 - Present",
        location: "San Francisco, CA",
        type: "Full-time",
        achievements: [
          "Architected and led development of revolutionary cloud-native microservices platform, achieving 300% improvement in system scalability and 45% reduction in latency",
          "Orchestrated and mentored distributed team of 8 engineers across global time zones, consistently delivering mission-critical features ahead of schedule",
          "Spearheaded cloud optimization initiative, resulting in 40% reduction in infrastructure costs through innovative serverless architecture",
          "Established mentorship program leading to 5 junior developers advancing their careers, with 3 achieving promotions within first year"
        ]
      },
      {
        title: "Software Engineer",
        company: "InnovateTech",
        period: "2018 - 2020",
        location: "Boston, MA",
        type: "Full-time",
        achievements: [
          "Engineered high-performance analytics dashboard serving 50k+ users, driving 75% increase in customer engagement metrics",
          "Revolutionized deployment pipeline, achieving 60% reduction in deployment time and 45% decrease in error rates",
          "Optimized critical database architecture resulting in 30% improvement in application performance"
        ]
      }
    ],
    metrics: [
      { name: "ATS Compatibility", score: 95 },
      { name: "Keyword Optimization", score: 92 },
      { name: "Impact Statements", score: 88 },
      { name: "Skills Match", score: 98 }
    ]
  };

  const currentContent = isAIEnhanced ? aiEnhancedContent : preAIContent;

  return (
    <>
      <div className="relative isolate">
        {/* Background decoration */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Primary background pattern */}
          <div className="absolute inset-0 bg-dot-pattern opacity-40" />
          
          {/* Accent circles pattern */}
          <div className="absolute inset-0 bg-circles-pattern opacity-50" />
          
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.15]" />
          
          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
          
          {/* Center glow effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* Hero Section */}
        <section className="relative">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-10 text-center min-h-[calc(100vh-5.5rem)]">
              <div className="space-y-6 max-w-3xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-2"
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 mt-8">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Powered by Gemini AI</span>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="space-y-4"
                >
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Create Professional Resumes with AI
                  </h1>
                  <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl dark:text-muted-foreground">
                    Stand out from the crowd with AI-powered resumes. Get expert suggestions, perfect formatting, and ATS-friendly templates in minutes.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link href="/signup">
                      <Button size="lg" className="min-w-[200px] h-12 text-base gap-2 rounded-full">
                        Get Started Free
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/features">
                      <Button variant="outline" size="lg" className="min-w-[200px] h-12 text-base rounded-full">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground mt-8">
                    {[
                      "No Credit Card Required",
                      "Free Templates",
                      "ATS-Friendly",
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Preview Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative w-full max-w-[1100px] rounded-2xl border bg-background/95 backdrop-blur-sm shadow-xl overflow-hidden group/card"
              >
                {/* Card Header - Template Selector */}
                <div className="sticky top-0 inset-x-0 px-6 py-3 border-b bg-muted/30 backdrop-blur-sm z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Layout className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">Executive Pro</span>
                      </div>
                      <div className="hidden md:block h-6 w-px bg-border" />
                      <div className="hidden md:flex items-center gap-1.5">
                        <div className="flex -space-x-3">
                          {[
                            "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                            "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150",
                            "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150"
                          ].map((url, index) => (
                            <div
                              key={index}
                              className="relative w-6 h-6 rounded-full border-2 border-background overflow-hidden ring-1 ring-border"
                            >
                              <img src={url} alt="User" className="w-full h-full object-cover" />
                            </div>
                          ))}
                          <div className="relative w-6 h-6 rounded-full bg-primary/10 border-2 border-background ring-1 ring-border flex items-center justify-center">
                            <span className="text-xs font-medium">+3k</span>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">used this week</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleAIToggle}
                        disabled={isTransitioning}
                        className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-300 cursor-pointer relative overflow-hidden
                          ${isAIEnhanced ? 'bg-primary/5 hover:bg-primary/10' : 'bg-muted hover:bg-muted/80'}
                          ${isTransitioning ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 animate-shimmer ${!isAIEnhanced && 'opacity-0'}`} />
                        <Sparkles className={`h-3.5 w-3.5 transition-all duration-300 ${isAIEnhanced ? 'text-primary scale-110' : 'text-muted-foreground scale-90'}`} />
                        <span className="text-sm font-medium relative z-10">{isAIEnhanced ? 'AI Enhanced' : 'Basic Mode'}</span>
                      </button>
                      <Button variant="outline" size="sm" className="h-8 px-3 rounded-full">
                        Try Different Style
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div id="resume-content" className="relative px-4 md:px-6 pt-6 pb-20">
                  <div className="grid gap-6 md:gap-8 md:grid-cols-[1fr,300px]">
                    {/* Mobile Profile Info */}
                    <div className="md:hidden flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/10">
                        <img
                          src={currentContent.photo}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground/90">{currentContent.name}</h3>
                        <p className="text-sm text-primary/90">{currentContent.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{currentContent.location}</span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span className="text-primary">{currentContent.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Left Column */}
                    <div className="relative space-y-6 md:space-y-8">
                      {/* Summary */}
                      <div className="group relative">
                        <div className={`absolute -left-4 top-2 opacity-0 group-hover:opacity-100 transition-opacity ${!isAIEnhanced && 'hidden'}`}>
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-xs font-medium text-primary-foreground">98%</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Professional Summary</h3>
                            <div className="flex-1 h-px bg-border/50" />
                          </div>
                          <p className="text-foreground/90 leading-relaxed">
                            {currentContent.summary}
                          </p>
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-8">
                          <h3 className="font-semibold text-base uppercase tracking-wider">Work Experience</h3>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        
                        <div className="space-y-8">
                          {currentContent.experience.map((job, index) => (
                            <div 
                              key={index} 
                              className={`group relative transition-all duration-300 ${isAIEnhanced ? 'hover:bg-primary/5 rounded-lg p-4 -mx-4' : ''}`}
                            >
                              <div className="relative">
                                {/* Header */}
                                <div className="pb-6">
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-baseline justify-between gap-4">
                                      <h4 className={`text-xl font-semibold text-foreground/90 transition-all duration-300 ${isAIEnhanced ? 'group-hover:text-primary' : ''}`}>
                                        {job.title}
                                      </h4>
                                      <div className="shrink-0 px-3 py-1 rounded-full bg-primary/5 text-primary text-sm font-medium">
                                        {job.period}
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                      <span className="text-lg text-primary/90">{job.company}</span>
                                      <span className="h-1.5 w-1.5 rounded-full bg-border" />
                                      <span className="text-muted-foreground">{job.location}</span>
                                      <span className="h-1.5 w-1.5 rounded-full bg-border" />
                                      <span className="text-muted-foreground">{job.type}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Achievements */}
                                <div className="space-y-4">
                                  {job.achievements.map((achievement, i) => (
                                    <div 
                                      key={i} 
                                      className={`group/item relative pl-4 text-muted-foreground/90 transition-all duration-300 magic-reveal-item
                                        ${isAIEnhanced ? 'hover:text-foreground hover:translate-x-1' : 'hover:text-foreground'}
                                        text-left`}
                                    >
                                      <div className={`absolute left-0 top-[0.6rem] w-1.5 h-1.5 rounded-full transition-all duration-300
                                        ${isAIEnhanced ? 'bg-primary/40 group-hover/item:bg-primary group-hover/item:scale-110' : 'bg-border'}`} />
                                      <p className="text-[15px] leading-relaxed">
                                        {achievement}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mobile Skills Section */}
                      <div className="md:hidden space-y-4">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-sm uppercase tracking-wider">Key Skills</h3>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        <div className="flex flex-wrap gap-1.5 justify-start">
                          {Object.values(currentContent.skills).flat().map((skill, index) => (
                            <div
                              key={skill}
                              className={`px-2.5 py-1 rounded-md text-sm font-medium transition-all duration-300 magic-reveal-item
                                ${isAIEnhanced ? 
                                  'bg-primary/5 hover:bg-primary/10 hover:translate-y-[-1px] hover:shadow-sm' : 
                                  'bg-muted hover:bg-muted/80'}`}
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="hidden md:flex flex-col space-y-8">
                      {/* Profile Card */}
                      <div className={`rounded-xl border p-4 space-y-4 transition-all duration-300
                        ${isAIEnhanced ? 'bg-muted/30 hover:bg-muted/40 group/profile' : 'bg-muted/10'}`}>
                        <div className="aspect-[4/3] rounded-lg overflow-hidden">
                          <img
                            src={currentContent.photo}
                            alt="Profile"
                            className={`w-full h-full object-cover transition-transform duration-500
                              ${isAIEnhanced ? 'group-hover/profile:scale-[1.02]' : ''}`}
                          />
                        </div>
                        <div className="space-y-2 text-center">
                          <h3 className="font-semibold text-foreground/90">{currentContent.name}</h3>
                          <p className="text-sm text-primary/90">{currentContent.title}</p>
                        </div>
                        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                          <span>{currentContent.location}</span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span className="text-primary">{currentContent.status}</span>
                        </div>
                      </div>

                      {/* Skills Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-sm uppercase tracking-wider">Technical Skills</h3>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        <div className="space-y-4">
                          {Object.entries(currentContent.skills).map(([category, skills]) => (
                            <div key={category} className="space-y-2">
                              <p className="text-sm font-medium text-foreground/80">{category}</p>
                              <div className="flex flex-wrap gap-1.5 justify-start">
                                {skills.map((skill, index) => (
                                  <div
                                    key={skill}
                                    className={`px-2.5 py-1 rounded-md transition-all duration-300 magic-reveal-item
                                      ${isAIEnhanced ? 
                                        'bg-primary/5 hover:bg-primary/10 hover:translate-y-[-1px] hover:shadow-sm' : 
                                        'bg-muted hover:bg-muted/80'}`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                  >
                                    <span className="text-sm font-medium">{skill}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Analysis Section */}
                      <div className={`rounded-xl border p-4 space-y-4 transition-all duration-300 magic-reveal-item
                        ${isAIEnhanced ? 'bg-muted/30 hover:bg-muted/40' : 'bg-muted/10'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-6 w-6 rounded-full transition-all duration-300 flex items-center justify-center
                              ${isAIEnhanced ? 'bg-primary/10' : 'bg-muted'}`}>
                              <Sparkles className={`h-3.5 w-3.5 transition-colors duration-300
                                ${isAIEnhanced ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>
                            <span className="font-medium">{isAIEnhanced ? 'AI Analysis' : 'Basic Analysis'}</span>
                          </div>
                          <div className="text-sm font-medium">
                            <span className={`${isAIEnhanced ? 'text-primary' : 'text-muted-foreground'}`}>
                              {isAIEnhanced ? '98%' : '75%'}
                            </span>
                            <span className="text-muted-foreground"> / 100%</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {currentContent.metrics.map((metric) => (
                            <div key={metric.name} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span>{metric.name}</span>
                                <span className={isAIEnhanced ? 'text-primary' : 'text-muted-foreground'}>
                                  {metric.score}%
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500
                                    ${isAIEnhanced ? 'bg-primary/80' : 'bg-muted-foreground/50'}`}
                                  style={{ width: `${metric.score}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="absolute bottom-0 inset-x-0 p-4 border-t bg-muted/30 backdrop-blur-sm">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="flex text-primary">
                          {Array(5).fill(null).map((_, i) => (
                            <span key={i} className="transition-transform hover:scale-110 cursor-pointer">★</span>
                          ))}
                        </div>
                        <span className="font-medium">4.9</span>
                        <span className="text-sm text-muted-foreground">(2,483)</span>
                      </div>
                      <div className="hidden md:block h-5 w-px bg-border" />
                      <div className="hidden md:flex items-center gap-2">
                        <span className="font-medium">ATS-Friendly</span>
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 px-4 rounded-full hover:bg-primary/5 flex-1 md:flex-none"
                        onClick={() => setIsPreviewOpen(true)}
                      >
                        Preview
                      </Button>
                      <Link href="/signin">
                        <Button size="sm" className="h-9 px-4 rounded-full flex-1 md:flex-none">
                          Use Template
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-[1000px] max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="px-6 py-3 border-b sticky top-0 bg-muted/30 backdrop-blur-sm z-10">
              <DialogTitle>Resume Preview</DialogTitle>
            </DialogHeader>
            <div className="p-6">
              <div className="grid gap-6 md:gap-8 md:grid-cols-[1fr,300px]">
                {/* Mobile Profile Info */}
                <div className="md:hidden flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/10">
                    <img
                      src={currentContent.photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground/90">{currentContent.name}</h3>
                    <p className="text-sm text-primary/90">{currentContent.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{currentContent.location}</span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span className="text-primary">{currentContent.status}</span>
                    </div>
                  </div>
                </div>

                {/* Left Column */}
                <div className="relative space-y-6 md:space-y-8">
                  {/* Summary */}
                  <div className="group relative">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Professional Summary</h3>
                        <div className="flex-1 h-px bg-border/50" />
                      </div>
                      <p className="text-foreground/90 leading-relaxed">
                        {currentContent.summary}
                      </p>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 mb-8">
                      <h3 className="font-semibold text-base uppercase tracking-wider">Work Experience</h3>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    
                    <div className="space-y-8">
                      {currentContent.experience.map((job, index) => (
                        <div key={index} className="group relative">
                          <div className="relative">
                            {/* Header */}
                            <div className="pb-6">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-baseline justify-between gap-4">
                                  <h4 className="text-xl font-semibold text-foreground/90">
                                    {job.title}
                                  </h4>
                                  <div className="shrink-0 px-3 py-1 rounded-full bg-primary/5 text-primary text-sm font-medium">
                                    {job.period}
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                  <span className="text-lg text-primary/90">{job.company}</span>
                                  <span className="h-1.5 w-1.5 rounded-full bg-border" />
                                  <span className="text-muted-foreground">{job.location}</span>
                                  <span className="h-1.5 w-1.5 rounded-full bg-border" />
                                  <span className="text-muted-foreground">{job.type}</span>
                                </div>
                              </div>
                            </div>

                            {/* Achievements */}
                            <div className="space-y-4">
                              {job.achievements.map((achievement, i) => (
                                <div key={i} className="relative pl-4 text-muted-foreground/90">
                                  <div className="absolute left-0 top-[0.6rem] w-1.5 h-1.5 rounded-full bg-border" />
                                  <p className="text-[15px] leading-relaxed">
                                    {achievement}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="hidden md:flex flex-col space-y-8">
                  {/* Profile Card */}
                  <div className="rounded-xl border p-4 space-y-4 bg-muted/10">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden">
                      <img
                        src={currentContent.photo}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 text-center">
                      <h3 className="font-semibold text-foreground/90">{currentContent.name}</h3>
                      <p className="text-sm text-primary/90">{currentContent.title}</p>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                      <span>{currentContent.location}</span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span className="text-primary">{currentContent.status}</span>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-sm uppercase tracking-wider">Technical Skills</h3>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="space-y-4">
                      {Object.entries(currentContent.skills).map(([category, skills]) => (
                        <div key={category} className="space-y-2">
                          <p className="text-sm font-medium text-foreground/80">{category}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {skills.map((skill) => (
                              <div
                                key={skill}
                                className="px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80"
                              >
                                <span className="text-sm font-medium">{skill}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* NEW: Features Section */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4 border border-primary/20 shadow-glow">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Powerful Features</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Everything You Need to
                <span className="block mt-1">Land Your Dream Job</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-[600px] mx-auto mt-4">
                Our AI-powered platform combines cutting-edge technology with professional templates to create resumes that stand out and get you noticed.
              </p>
            </div>
            
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

        {/* NEW: Templates Section */}
        <section className="py-24 md:py-32 relative overflow-hidden bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
                <Layout className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Professional Templates</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Stand Out with Stunning Templates
              </h2>
              <p className="text-muted-foreground text-lg max-w-[600px] mx-auto mt-4">
                Choose from our collection of professionally designed, ATS-optimized resume templates
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {templates.slice(0, 6).map((template, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative rounded-xl overflow-hidden bg-background border shadow-sm flex flex-col"
                >
                  {/* Template preview area */}
                  <div className="p-6 bg-card border-b">
                    <div className="aspect-[4/3] w-full bg-background flex items-center justify-center">
                      {/* Stylized resume preview - simplified version */}
                      <div className="w-full space-y-3">
                        <div className="h-3 bg-muted-foreground/90 w-full rounded max-w-[80%]"></div>
                        <div className="h-2.5 bg-muted-foreground/50 w-[60%] rounded"></div>
                        {template.name === "Modern" && (
                          <div className="h-2.5 bg-blue-500 w-[45%] rounded"></div>
                        )}
                        {template.name === "Classic" && (
                          <div className="h-2.5 bg-muted-foreground/70 w-[40%] rounded"></div>
                        )}
                        {template.name === "Minimal" && (
                          <div className="h-2.5 bg-muted-foreground/70 w-[35%] rounded"></div>
                        )}
                        {template.name === "Professional" && (
                          <div className="h-2.5 bg-muted-foreground/70 w-[40%] rounded"></div>
                        )}
                        {template.name === "Creative" && (
                          <div className="h-2.5 bg-purple-500 w-[45%] rounded"></div>
                        )}
                        {template.name === "Technical" && (
                          <div className="h-2.5 bg-muted-foreground/80 w-[55%] rounded"></div>
                        )}
                        {template.name === "Executive" && (
                          <div className="h-2.5 bg-amber-500/70 w-[50%] rounded"></div>
                        )}
                        <div className="flex gap-3">
                          <div className="h-2 bg-muted-foreground/30 w-[30%] rounded"></div>
                          <div className="h-2 bg-muted-foreground/20 w-[30%] rounded"></div>
                        </div>
                        <div className="h-1.5 bg-muted-foreground/10 w-full rounded"></div>
                        <div className="h-1.5 bg-muted-foreground/10 w-full rounded"></div>
                        <div className="h-1.5 bg-muted-foreground/10 w-[80%] rounded"></div>
                        <div className="h-4"></div>
                        <div className="h-2.5 bg-muted-foreground/70 w-[45%] rounded"></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-xl">{template.name}</h3>
                      {template.popular && (
                        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                          Popular
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{template.description}</p>
                    
                    <div className="space-y-2 mb-6 flex-1">
                      {template.features.slice(0, 4).map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Star className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Link href="/signup" className="mt-auto">
                      <Button variant="outline" className="w-full gap-2 group">
                        Use this template
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="sm:col-span-2 lg:col-span-3 rounded-xl bg-primary/5 border p-8 text-center space-y-4"
              >
                <h3 className="text-xl font-bold">Looking for More Options?</h3>
                <p className="text-muted-foreground">We have additional templates for every profession and career stage</p>
                <Link href="/signup">
                  <Button className="gap-2">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* NEW: Pricing Section */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Simple Pricing</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Choose the Right Plan for You
              </h2>
              <p className="text-muted-foreground text-lg max-w-[600px] mx-auto mt-4">
                From free resume building to advanced features, we have a plan that fits your needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {tiers.map((tier, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative rounded-xl border bg-card p-6 shadow-sm ${tier.popular ? 'ring-2 ring-primary' : ''}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-3 py-1 rounded-full bg-primary text-sm font-medium text-primary-foreground">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-xl">{tier.name}</h3>
                      <p className="text-sm text-muted-foreground">{tier.description}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${tier.gradient} flex items-center justify-center`}>
                      <tier.icon className="h-6 w-6 text-foreground" />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">${tier.price}</span>
                      <span className="text-sm text-muted-foreground ml-2">/month</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/signup" className="block mt-auto">
                    <Button 
                      variant={tier.popular ? "default" : "outline"} 
                      className="w-full gap-2"
                    >
                      {tier.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* NEW: Contact Form Section */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4 border border-primary/20">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Contact Us</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-4">
                Get in Touch
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                Have questions about ResumeCoach? We're here to help! Fill out the form
                below and we'll get back to you as soon as possible.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: Mail,
                  title: "Email",
                  content: "support@resumecoach.com",
                  description: "Send us an email anytime!",
                  action: "mailto:support@resumecoach.com",
                },
                {
                  icon: Phone,
                  title: "Phone",
                  content: "+1 (555) 123-4567",
                  description: "Mon-Fri from 9am to 5pm EST",
                  action: "tel:+15551234567",
                },
                {
                  icon: MapPin,
                  title: "Office",
                  content: "123 Resume Street",
                  description: "New York, NY 10001",
                  action: "https://maps.google.com/?q=123+Resume+Street+New+York+NY+10001",
                },
              ].map((info, index) => (
                <motion.a
                  href={info.action}
                  target={info.icon === MapPin ? "_blank" : undefined}
                  rel={info.icon === MapPin ? "noopener noreferrer" : undefined}
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative block"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg blur" />
                  <div className="relative p-6 rounded-lg border bg-card text-card-foreground shadow-sm transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-lg group-hover:shadow-primary/5">
                    <div className="mb-4 p-3 rounded-full bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                      <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                    <p className="font-medium text-foreground/90">{info.content}</p>
                    <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                  </div>
                </motion.a>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-2xl mx-auto relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent opacity-20 rounded-lg blur-xl" />
              <div className="relative rounded-lg border bg-card/50 backdrop-blur-sm p-8 shadow-xl">
                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("Message sent successfully! We'll get back to you soon.", {
                    description: "Thank you for contacting us. We typically respond within 24 hours.",
                  });
                }}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="landing-name" className="text-sm font-medium">
                        Name
                      </label>
                      <Input
                        id="landing-name"
                        placeholder="Your name"
                        className="h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="landing-email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="landing-email"
                        type="email"
                        placeholder="your@email.com"
                        className="h-11"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="landing-subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input
                      id="landing-subject"
                      placeholder="What's this about?"
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="landing-message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="landing-message"
                      placeholder="Type your message here..."
                      className="min-h-[120px] resize-none"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 gap-2">
                    Send Message
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section */}
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
