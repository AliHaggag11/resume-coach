"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import { Menu, LogOut, User, Sparkles, CreditCard, Layout, PenLine, Mail, HeadphonesIcon, MessageSquare, Sun, Moon, Laptop } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useState } from "react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  const isSupport = user?.user_metadata?.role === 'support' || user?.user_metadata?.role === 'admin';

  const menuItems = [
    {
      href: "/builder",
      label: "Builder",
      icon: PenLine,
      description: "Create and edit your resume",
    },
    {
      href: "/cover-letter",
      label: "Cover Letter",
      icon: Mail,
      description: "Generate AI-powered cover letters",
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
    ...(!isSupport ? [
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
      ...(!isSupport ? [
        {
          href: "/messages",
          label: "Messages",
          icon: MessageSquare,
          description: "View your support messages",
        }
      ] : []),
      ...(isSupport ? [
        {
          href: "/support",
          label: "Support Dashboard",
          icon: HeadphonesIcon,
          description: "Manage support tickets and messages",
        },
      ] : []),
    ] : []),
  ];

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mx-auto flex h-14 w-full items-center px-4"
      >
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">R</span>
              </div>
              <span className="hidden font-bold sm:inline-block">
                ResumeCoach
              </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10 ${
                    pathname === item.href ? "bg-primary/15" : ""
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${pathname === item.href ? "text-primary" : ""}`} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative size-8 rounded-full p-0">
                      <div className="size-8 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-center overflow-hidden">
                        {user.user_metadata?.avatar_url ? (
                          <img
                            src={user.user_metadata.avatar_url}
                            alt="Profile"
                            className="size-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background border shadow-lg" sideOffset={8}>
                    <div className="bg-background">
                      <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="font-semibold">Theme</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                        <Sun className="mr-2 h-4 w-4" />
                        Light
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                        <Moon className="mr-2 h-4 w-4" />
                        Dark
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
                        <Laptop className="mr-2 h-4 w-4" />
                        System
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={async () => {
                          await signOut();
                          router.replace('/signin');
                        }}
                        className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
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
            
            {/* Mobile menu sheet */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full p-0 sm:max-w-[400px] flex flex-col h-[100dvh]">
                <SheetHeader className="p-5 border-b shrink-0">
                  <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-foreground">R</span>
                    </div>
                    <SheetTitle className="font-bold text-xl">ResumeCoach</SheetTitle>
                  </Link>
                </SheetHeader>

                {/* Scrollable container for all content */}
                <div className="flex-1 overflow-y-auto">
                  {/* Menu items */}
                  <div className="flex flex-col py-2">
                    {menuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-5 py-4 transition-colors hover:bg-primary/10 active:bg-primary/15 ${
                          pathname === item.href ? "bg-primary/15" : ""
                        }`}
                      >
                        <item.icon className={`h-5 w-5 shrink-0 ${pathname === item.href ? "text-primary" : "text-muted-foreground"}`} />
                        <div className="min-w-0">
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

                  {/* Bottom section - now part of scrollable area */}
                  <div className="p-5 space-y-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    {/* Theme selector */}
                    <div className="rounded-lg border bg-card">
                      <div className="px-4 py-3 text-sm font-medium">Theme</div>
                      <div className="grid grid-cols-3 divide-x border-t">
                        <button
                          onClick={() => setTheme("light")}
                          className="flex flex-col items-center justify-center gap-1 px-4 py-3 hover:bg-accent transition-colors"
                        >
                          <Sun className="h-4 w-4" />
                          <span className="text-xs">Light</span>
                        </button>
                        <button
                          onClick={() => setTheme("dark")}
                          className="flex flex-col items-center justify-center gap-1 px-4 py-3 hover:bg-accent transition-colors"
                        >
                          <Moon className="h-4 w-4" />
                          <span className="text-xs">Dark</span>
                        </button>
                        <button
                          onClick={() => setTheme("system")}
                          className="flex flex-col items-center justify-center gap-1 px-4 py-3 hover:bg-accent transition-colors"
                        >
                          <Laptop className="h-4 w-4" />
                          <span className="text-xs">System</span>
                        </button>
                      </div>
                    </div>

                    {/* User section */}
                    {user ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 px-4">
                          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {user.user_metadata?.avatar_url ? (
                              <img
                                src={user.user_metadata.avatar_url}
                                alt="Profile"
                                className="size-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {user.user_metadata?.full_name || user.email}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Link href="/profile" onClick={() => setIsOpen(false)}>
                            <Button variant="outline" className="w-full">
                              <User className="h-4 w-4 mr-2" />
                              Profile
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            className="w-full text-red-600 dark:text-red-400"
                            onClick={async () => {
                              await signOut();
                              router.replace('/signin');
                            }}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign out
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <Link href="/signin" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full">Sign In</Button>
                        </Link>
                        <Link href="/signup" onClick={() => setIsOpen(false)}>
                          <Button className="w-full">Sign Up</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.nav>
    </div>
  );
}