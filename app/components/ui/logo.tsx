"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  collapsed?: boolean
  className?: string
}

export function Logo({ collapsed = false, className }: LogoProps) {
  if (collapsed) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-lg font-bold text-primary-foreground">R</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
        <span className="text-lg font-bold text-primary-foreground">R</span>
      </div>
      <span className="font-semibold text-lg">ResumeCoach</span>
    </div>
  )
} 