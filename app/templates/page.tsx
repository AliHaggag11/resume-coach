"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Star,
  Download,
  FileCheck,
  Sparkles,
  PenTool,
  Layout,
  Copy,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState } from "react";

const templates = [
  {
    name: "Professional",
    description: "Clean and modern design perfect for corporate roles",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
    popular: true,
    premium: true,
    features: [
      "ATS-friendly layout",
      "Professional fonts",
      "Clean design",
      "Multiple color schemes",
    ],
  },
  {
    name: "Creative",
    description: "Stand out with a unique and artistic layout",
    image: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=800&q=80",
    popular: false,
    premium: true,
    features: [
      "Eye-catching design",
      "Portfolio section",
      "Custom sections",
      "Visual elements",
    ],
  },
  {
    name: "Executive",
    description: "Sophisticated design for senior positions",
    image: "https://images.unsplash.com/photo-1600267204091-5c1ab8b10c02?w=800&q=80",
    popular: false,
    premium: true,
    features: [
      "Executive summary",
      "Achievement focused",
      "Board experience section",
      "Leadership highlights",
    ],
  },
  {
    name: "Basic",
    description: "Simple and clean layout for entry-level positions",
    image: "https://images.unsplash.com/photo-1586281380117-8c2eadb2d094?w=800&q=80",
    popular: false,
    premium: false,
    features: [
      "Clean layout",
      "Basic sections",
      "Easy to read",
      "PDF export",
    ],
  },
  {
    name: "Student",
    description: "Perfect for students and recent graduates",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80",
    popular: false,
    premium: false,
    features: [
      "Education focus",
      "Projects section",
      "Skills showcase",
      "Simple design",
    ],
  },
  {
    name: "Modern Tech",
    description: "Contemporary design for tech professionals",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    popular: false,
    premium: true,
    features: [
      "Modern layout",
      "Tech stack section",
      "Project highlights",
      "GitHub integration",
    ],
  },
  {
    name: "Startup",
    description: "Dynamic layout for startup and innovation roles",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    popular: false,
    premium: true,
    features: [
      "Impact metrics",
      "Innovation focus",
      "Modern design",
      "Customizable sections",
    ],
  },
  {
    name: "Traditional",
    description: "Classic design for traditional industries",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
    popular: false,
    premium: false,
    features: [
      "Classic layout",
      "Standard sections",
      "Professional look",
      "Universal format",
    ],
  },
  {
    name: "Minimalist Pro",
    description: "Elegant and minimal design that stands out",
    image: "https://images.unsplash.com/photo-1586281380117-8c2eadb2d094?w=800&q=80",
    popular: true,
    premium: true,
    features: [
      "Premium typography",
      "Elegant spacing",
      "Custom styling",
      "Modern elements",
    ],
  },
];

const features = [
  {
    icon: PenTool,
    title: "Customizable Design",
    description: "Easily modify colors, fonts, and layouts to match your style",
  },
  {
    icon: Layout,
    title: "ATS-Optimized",
    description: "All templates are tested and optimized for ATS compatibility",
  },
  {
    icon: Copy,
    title: "Multiple Formats",
    description: "Export your resume in PDF, Word, or plain text formats",
  },
  {
    icon: FileCheck,
    title: "Expert-Verified",
    description: "Templates designed by HR professionals and career experts",
  },
];

const categories = [
  { name: "All", value: "all" },
  { name: "Free", value: "free" },
  { name: "Premium", value: "premium" },
];

const industries = [
  { name: "Technology", value: "tech" },
  { name: "Business", value: "business" },
  { name: "Creative", value: "creative" },
  { name: "Student", value: "student" },
];

