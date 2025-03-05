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
  { name: "All Templates", value: "all" },
  { name: "Simple", value: "minimal" },
  { name: "Professional", value: "professional" },
  { name: "Creative", value: "creative" },
];

const industries = [
  { name: "Business", value: "professional" },
  { name: "Creative", value: "creative" },
  { name: "Technical", value: "technical" },
  { name: "All Industries", value: "modern" },
];

const experienceLevels = [
  { name: "Entry Level", value: "minimal" },
  { name: "Mid Level", value: "classic" },
  { name: "Senior", value: "professional" },
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
                        <div className={`w-full h-full flex items-center justify-center bg-white p-4 resume-theme-preview-${template.name.toLowerCase()}`}>
                          <div className="w-full h-full border border-gray-200 rounded-lg flex flex-col p-6">
                            <div className="preview-header mb-4">
                              <div className="preview-name bg-gray-800 h-6 w-3/4 mb-2"></div>
                              <div className="preview-title bg-gray-400 h-4 w-1/2"></div>
                            </div>
                            
                            <div className="preview-section mb-4">
                              <div className="preview-section-title bg-gray-700 h-5 w-1/3 mb-3"></div>
                              <div className="preview-content space-y-2">
                                <div className="flex">
                                  <div className="bg-gray-300 h-4 w-1/3 mr-2"></div>
                                  <div className="bg-gray-200 h-4 w-1/3"></div>
                                </div>
                                <div className="bg-gray-100 h-3 w-full"></div>
                                <div className="bg-gray-100 h-3 w-full"></div>
                                <div className="bg-gray-100 h-3 w-4/5"></div>
                              </div>
                            </div>
                            
                            <div className="preview-section">
                              <div className="preview-section-title bg-gray-700 h-5 w-1/3 mb-3"></div>
                              <div className="preview-content space-y-2">
                                <div className="flex">
                                  <div className="bg-gray-300 h-4 w-1/3 mr-2"></div>
                                  <div className="bg-gray-200 h-4 w-1/3"></div>
                                </div>
                                <div className="bg-gray-100 h-3 w-full"></div>
                                <div className="bg-gray-100 h-3 w-full"></div>
                                <div className="bg-gray-100 h-3 w-4/5"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold">{template.name}</h3>
                          <div className="flex items-center gap-2">
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
                          <Link href={`/builder?theme=${template.name.toLowerCase()}`}>
                            <Button 
                              className="w-full rounded-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              Use this template
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </Link>
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