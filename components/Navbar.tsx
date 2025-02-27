"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import { Menu, ChevronRight, LogOut, User, Sparkles, CreditCard, Layout, PenLine, Mail, HeadphonesIcon, MessageSquare, Settings2, Sun } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const isSupport = user?.user_metadata?.role === 'support' || user?.user_metadata?.role === 'admin';
  const isAdmin = user?.user_metadata?.role === 'admin';

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
    ...(!isAdmin ? [
      {
        href: "/contact",
        label: "Contact",
        icon: Mail,
        description: "Get in touch with our team",
      }
    ] : []),
    ...(user ? [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: User,
        description: "Manage your resumes and profile",
      },
      {
        href: "/messages",
        label: "Messages",
        icon: MessageSquare,
        description: "View your support messages",
      },
      {
        href: "/profile",
        label: "Profile",
        icon: User,
        description: "View and edit your profile",
      },
      ...(isSupport ? [
        {
          href: "/support",
          label: "Support",
          icon: HeadphonesIcon,
          description: "Customer Support Dashboard",
        },
      ] : []),
      ...(isAdmin ? [
        {
          href: "/admin",
          label: "Admin",
          icon: Settings2,
          description: "System Administration",
        },
      ] : []),
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
                    onClick={async () => {
                      await signOut();
                      router.replace('/');
                    }}
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
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full p-0 sm:max-w-[400px] flex flex-col">
                <SheetHeader className="p-5 border-b shrink-0">
                  <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-foreground">R</span>
                    </div>
                    <SheetTitle className="font-bold text-xl">ResumeCoach</SheetTitle>
                  </Link>
                </SheetHeader>
                <div className="flex-1 py-3">
                  <div className="flex flex-col space-y-1">
                    {menuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-primary/10 ${
                          pathname === item.href ? "bg-primary/15" : ""
                        }`}
                      >
                        <item.icon className={`h-5 w-5 ${pathname === item.href ? "text-primary" : "text-muted-foreground"}`} />
                        <div>
                          <div className={`text-sm font-medium ${pathname === item.href ? "text-foreground" : "text-muted-foreground"}`}>
                            {item.label}
                          </div>
                          <div className="text-xs text-muted-foreground/75 line-clamp-1">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="border-t px-5 py-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      <span className="text-sm font-medium">Dark mode</span>
                    </div>
                    <ThemeToggle mobile />
                  </div>
                </div>
                <div className="border-t px-5 py-4 shrink-0">
                  {user ? (
                    <Button
                      variant="ghost"
                      onClick={async () => {
                        setIsOpen(false);
                        await signOut();
                        router.replace('/');
                      }}
                      className="w-full justify-start gap-3 h-10"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      <Link href="/signin" onClick={() => setIsOpen(false)} className="flex-1">
                        <Button 
                          variant="ghost" 
                          className="w-full h-10"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={() => setIsOpen(false)} className="flex-1">
                        <Button className="w-full h-10">
                          Sign Up
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