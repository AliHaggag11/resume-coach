"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  Star,
  ArrowRight,
  Shield,
  Clock,
  RefreshCcw,
  Download,
  FileCheck,
  Users,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";

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
    gradient: "from-blue-500/10 via-blue-400/10 to-blue-300/10",
    cta: "Get Started",
    popular: false,
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
      "Real-time suggestions",
      "Export to multiple formats",
      "Priority support",
    ],
    gradient: "from-primary/20 via-primary/10 to-primary/5",
    cta: "Upgrade to Pro",
    popular: true,
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
      "API access",
      "Dedicated support",
      "Custom templates",
      "Unlimited exports",
    ],
    gradient: "from-purple-500/10 via-purple-400/10 to-purple-300/10",
    cta: "Contact Sales",
    popular: false,
  },
];

const features = [
  {
    icon: Shield,
    title: "ATS-Optimized",
    description: "All templates are tested and optimized for ATS compatibility",
  },
  {
    icon: Clock,
    title: "Quick Setup",
    description: "Create your professional resume in minutes, not hours",
  },
  {
    icon: RefreshCcw,
    title: "Regular Updates",
    description: "New templates and features added regularly",
  },
  {
    icon: Download,
    title: "Easy Export",
    description: "Download in PDF, Word, or plain text formats",
  },
  {
    icon: FileCheck,
    title: "Expert-Verified",
    description: "Templates designed by HR professionals and career experts",
  },
  {
    icon: Users,
    title: "24/7 Support",
    description: "Get help whenever you need it from our support team",
  },
];

const stats = [
  { value: "50K+", label: "Resumes Created" },
  { value: "98%", label: "Success Rate" },
  { value: "24/7", label: "Support" },
  { value: "4.9/5", label: "User Rating" },
];

export default function PricingPage() {
  return (
    <>
      <div className="relative isolate">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-16 md:pt-32">
          {/* Background patterns */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.2]" />
          <div className="absolute inset-0">
            <div className="absolute h-full w-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] dark:bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_70%,transparent_100%)] opacity-25" />
          </div>
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
          </div>
          
          {/* Floating shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute top-1/4 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
            />
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="absolute bottom-1/4 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
            />
          </div>
          
          <div className="container relative mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center gap-2 mb-8"
              >
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                  Pricing Plans
                </span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
              >
                Choose your perfect plan
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-6 text-lg text-muted-foreground"
              >
                Start for free, upgrade when you need. No hidden fees or commitments.
              </motion.p>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="relative group rounded-2xl border bg-card p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </motion.div>

            {/* Pricing Tiers */}
            <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 rounded-3xl blur-3xl -z-10" />
              {tiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  className="relative group"
                >
                  <div className={`h-full rounded-3xl border bg-card/50 backdrop-blur-sm p-8 shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                    tier.popular ? "border-primary/50 shadow-primary/10" : "border-border/50"
                  }`}>
                    {tier.popular && (
                      <div className="absolute -top-5 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                        Most Popular
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">{tier.name}</h3>
                      <tier.icon className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div className="mt-6 flex items-baseline">
                      <span className="text-5xl font-bold">${tier.price}</span>
                      <span className="ml-1 text-sm text-muted-foreground">/month</span>
                    </div>
                    
                    <p className="mt-4 text-sm text-muted-foreground">
                      {tier.description}
                    </p>
                    
                    <ul className="mt-8 space-y-4">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm group/item">
                          <div className="relative">
                            <CheckCircle2 className="h-5 w-5 text-primary transition-transform group-hover/item:scale-110" />
                          </div>
                          <span className="transition-colors group-hover/item:text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-8">
                      <Link href="/signup" className="w-full">
                        <Button 
                          className={`w-full rounded-full h-12 text-base font-medium transition-all duration-300 ${
                            tier.popular 
                              ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30" 
                              : "bg-primary/10 hover:bg-primary/20 text-foreground"
                          }`}
                        >
                          {tier.cta}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className={`absolute -inset-[1px] rounded-3xl bg-gradient-to-br ${tier.gradient} opacity-0 blur transition-opacity duration-300 group-hover:opacity-100`} />
                </motion.div>
              ))}
            </div>

            {/* Features Grid */}
            <div className="mt-32 relative">
              <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                  className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
                  className="absolute bottom-20 right-20 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center relative"
              >
                <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary inline-block mb-4">
                  Features
                </span>
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 mb-4">
                  Everything you need to succeed
                </h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                  Powerful features designed to help you create the perfect resume and land your dream job faster.
                </p>
              </motion.div>
              
              <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 relative">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative"
                  >
                    <div className="relative z-10 rounded-2xl border bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 hover:scale-[1.02] h-full">
                      <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <div className="absolute inset-0 rounded-xl bg-primary/5 blur-sm group-hover:blur-md transition-all" />
                        <feature.icon className="relative h-7 w-7 text-primary transition-transform group-hover:scale-110" />
                      </div>
                      
                      <h3 className="mt-6 text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/80">
                        {feature.title}
                      </h3>
                      
                      <p className="mt-3 text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>

                      <div className="mt-6 flex items-center text-sm text-primary/80 font-medium">
                        <span className="group-hover:underline">Learn more</span>
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                    
                    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-32 pb-16 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-3xl blur-3xl -z-10" />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  Still have questions?
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Our team is here to help you make the right choice.
                </p>
                <div className="mt-8 mb-8">
                  <Button 
                    variant="outline" 
                    className="rounded-full h-12 px-8 text-base font-medium border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10"
                  >
                    Contact Support
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
} 