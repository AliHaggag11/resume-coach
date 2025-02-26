"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import { Menu, ChevronRight, LogOut, User, Sparkles, CreditCard, Layout, PenLine, Mail } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const menuItems = [
    {
      href: "/builder",
      label: "Builder",
      icon: PenLine,
      description: "Create and edit your resume",
    },
    {
      href: "/features",
      label: "Features",
      icon: Sparkles,
      description: "Explore our AI-powered features",
    },
    {
      href: "/templates",
      label: "Templates",
      icon: Layout,
      description: "Browse professional resume templates",
    },
    {
      href: "/pricing",
      label: "Pricing",
      icon: CreditCard,
      description: "View pricing plans and options",
    },
    {
      href: "/contact",
      label: "Contact",
      icon: Mail,
      description: "Get in touch with our team",
    },
    ...(user ? [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: User,
        description: "Manage your resumes and profile",
      },
      {
        href: "/profile",
        label: "Profile",
        icon: User,
        description: "View and edit your profile",
      },
    ] : []),
  ];

  return (
    <div className="w-full fixed top-0 z-50 px-4 py-3">
      <motion.nav 
        className="mx-auto max-w-[1400px] rounded-full border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 px-1">
              <motion.div 
                className="relative size-7 overflow-hidden rounded-full bg-primary shadow-sm"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-primary-foreground">
                  R
                </span>
              </motion.div>
              <motion.span 
                className="hidden font-semibold sm:inline-block text-lg"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                ResumeCoach
              </motion.span>
            </Link>
            <nav className="hidden md:flex items-center">
              <div className="flex items-center gap-1 rounded-full bg-muted/50 p-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-foreground hover:bg-primary/10 ${
                      pathname === item.href 
                        ? "bg-primary/15 text-foreground shadow-sm" 
                        : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${pathname === item.href ? "text-primary" : ""}`} />
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <ThemeToggle className="h-8 w-8" />
            </div>
            <div className="hidden md:flex items-center">
              <div className="flex items-center gap-1 rounded-full bg-muted/50 p-1">
                {user ? (
                  <Button
                    variant="ghost"
                    onClick={() => signOut()}
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium h-auto"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Link href="/signin">
                      <Button 
                        variant="ghost" 
                        className={`rounded-full px-4 py-2 text-sm font-medium h-auto ${
                          pathname === "/signin" 
                            ? "bg-primary/15 text-foreground shadow-sm" 
                            : ""
                        }`}
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button 
                        className={`rounded-full px-4 py-2 text-sm font-medium h-auto ${
                          pathname === "/signup" 
                            ? "bg-primary/90" 
                            : "bg-primary"
                        }`}
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full p-0 sm:max-w-[400px]">
                <SheetHeader className="p-6 border-b">
                  <Link href="/" className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-foreground">R</span>
                    </div>
                    <SheetTitle className="font-bold text-xl">ResumeCoach</SheetTitle>
                  </Link>
                </SheetHeader>
                <div className="flex flex-col">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-primary/10 ${
                        pathname === item.href ? "bg-primary/15" : ""
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${pathname === item.href ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${pathname === item.href ? "text-foreground" : ""}`}>{item.label}</span>
                          <ChevronRight className={`h-4 w-4 ${pathname === item.href ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="border-t px-6 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium">Appearance</h4>
                    <div className="h-6 w-[1px] bg-border mx-4" />
                    <span className="text-xs text-muted-foreground">Customize your experience</span>
                  </div>
                  <ThemeToggle mobile />
                </div>
                <div className="border-t px-6 py-4">
                  {user ? (
                    <Button
                      variant="ghost"
                      onClick={() => signOut()}
                      className="w-full justify-start gap-2 h-auto py-4"
                    >
                      <LogOut className="h-5 w-5" />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">Sign Out</span>
                        <span className="text-xs text-muted-foreground">Log out of your account</span>
                      </div>
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href="/signin" className="w-full">
                        <Button 
                          variant="ghost" 
                          className={`w-full justify-start gap-2 h-auto py-4 ${
                            pathname === "/signin" ? "bg-primary/15" : ""
                          }`}
                        >
                          <User className={`h-5 w-5 ${pathname === "/signin" ? "text-primary" : ""}`} />
                          <div className="flex flex-col items-start">
                            <span className={`text-sm font-medium ${pathname === "/signin" ? "text-foreground" : ""}`}>Sign In</span>
                            <span className="text-xs text-muted-foreground">Access your account</span>
                          </div>
                        </Button>
                      </Link>
                      <Link href="/signup" className="w-full">
                        <Button className={`w-full h-10 ${
                          pathname === "/signup" ? "bg-primary/90" : ""
                        }`}>
                          Create Account
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.nav>
    </div>
  );
} 