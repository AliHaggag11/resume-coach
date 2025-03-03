"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles, Layout, Target, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Footer from "@/components/Footer";

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

        {/* Features Section */}
        <section className="w-full py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
          
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.15]" />
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
          </div>
          
          {/* Floating shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
          </div>

          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center justify-center space-y-16 text-center">
              <motion.div 
                className="space-y-4 max-w-[800px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium text-primary">Powerful Features</span>
                </div>
                <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Everything You Need to
                  <span className="block mt-1">Land Your Dream Job</span>
                </h2>
                <p className="text-muted-foreground text-lg md:text-xl max-w-[600px] mx-auto mt-6">
                  Our AI-powered platform combines cutting-edge technology with professional templates to create resumes that stand out and get you noticed.
                </p>
              </motion.div>

              <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-3 relative">
                {[
                  {
                    icon: Sparkles,
                    title: "AI-Powered Writing",
                    description: "Transform your experience into compelling achievements with our advanced AI. Get tailored suggestions and perfect phrasing that highlight your true potential.",
                    features: ["Smart content suggestions", "Industry-specific keywords", "Impact metrics generation"],
                    gradient: "from-blue-500/10 via-indigo-500/10 to-purple-500/10",
                    delay: 0.1,
                  },
                  {
                    icon: Layout,
                    title: "Beautiful Templates",
                    description: "Choose from our collection of professionally designed templates. Each template is crafted to help you make a strong first impression.",
                    features: ["Modern designs", "Customizable layouts", "Mobile-responsive formats"],
                    gradient: "from-emerald-500/10 via-teal-500/10 to-cyan-500/10",
                    delay: 0.2,
                  },
                  {
                    icon: Target,
                    title: "ATS Optimization",
                    description: "Ensure your resume gets past applicant tracking systems and into human hands. Our smart formatting maximizes your visibility to employers.",
                    features: ["Keyword optimization", "Format compatibility", "Score tracking"],
                    gradient: "from-orange-500/10 via-amber-500/10 to-yellow-500/10",
                    delay: 0.3,
                  },
                ].map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="group relative h-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: feature.delay }}
                  >
                    <div className="relative z-10 h-full overflow-hidden rounded-2xl border bg-background/50 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                      <div className={`absolute inset-0 bg-gradient-to-br opacity-20 group-hover:opacity-30 transition-opacity duration-300 ${feature.gradient}`} />
                      <div className="relative h-full flex flex-col">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors mb-6">
                          <feature.icon className="h-7 w-7 text-primary" />
                        </div>
                        <div className="space-y-2 mb-8">
                          <h3 className="text-2xl font-bold tracking-tight">{feature.title}</h3>
                          <p className="text-muted-foreground/90 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                        <div className="mt-auto pt-6 border-t border-border/50">
                          <ul className="space-y-3">
                            {feature.features.map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className={`absolute -inset-2 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 blur-2xl transition-all duration-300 group-hover:opacity-20`} />
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link href="/features">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="rounded-full h-12 px-8 text-base group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Explore All Features
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 md:py-32 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-primary/5 to-background" />
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.15]" />
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="container relative px-4 md:px-6">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
                <Target className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Start Your Journey</span>
              </div>

              <div className="space-y-4 max-w-[800px]">
                <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Ready to Transform Your
                  <span className="block mt-1">Career Journey?</span>
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground text-lg md:text-xl">
                  Join over 10,000+ professionals who have already elevated their job search with our AI-powered resume builder.
                </p>
              </div>

              <div className="grid gap-4 min-[400px]:flex items-center justify-center mt-4">
                <Link href="/signup">
                  <Button 
                    size="lg" 
                    className="min-w-[200px] h-12 text-base gap-2 rounded-full group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started Free
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="min-w-[200px] h-12 text-base rounded-full group"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    View Demo
                    <Layout className="h-4 w-4 transition-transform group-hover:scale-110" />
                  </span>
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 pt-12">
                {[
                  { label: "Active Users", value: "10K+", icon: CheckCircle2 },
                  { label: "Success Rate", value: "89%", icon: Target },
                  { label: "Templates", value: "50+", icon: Layout },
                  { label: "Time Saved", value: "3hrs", icon: Sparkles },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 backdrop-blur-sm border group hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center gap-8 pt-12">
                <div className="flex -space-x-3">
                  {[
                    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                    "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150",
                  ].map((url, index) => (
                    <div
                      key={index}
                      className="relative w-10 h-10 rounded-full border-2 border-background overflow-hidden ring-1 ring-border"
                    >
                      <img src={url} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="relative w-10 h-10 rounded-full bg-primary/10 border-2 border-background ring-1 ring-border flex items-center justify-center">
                    <span className="text-xs font-medium">+5k</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">4.9/5</span> from over 2,483 reviews
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
