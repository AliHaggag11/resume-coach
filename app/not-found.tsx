"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[1000px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative bg-background/30 backdrop-blur-lg rounded-lg border border-border/50 p-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
                  Error 404
                </h2>
                <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Page Not Found
                </h1>
              </div>
              
              <p className="text-base text-muted-foreground leading-relaxed">
                We couldn't find the page you're looking for. It might have been moved, deleted, or never existed. Let's get you back on track.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  asChild
                  variant="default"
                  className="h-11"
                >
                  <Link href="/">
                    Return to Homepage
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 group"
                >
                  <Link href="/builder" className="flex items-center gap-2">
                    Resume Builder
                    <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right side - Visual */}
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/30 rounded-lg" />
              <div className="relative aspect-square flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  <span className="text-[10rem] font-bold tracking-tighter bg-gradient-to-br from-foreground/90 to-foreground/30 bg-clip-text text-transparent select-none">
                    404
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 