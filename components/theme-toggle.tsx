"use client"

import * as React from "react"
import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle({ className, mobile }: { className?: string; mobile?: boolean }) {
  const { setTheme, theme } = useTheme()

  if (mobile) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          onClick={() => setTheme("light")}
          className={`justify-start gap-2 ${theme === "light" ? "bg-accent" : ""}`}
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {theme === "light" && (
            <span className="ml-auto text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
              Active
            </span>
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setTheme("dark")}
          className={`justify-start gap-2 ${theme === "dark" ? "bg-accent" : ""}`}
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && (
            <span className="ml-auto text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
              Active
            </span>
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setTheme("system")}
          className={`justify-start gap-2 ${theme === "system" ? "bg-accent" : ""}`}
        >
          <Laptop className="h-4 w-4" />
          <span>System</span>
          {theme === "system" && (
            <span className="ml-auto text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
              Active
            </span>
          )}
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] p-2 bg-background border">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer ${theme === "light" ? "bg-accent" : ""}`}
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {theme === "light" && (
            <span className="ml-auto text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
              Active
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer ${theme === "dark" ? "bg-accent" : ""}`}
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && (
            <span className="ml-auto text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
              Active
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer ${theme === "system" ? "bg-accent" : ""}`}
        >
          <Laptop className="h-4 w-4" />
          <span>System</span>
          {theme === "system" && (
            <span className="ml-auto text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
              Active
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 