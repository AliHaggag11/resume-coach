"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FileText,
  BriefcaseIcon,
  Settings,
  LogOut,
  PenLine,
  MessageSquare,
  Users,
  HeadphonesIcon,
  Shield,
  Sun,
  Moon,
  User,
  Menu,
  X,
  Sparkles,
  Bolt,
  Home,
  Award,
  BarChart,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Logo } from "@/app/components/ui/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/app/components/ui/switch";
import { motion } from "framer-motion";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  role?: string[];
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Jobs",
    href: "/jobs",
    icon: BriefcaseIcon,
  },
  {
    title: "Resumes",
    href: "/builder",
    icon: FileText,
  },
  {
    title: "Cover Letters",
    href: "/cover-letter",
    icon: PenLine,
  },
  {
    title: "Support Dashboard",
    href: "/support",
    icon: HeadphonesIcon,
    role: ["support", "admin"],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  }, [pathname, isMobile]);

  const filteredNavItems = navItems.filter(
    (item) =>
      !item.role ||
      (user?.user_metadata?.role &&
        item.role.includes(user.user_metadata.role))
  );

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  return (
    <div className="min-h-screen">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="h-10 w-10 rounded-full bg-background shadow-md border"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-background transition-all duration-300",
          // Desktop behavior
          !isMobile && (isCollapsed ? "w-20" : "w-72"),
          // Mobile behavior
          isMobile && (isMobileOpen ? "translate-x-0" : "-translate-x-full"),
          isMobile && "w-72 shadow-xl",
          "border-r border-r-muted/60"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="h-18 border-b border-b-muted/60 flex items-center px-5 py-5">
            <div className="flex-1">
              <Logo collapsed={isMobile ? false : isCollapsed} className={isCollapsed ? "justify-center" : ""} />
            </div>
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-8 w-8 rounded-full hover:bg-muted"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between overflow-y-auto py-4 scrollbar-thin">
            {/* Navigation Items */}
            <div className="px-3">
              {!isCollapsed && !isMobile && (
                <div className="mb-4 px-3">
                  <h2 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                    Main Navigation
                  </h2>
                </div>
              )}
              
              <nav className="space-y-1.5">
                {filteredNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative group",
                        isActive
                          ? "bg-primary/10 text-primary hover:bg-primary/15"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                        !isMobile && isCollapsed ? "justify-center" : "",
                        isActive && !isCollapsed && "pl-4",
                      )}
                    >
                      {isActive && !isCollapsed && (
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                      )}
                      <div className={cn(
                        "relative",
                        isActive && isCollapsed ? 
                          "after:absolute after:-left-2 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-6 after:bg-primary after:rounded-r-full" : 
                          ""
                      )}>
                        <item.icon className={cn(
                          "w-5 h-5 transition-transform",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                          isCollapsed ? "group-hover:scale-110" : ""
                        )} />
                      </div>
                      {(!isCollapsed || isMobile) && (
                        <span className="truncate">{item.title}</span>
                      )}
                      
                      {item.badge && !isCollapsed && (
                        <span className="ml-auto inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* User Section */}
            <div className={cn(
              "mt-auto bg-muted/30 space-y-3 p-3",
              !isCollapsed ? "mx-3 rounded-lg" : ""
            )}>
              <div className="flex items-center gap-3 px-2 py-2">
                {(!isCollapsed || isMobile) ? (
                  <>
                    <Avatar className="border-2 border-primary/10 h-10 w-10 ring-2 ring-background">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || "User"} />
                      <AvatarFallback className="bg-primary/20 text-primary font-medium">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {user?.email}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user?.user_metadata?.role || "User"}
                      </p>
                    </div>
                  </>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 mx-auto">
                        <Avatar className="h-10 w-10 border-2 border-primary/10 ring-2 ring-background">
                          <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || "User"} />
                          <AvatarFallback className="bg-primary/20 text-primary font-medium">{userInitials}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {theme === 'light' ? (
                              <Sun className="h-4 w-4" />
                            ) : (
                              <Moon className="h-4 w-4" />
                            )}
                            <span>Dark Mode</span>
                          </div>
                          <Switch
                            checked={theme === 'dark'}
                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                          />
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="space-y-1">
                {(!isCollapsed || isMobile) && (
                  <div className="flex items-center justify-between rounded-lg px-3 py-2 bg-muted/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {theme === 'light' ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                      <span>Dark Mode</span>
                    </div>
                    <Switch
                      checked={theme === 'dark'}
                      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                )}
                <Link
                  href="/profile"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground",
                    !isMobile && isCollapsed && "justify-center"
                  )}
                >
                  <User className={cn(
                    "h-4 w-4 shrink-0",
                    isCollapsed ? "h-5 w-5" : ""
                  )} />
                  {(!isCollapsed || isMobile) && <span>Profile</span>}
                </Link>
                <button
                  onClick={() => signOut()}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-red-500/10 text-muted-foreground hover:text-red-500",
                    !isMobile && isCollapsed && "justify-center"
                  )}
                >
                  <LogOut className={cn(
                    "h-4 w-4 shrink-0",
                    isCollapsed ? "h-5 w-5" : ""
                  )} />
                  {(!isCollapsed || isMobile) && <span>Sign Out</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          !isMobile && (isCollapsed ? "lg:ml-20" : "lg:ml-72"),
          "ml-0" // No margin on mobile
        )}
      >
        {/* Add padding on mobile to account for the toggle button */}
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </div>
    </div>
  );
} 