"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Twitter, Linkedin, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";

export default function Footer() {
  return (
    <motion.footer
      className="border-t bg-muted/30 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      {/* Main Footer Content */}
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <div className="grid gap-8 md:gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">R</span>
              </div>
              <span className="font-bold text-xl">ResumeCoach</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-[300px]">
              Empowering job seekers with AI-powered resume building tools to land their dream jobs faster and more efficiently.
            </p>
            <div className="flex items-center gap-3">
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </Button>
              </Link>
              <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Linkedin className="h-4 w-4" />
                  <span className="sr-only">LinkedIn</span>
                </Button>
              </Link>
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </Button>
              </Link>
              <Link href="mailto:contact@resumecoach.ai">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Mail className="h-4 w-4" />
                  <span className="sr-only">Email</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-muted-foreground hover:text-foreground transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Changelog
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-muted-foreground hover:text-foreground transition-colors">
                  Partners
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <NewsletterSignup />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t">
        <div className="container px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>© {new Date().getFullYear()} ResumeCoach. All rights reserved.</span>
            </div>
        <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
              <Link href="/cookies" className="hover:text-foreground transition-colors">
                Cookies
              </Link>
              <Link href="/security" className="hover:text-foreground transition-colors">
                Security
          </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
} 