const experienceLevels = [
  { name: "Entry Level", value: "entry" },
  { name: "Mid Level", value: "mid" },
  { name: "Senior", value: "senior" },
  { name: "Executive", value: "executive" },
];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = templates.filter((template) => {
    if (selectedCategory === "premium" && !template.premium) return false;
    if (selectedCategory === "free" && template.premium) return false;
    
    if (selectedIndustry && !template.name.toLowerCase().includes(selectedIndustry)) return false;
    if (selectedLevel && !template.description.toLowerCase().includes(selectedLevel)) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <>
      <div className="relative isolate">
        <section className="relative overflow-hidden pt-24 pb-16 md:pt-32">
          {/* Background patterns */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.2]" />
          <div className="absolute inset-0">
            <div className="absolute h-full w-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] dark:bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_70%,transparent_100%)] opacity-25" />
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
                  Resume Templates
                </span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
              >
                Professional templates for every career
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-6 text-lg text-muted-foreground"
              >
                Choose from our collection of professionally designed templates and customize them to match your personal style.
              </motion.p>
            </div>

            {/* Features */}
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group rounded-2xl border bg-card/50 backdrop-blur-sm p-6 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Filter Section */}
            <div className="mt-16 max-w-7xl mx-auto">
              <div className="flex flex-col gap-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-full border bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => setSelectedCategory(category.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedCategory === category.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 hover:bg-primary/20 text-foreground"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>

                  <div className="h-6 w-px bg-border" />

                  <div className="flex flex-wrap gap-2">
                    {industries.map((industry) => (
                      <button
                        key={industry.value}
                        onClick={() => setSelectedIndustry(selectedIndustry === industry.value ? "" : industry.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedIndustry === industry.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 hover:bg-primary/20 text-foreground"
                        }`}
                      >
                        {industry.name}
                      </button>
                    ))}
                  </div>

                  <div className="h-6 w-px bg-border" />

                  <div className="flex flex-wrap gap-2">
                    {experienceLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setSelectedLevel(selectedLevel === level.value ? "" : level.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedLevel === level.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 hover:bg-primary/20 text-foreground"
                        }`}
                      >
                        {level.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Filters */}
                {(selectedCategory !== "all" || selectedIndustry || selectedLevel || searchQuery) && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategory !== "all" && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                        </span>
                      )}
                      {selectedIndustry && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {industries.find(i => i.value === selectedIndustry)?.name}
                        </span>
                      )}
                      {selectedLevel && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {experienceLevels.find(l => l.value === selectedLevel)?.name}
                        </span>
                      )}
                      {searchQuery && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          Search: {searchQuery}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setSelectedCategory("all");
                          setSelectedIndustry("");
                          setSelectedLevel("");
                          setSearchQuery("");
                        }}
                        className="px-3 py-1 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Templates Grid */}
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative"
                  >
                    <div className="relative z-10 rounded-2xl border bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:scale-[1.02]">
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={template.image}
                          alt={template.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold">{template.name}</h3>
                          <div className="flex items-center gap-2">
                            {template.premium ? (
                              <div className="rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-primary flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5" />
                                Premium
                              </div>
                            ) : (
                              <div className="text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                <Download className="h-3.5 w-3.5" />
                                Free
                              </div>
                            )}
                            {template.popular && (
                              <div className="rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-blue-500 flex items-center gap-1.5">
                                <Star className="h-3.5 w-3.5" />
                                Popular
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{template.description}</p>
                        
                        <ul className="mt-4 space-y-2">
                          {template.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Star className="h-4 w-4 text-primary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        
                        <div className="mt-6">
                          {template.premium ? (
                            <Link href="/pricing">
                              <Button 
                                className="w-full rounded-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20"
                              >
                                Upgrade to Use
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </Button>
                            </Link>
                          ) : (
                            <Button 
                              className="w-full rounded-full h-11 bg-primary/10 hover:bg-primary/20 text-foreground"
                            >
                              Use this template
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-lg text-muted-foreground">No templates found matching your criteria.</p>
                  <Button
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedIndustry("");
                      setSelectedLevel("");
                      setSearchQuery("");
                    }}
                    className="mt-4"
                    variant="outline"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>

            {/* CTA Section */}
            <div className="mt-24 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  Ready to create your resume?
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Choose a template and start building your professional resume today.
                </p>
                <div className="mt-8">
                  <Link href="/builder">
                    <Button 
                      className="rounded-full h-12 px-8 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
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