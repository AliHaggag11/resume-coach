"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Sparkles,
  Layout,
  Target,
  Zap,
  FileText,
  PenTool,
  Bot,
  LineChart,
  CheckCircle2,
  ArrowRight,
  Download,
  Share2,
  Languages,
  Award,
  Clock,
  Users,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Writing Assistant",
    description: "Transform your experience into compelling achievements with our advanced AI. Get tailored suggestions and perfect phrasing.",
    benefits: [
      "Smart content suggestions",
      "Industry-specific keywords",
      "Impact metrics generation",
      "Grammar and style checking"
    ],
    gradient: "from-blue-500/10 via-indigo-500/10 to-purple-500/10",
    image: "https://images.unsplash.com/photo-1676277791608-ac54525aa2ed?w=800&q=80",
    alt: "AI writing assistant interface showing smart suggestions"
  },
  {
    icon: Layout,
    title: "Professional Templates",
    description: "Choose from our collection of ATS-friendly, professionally designed templates that help you stand out.",
    benefits: [
      "Modern designs",
      "Industry-specific layouts",
      "Customizable sections",
      "Mobile-responsive formats"
    ],
    gradient: "from-emerald-500/10 via-teal-500/10 to-cyan-500/10",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
    alt: "Professional resume templates showcase"
  },
  {
    icon: Target,
    title: "ATS Optimization",
    description: "Ensure your resume gets past applicant tracking systems with our smart formatting and keyword optimization.",
    benefits: [
      "Keyword analysis",
      "Format compatibility",
      "Score tracking",
      "Improvement suggestions"
    ],
    gradient: "from-orange-500/10 via-amber-500/10 to-yellow-500/10",
    image: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=800&q=80",
    alt: "ATS optimization analysis dashboard"
  },
  {
    icon: PenTool,
    title: "Real-Time Customization",
    description: "Customize every aspect of your resume with our intuitive editor. See changes instantly as you make them.",
    benefits: [
      "Live preview",
      "Font customization",
      "Color schemes",
      "Layout adjustments"
    ],
    gradient: "from-pink-500/10 via-rose-500/10 to-red-500/10",
    image: "https://images.unsplash.com/photo-1600267204091-5c1ab8b10c02?w=800&q=80",
    alt: "Real-time resume customization interface"
  }
];

const additionalFeatures = [
  {
    icon: Download,
    title: "Multiple Export Formats",
    description: "Download your resume in various formats including PDF, Word, and plain text.",
    gradient: "from-blue-500/10 via-indigo-500/10 to-purple-500/10"
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share your resume directly with recruiters or generate a shareable link.",
    gradient: "from-emerald-500/10 via-teal-500/10 to-cyan-500/10"
  },
  {
    icon: Languages,
    title: "Multi-Language Support",
    description: "Create resumes in multiple languages with built-in translation assistance.",
    gradient: "from-orange-500/10 via-amber-500/10 to-yellow-500/10"
  },
  {
    icon: LineChart,
    title: "Analytics Dashboard",
    description: "Track your resume's performance and get insights on how to improve.",
    gradient: "from-pink-500/10 via-rose-500/10 to-red-500/10"
  },
  {
    icon: Clock,
    title: "Version History",
    description: "Keep track of all versions of your resume and easily revert changes.",
    gradient: "from-purple-500/10 via-violet-500/10 to-indigo-500/10"
  },
  {
    icon: Users,
    title: "Expert Review",
    description: "Get professional feedback from our network of career experts.",
    gradient: "from-cyan-500/10 via-blue-500/10 to-sky-500/10"
  }
];

const stats = [
  { 
    label: "Active Users", 
    value: "10K+",
    icon: Users,
    gradient: "from-blue-500 to-indigo-500"
  },
  { 
    label: "Success Rate", 
    value: "89%",
    icon: Target,
    gradient: "from-emerald-500 to-teal-500"
  },
  { 
    label: "Templates", 
    value: "50+",
    icon: Layout,
    gradient: "from-orange-500 to-amber-500"
  },
  { 
    label: "Time Saved", 
    value: "3hrs",
    icon: Clock,
    gradient: "from-pink-500 to-rose-500"
  },
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
                  <span className="text-sm font-medium text-primary">Powerful Features</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Everything You Need to
                  <span className="block mt-1">Build the Perfect Resume</span>
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl max-w-[600px] mx-auto mt-6">
                  Our comprehensive suite of tools and features helps you create professional, ATS-friendly resumes that get you noticed by employers.
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
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/templates">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="min-w-[200px] h-12 text-base rounded-full border-primary/20 shadow-glow-light"
                  >
                    View Templates
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
                  className={`grid gap-8 lg:gap-12 ${index % 2 === 0 ? 'lg:grid-cols-[1fr,400px]' : 'lg:grid-cols-[400px,1fr]'} items-center`}
                >
                  <div className={`space-y-6 ${index % 2 === 1 && 'lg:order-2'}`}>
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shadow-glow">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {feature.title}
                      </h2>
                      <p className="text-muted-foreground text-lg">
                        {feature.description}
                      </p>
                    </div>
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, i) => (
                        <motion.li 
                          key={i} 
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                          className="flex items-center gap-2 text-muted-foreground group"
                        >
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shadow-glow-light">
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                          </div>
                          <span className="group-hover:text-foreground transition-colors">
                            {benefit}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <motion.div 
                    className={`relative group ${index % 2 === 1 && 'lg:order-1'}`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="overflow-hidden rounded-2xl border bg-background/50 backdrop-blur-sm shadow-glow-light">
                      <div className={`absolute inset-0 bg-gradient-to-br opacity-20 group-hover:opacity-30 transition-opacity duration-300 ${feature.gradient}`} />
                      <div className="aspect-[4/3] relative">
                        <Image
                          src={feature.image}
                          alt={feature.alt}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features Grid */}
        <section className="py-24 md:py-32 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.15]" />
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
          </div>
          
          <div className="container px-4 md:px-6 relative">
            <div className="text-center space-y-4 mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent"
              >
                More Powerful Features
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-lg max-w-[600px] mx-auto"
              >
                Discover all the tools and features that make ResumeCoach the best choice for your career journey.
              </motion.p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {additionalFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative"
                >
                  <div className="relative overflow-hidden rounded-2xl border bg-background/50 backdrop-blur-sm p-6 hover:shadow-lg transition-all duration-300 h-full shadow-glow-light">
                    <div className={`absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${feature.gradient}`} />
                    <div className="space-y-4 relative">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shadow-glow">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
          </div>

          <div className="container relative px-4 md:px-6">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 border border-primary/20 shadow-glow">
                <Award className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Start Building Today</span>
              </div>

              <div className="space-y-4 max-w-[800px]">
                <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Ready to Create Your
                  <span className="block mt-1">Professional Resume?</span>
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground text-lg md:text-xl">
                  Join thousands of successful job seekers who have used ResumeCoach to land their dream jobs.
                </p>
              </div>

              <div className="grid gap-4 min-[400px]:flex items-center justify-center mt-4">
                <Link href="/signup">
                  <Button 
                    size="lg" 
                    className="min-w-[200px] h-12 text-base gap-2 rounded-full group relative overflow-hidden bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-glow"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started Free
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>
                <Link href="/templates">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="min-w-[200px] h-12 text-base rounded-full group border-primary/20 shadow-glow-light"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      View Templates
                      <Layout className="h-4 w-4 transition-transform group-hover:scale-110" />
                    </span>
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
} 