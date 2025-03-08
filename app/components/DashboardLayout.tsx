"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "@/app/context/AuthContext";
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
  Search,
  ClipboardList,
  Bookmark,
  Calendar,
  ChevronDown,
  Coins,
  Plus,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { motion, AnimatePresence } from "framer-motion";
import CreditsIndicator from "./CreditsIndicator";
import { useSubscription } from "@/app/context/SubscriptionContext";
import { Toaster } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSidebar } from "@/app/context/SidebarContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Define credit package options
interface CreditPackage {
  amount: number;
  price: number;
  tag?: string;
  discount?: string;
}

// Credit package options
const CREDIT_PACKAGES: CreditPackage[] = [
  { amount: 50, price: 5, tag: "" },
  { amount: 125, price: 10, tag: "Popular", discount: "Save 20%" },
  { amount: 300, price: 20, tag: "Best Value", discount: "Save 33%" }
];

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  role?: string[];
  badge?: string;
  children?: NavItem[];
  expanded?: boolean;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Jobs",
    href: "#", // Changed to # to make it non-clickable
    icon: BriefcaseIcon,
    expanded: false,
    children: [
      {
        title: "Search",
        href: "/jobs/search",
        icon: Search,
      },
      {
        title: "Applications",
        href: "/jobs/applications",
        icon: ClipboardList,
      },
      {
        title: "Saved Jobs",
        href: "/jobs/saved",
        icon: Bookmark,
      },
      {
        title: "Interviews",
        href: "/jobs/interviews",
        icon: Calendar,
      },
    ],
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
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { credits, isLoading: creditsLoading, purchaseCredits } = useSubscription();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({
    "#": pathname.startsWith("/jobs")
  });
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

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

  const handlePurchase = async () => {
    if (selectedPackage === null) return;
    
    const packageAmount = CREDIT_PACKAGES[selectedPackage].amount;
    setIsPurchasing(true);
    
    try {
      const result = await purchaseCredits(packageAmount);
      
      if (result.success) {
        toast.success(`Successfully added ${packageAmount} credits to your account!`);
        setIsOpen(false);
      } else {
        toast.error(`Purchase failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
      toast.error('An unexpected error occurred during purchase');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased relative">
      {/* Mobile Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 border-b border-b-muted/60 flex items-center px-4 lg:px-0 lg:hidden z-30 bg-background/95 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className={cn(
            "h-9 w-9 rounded-full",
            isMobileOpen && "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary"
          )}
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile overlay to close the sidebar when clicking outside */}
      {isMobileOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-background/95 backdrop-blur-md transition-all duration-300",
          // Desktop behavior
          !isMobile && (isCollapsed ? "w-20" : "w-72"),
          // Mobile behavior
          isMobile && (isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"),
          isMobile && "w-[280px]",
          "border-r border-r-muted/60"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="h-18 border-b border-b-muted/60 flex items-center px-5 py-5 bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex-1">
              <Logo collapsed={isMobile ? false : isCollapsed} className={isCollapsed ? "justify-center" : ""} />
            </div>
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-8 w-8 rounded-full hover:bg-primary/20 text-primary/80 hover:text-primary"
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

          <div className="flex-1 flex flex-col justify-between overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            {/* Navigation Items */}
            <div className="px-3">
              {!isCollapsed && !isMobile && (
                <div className="mb-4 px-3">
                  <h2 className="text-xs uppercase font-semibold text-primary/70 tracking-wider">
                    Main Navigation
                  </h2>
                </div>
              )}
              
              <nav className="space-y-1.5">
                {filteredNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedItems[item.href] || false;
                  
                  return (
                    <div key={item.href}>
                      {hasChildren && !isMobile && isCollapsed ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={cn(
                                "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative group justify-center",
                                isActive
                                  ? "bg-primary/15 text-primary hover:bg-primary/20"
                                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                              )}
                            >
                              <div className={cn(
                                "relative flex items-center justify-center p-1.5 rounded-md",
                                isActive ? "bg-primary/20 text-primary" : "text-muted-foreground group-hover:text-foreground",
                                isActive && "after:absolute after:-left-2 after:top-1/2 after:-translate-y-1/2 after:w-1.5 after:h-8 after:bg-primary after:rounded-r-full"
                              )}>
                                <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                              </div>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" align="start" className="w-48">
                            {item.children?.map((child) => {
                              const isChildActive = pathname === child.href;
                              return (
                                <DropdownMenuItem key={child.href} asChild>
                                  <Link
                                    href={child.href}
                                    className={cn(
                                      "flex items-center gap-3 w-full",
                                      isChildActive ? "text-primary" : "text-foreground"
                                    )}
                                  >
                                    <child.icon className="h-4 w-4" />
                                    <span>{child.title}</span>
                                  </Link>
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : hasChildren ? (
                        <button
                          onClick={() => {
                            setExpandedItems(prev => ({
                              ...prev,
                              [item.href]: !isExpanded
                            }));
                            // Don't navigate on mobile or in collapsed mode
                            if (!isExpanded && !isCollapsed && !isMobile) {
                              router.push(item.href);
                            }
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative group",
                            isActive
                              ? "bg-primary/15 text-primary hover:bg-primary/20"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                            !isMobile && isCollapsed ? "justify-center" : "",
                            isActive && !isCollapsed && "pl-4",
                          )}
                        >
                          {isActive && !isCollapsed && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full" />
                          )}
                          <div className={cn(
                            "relative flex items-center justify-center p-1.5 rounded-md",
                            isActive ? "bg-primary/20 text-primary" : "text-muted-foreground group-hover:text-foreground",
                            isActive && isCollapsed ? 
                              "after:absolute after:-left-2 after:top-1/2 after:-translate-y-1/2 after:w-1.5 after:h-8 after:bg-primary after:rounded-r-full" : 
                              ""
                          )}>
                            <item.icon className={cn(
                              "w-5 h-5 transition-transform",
                              isCollapsed ? "group-hover:scale-110" : ""
                            )} />
                          </div>
                          {(!isCollapsed || isMobile) && (
                            <>
                              <span className="truncate">{item.title}</span>
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="ml-auto"
                              >
                                <ChevronDown className="h-4 w-4 shrink-0" />
                              </motion.div>
                            </>
                          )}
                          
                          {item.badge && !isCollapsed && (
                            <span className="ml-auto inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-xs font-medium bg-primary/15 text-primary">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative group",
                            isActive
                              ? "bg-primary/15 text-primary hover:bg-primary/20"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                            !isMobile && isCollapsed ? "justify-center" : "",
                            isActive && !isCollapsed && "pl-4",
                          )}
                        >
                          {isActive && !isCollapsed && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full" />
                          )}
                          <div className={cn(
                            "relative flex items-center justify-center p-1.5 rounded-md",
                            isActive ? "bg-primary/20 text-primary" : "text-muted-foreground group-hover:text-foreground",
                            isActive && isCollapsed ? 
                              "after:absolute after:-left-2 after:top-1/2 after:-translate-y-1/2 after:w-1.5 after:h-8 after:bg-primary after:rounded-r-full" : 
                              ""
                          )}>
                            <item.icon className={cn(
                              "w-5 h-5 transition-transform",
                              isCollapsed ? "group-hover:scale-110" : ""
                            )} />
                          </div>
                          {(!isCollapsed || isMobile) && (
                            <span className="truncate">{item.title}</span>
                          )}
                          
                          {item.badge && !isCollapsed && (
                            <span className="ml-auto inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-xs font-medium bg-primary/15 text-primary">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )}
                      
                      {/* Submenu items */}
                      {hasChildren && (
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className={cn(
                                "mt-1 space-y-1",
                                !isCollapsed || isMobile ? "ml-7 pl-3 border-l-2 border-primary/20" : "px-1"
                              )}>
                                {item.children?.map((child) => {
                                  const isChildActive = pathname === child.href;
                                  return (
                                    <Link
                                      key={child.href}
                                      href={child.href}
                                      className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all relative",
                                        isChildActive
                                          ? "bg-primary/15 text-primary hover:bg-primary/20"
                                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                                        isCollapsed && !isMobile && "justify-center"
                                      )}
                                      onClick={() => {
                                        if (isMobile) {
                                          setIsMobileOpen(false);
                                        }
                                      }}
                                    >
                                      <child.icon className={cn(
                                        "w-4 h-4",
                                        isChildActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                      )} />
                                      {(!isCollapsed || isMobile) && (
                                        <span className="truncate">{child.title}</span>
                                      )}
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* User Section */}
            <div className={cn(
              "mt-auto space-y-3 p-3",
              !isCollapsed ? "mx-3 rounded-lg" : ""
            )}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg",
                !isCollapsed || isMobile ? "bg-gradient-to-r from-primary/10 to-background" : ""
              )}>
                {(!isCollapsed || isMobile) ? (
                  <>
                    <Avatar className="border-2 border-primary/20 h-11 w-11 ring-1 ring-background">
                      <AvatarImage src={user?.user_metadata?.avatar_url || null} alt={user?.email || "User"} />
                      <AvatarFallback className="bg-primary/20 text-primary font-medium">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
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
                      <Button variant="ghost" size="icon" className="h-11 w-11 mx-auto rounded-full hover:bg-primary/15 p-0">
                        <Avatar className="h-full w-full border-2 border-primary/20 ring-1 ring-background">
                          <AvatarImage src={user?.user_metadata?.avatar_url || null} alt={user?.email || "User"} />
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

              <div className="space-y-2">
                {/* Credits indicator */}
                {(!isCollapsed || isMobile) && user && (
                  <div className="mb-3 relative">
                    {/* Hidden original credits indicator for functionality */}
                    <div className="sr-only">
                      <CreditsIndicator collapsed={false} />
                    </div>
                    
                    {/* Custom styled credits display */}
                    <div className="px-3 py-2.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-primary/10 border border-blue-500/20 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="bg-blue-500/20 p-2 rounded-md">
                            <Coins className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium flex items-center gap-1">
                              <span>{creditsLoading ? "Loading..." : `${credits} Credits`}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">AI-powered features</div>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsOpen(true)}
                          className="h-7 w-7 p-0 rounded-full bg-blue-500/15 hover:bg-blue-500/30 text-blue-500 flex items-center justify-center transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {isCollapsed && !isMobile && user && (
                  <div className="mb-3 flex justify-center">
                    {/* Hidden original credits indicator for functionality */}
                    <div className="sr-only">
                      <CreditsIndicator collapsed={true} />
                    </div>
                    
                    {/* Custom styled credits icon for collapsed view */}
                    <button
                      onClick={() => setIsOpen(true)}
                      className="p-2.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-primary/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors group"
                    >
                      <Coins className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                )}
                
                {/* Purchase credits dialog */}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogContent className="sm:max-w-md border-0 bg-background/95 backdrop-blur-sm">
                    <DialogHeader className="space-y-3">
                      <DialogTitle className="flex items-center gap-2.5 text-xl">
                        <div className="bg-blue-500/15 p-1.5 rounded-md">
                          <Coins className="h-5 w-5 text-blue-500" />
                        </div>
                        Purchase Credits
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground text-sm">
                        Credits are used for AI-powered features like resume generation, mock interviews, and more.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-5 py-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Current Balance:</span>
                        <div className="font-semibold text-lg flex items-center gap-2">
                          <div className="bg-blue-500/15 p-1 rounded-md">
                            <Coins className="h-4 w-4 text-blue-500" />
                          </div>
                          {credits} Credits
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Select a Package:</p>
                        <div className="space-y-3 pt-1">
                          {CREDIT_PACKAGES.map((pkg, index) => (
                            <div 
                              key={index}
                              className={cn(
                                "relative border rounded-xl p-4 cursor-pointer transition-all",
                                selectedPackage === index 
                                  ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500" 
                                  : "border-border hover:border-blue-500/30 hover:bg-blue-500/5"
                              )}
                              onClick={() => setSelectedPackage(index)}
                            >
                              {pkg.tag && (
                                <span className={cn(
                                  "absolute right-3 top-0 -translate-y-1/2 text-xs px-3 py-0.5 rounded-full font-medium",
                                  pkg.tag === "Popular" 
                                    ? "bg-blue-500 text-white" 
                                    : "bg-blue-500 text-white"
                                )}>
                                  {pkg.tag}
                                </span>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="bg-blue-900/20 rounded-lg p-2.5">
                                    <Sparkles className="h-6 w-6 text-blue-500" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-lg">{pkg.amount} Credits</div>
                                    {pkg.discount && (
                                      <div className="text-sm text-blue-500 font-medium">{pkg.discount}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-xl font-bold">${pkg.price}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter className="sm:justify-between gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isPurchasing}
                        className="w-full sm:w-auto border-blue-500/20 hover:bg-blue-500/5 hover:text-blue-600 hover:border-blue-500/30"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handlePurchase} 
                        disabled={selectedPackage === null || isPurchasing}
                        className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isPurchasing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Purchase
                            <Plus className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {(!isCollapsed || isMobile) && (
                  <div className="flex items-center justify-between rounded-lg px-3 py-2.5 bg-gradient-to-r from-muted/80 to-muted/40 border border-muted/50">
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
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

                <div className="rounded-lg overflow-hidden border border-muted/50">
                  <Link
                    href="/profile"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground border-b border-muted/50",
                      !isMobile && isCollapsed && "justify-center py-3"
                    )}
                  >
                    <div className={cn(
                      "relative flex items-center justify-center p-1.5 rounded-md bg-muted/50",
                      isCollapsed && !isMobile ? "p-2" : ""
                    )}>
                      <User className={cn(
                        "h-4 w-4 shrink-0",
                        isCollapsed && !isMobile ? "h-5 w-5" : ""
                      )} />
                    </div>
                    {(!isCollapsed || isMobile) && <span>Profile</span>}
                  </Link>
                  <button
                    onClick={() => {
                      signOut()
                        .then(() => {
                          router.push('/');
                        })
                        .catch((error) => {
                          console.error('Error during sign out:', error);
                        });
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-red-500/10 text-muted-foreground hover:text-red-500",
                      !isMobile && isCollapsed && "justify-center py-3"
                    )}
                  >
                    <div className={cn(
                      "relative flex items-center justify-center p-1.5 rounded-md bg-muted/50 group-hover:bg-red-500/10",
                      isCollapsed && !isMobile ? "p-2" : ""
                    )}>
                      <LogOut className={cn(
                        "h-4 w-4 shrink-0",
                        isCollapsed && !isMobile ? "h-5 w-5" : ""
                      )} />
                    </div>
                    {(!isCollapsed || isMobile) && <span>Sign Out</span>}
                  </button>
                </div>
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
        {/* Add padding on mobile to account for the navigation bar */}
        <div className="pt-16 lg:pt-0 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
} 