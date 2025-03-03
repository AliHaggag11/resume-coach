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

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  role?: string[];
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
          "fixed top-0 left-0 z-40 h-screen bg-background border-r transition-all duration-300",
          // Desktop behavior
          !isMobile && (isCollapsed ? "w-16" : "w-64"),
          // Mobile behavior
          isMobile && (isMobileOpen ? "translate-x-0" : "-translate-x-full"),
          isMobile && "w-64 shadow-xl"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="h-16 border-b flex items-center justify-between px-4">
            <Logo collapsed={isMobile ? false : isCollapsed} />
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-8 w-8 hover:bg-muted"
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

          {/* Navigation Items */}
          <nav className="flex-1 space-y-2 p-3">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary hover:bg-primary/15"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    !isMobile && isCollapsed && "justify-center"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {(!isCollapsed || isMobile) && <span>{item.title}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t bg-muted/50 p-4 space-y-4">
            <div className="flex items-center gap-3">
              {(!isCollapsed || isMobile) ? (
                <>
                  <Avatar className="border-2 border-primary/10">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || "User"} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
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
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Avatar className="h-9 w-9 border-2 border-primary/10">
                        <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || "User"} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
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
                <div className="flex items-center justify-between rounded-lg px-3 py-2">
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
                <User className="h-4 w-4 shrink-0" />
                {(!isCollapsed || isMobile) && <span>Profile</span>}
              </Link>
              <button
                onClick={() => signOut()}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground",
                  !isMobile && isCollapsed && "justify-center"
                )}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {(!isCollapsed || isMobile) && <span>Sign Out</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          !isMobile && (isCollapsed ? "lg:ml-16" : "lg:ml-64"),
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