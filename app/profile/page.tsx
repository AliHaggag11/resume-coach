"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useSubscription } from "@/app/context/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  User,
  Mail,
  Key,
  CreditCard,
  Loader2,
  CheckCircle,
  AlertCircle,
  Crown,
  Shield,
  Info,
  Upload,
  Image as ImageIcon,
  Coins,
  BarChart3,
  BarChart,
  PlusCircle,
  History,
  Clock,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { CREDIT_COSTS, CREDIT_PACKAGES, CreditPackage } from "@/app/context/SubscriptionContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface UserMetadata {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  role?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { credits, creditHistory } = useSubscription();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);

  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata as UserMetadata;
      setFormData(prev => ({
        ...prev,
        fullName: metadata.full_name || "",
        email: user.email || "",
        phone: metadata.phone || "",
      }));
      if (metadata.avatar_url) {
        setAvatarPreview(metadata.avatar_url);
      }
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    try {
      let avatar_url = user.user_metadata?.avatar_url;

      // Upload new avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatar_url = publicUrl;
      }

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          avatar_url,
          updated_at: new Date().toISOString(),
        },
      });

      if (metadataError) throw metadataError;
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) throw error;
      
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      
      toast.success("Password updated successfully");
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setIsSendingVerification(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;
      toast.success("Verification email sent successfully");
    } catch (error: any) {
      console.error("Error sending verification:", error);
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setIsSendingVerification(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and subscription
        </p>
      </div>

      {/* Email Verification Banner */}
      {!user.email_confirmed_at && (
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div className="flex-1">
                <h3 className="font-medium">Verify your email</h3>
                <p className="text-sm text-muted-foreground">
                  Please verify your email address to access all features
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleResendVerification}
                disabled={isSendingVerification}
              >
                {isSendingVerification ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend Email"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Credits & Usage
          </CardTitle>
          <CardDescription>
            Manage your credits and view your usage history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">Transaction History</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        Current Balance
                      </h3>
                      <div className="flex items-center justify-center gap-2 text-3xl font-bold">
                        <Coins className="h-6 w-6 text-primary" />
                        {credits}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4 gap-2"
                        onClick={() => document.getElementById('purchase-credits-button')?.click()}
                      >
                        <PlusCircle className="h-4 w-4" />
                        Purchase Credits
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        Total Earned
                      </h3>
                      <div className="flex items-center justify-center gap-2 text-3xl font-bold">
                        <BarChart3 className="h-6 w-6 text-green-500" />
                        {creditHistory.length > 0 ? 
                          creditHistory
                            .filter(t => t.amount > 0)
                            .reduce((sum, t) => sum + t.amount, 0) : 
                          0
                        }
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        Total credits earned or purchased
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        Total Spent
                      </h3>
                      <div className="flex items-center justify-center gap-2 text-3xl font-bold">
                        <BarChart className="h-6 w-6 text-blue-500" />
                        {creditHistory.length > 0 ? 
                          Math.abs(creditHistory
                            .filter(t => t.amount < 0)
                            .reduce((sum, t) => sum + t.amount, 0)) : 
                          0
                        }
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        Total credits spent on features
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-lg font-medium mt-6">Recent Activity</h3>
              {creditHistory.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Description</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Feature</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-right p-3 text-sm font-medium text-muted-foreground">Credits</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {creditHistory.slice(0, 5).map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-muted/30">
                          <td className="p-3 text-sm">{transaction.description}</td>
                          <td className="p-3 text-sm">
                            {transaction.feature ? (
                              <Badge variant="outline">{transaction.feature}</Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                          </td>
                          <td className={`p-3 text-sm font-medium text-right ${transaction.amount > 0 ? 'text-green-500' : 'text-foreground'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8 border rounded-lg">
                  <div className="text-center">
                    <History className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                    <h3 className="font-medium">No transaction history yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your credit transactions will appear here
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {creditHistory.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Description</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Feature</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-right p-3 text-sm font-medium text-muted-foreground">Credits</th>
                        <th className="text-right p-3 text-sm font-medium text-muted-foreground">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {creditHistory.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-muted/30">
                          <td className="p-3 text-sm">{transaction.description}</td>
                          <td className="p-3 text-sm">
                            {transaction.feature ? (
                              <Badge variant="outline">{transaction.feature}</Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleString()}
                          </td>
                          <td className={`p-3 text-sm font-medium text-right ${transaction.amount > 0 ? 'text-green-500' : 'text-foreground'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </td>
                          <td className="p-3 text-sm font-medium text-right">
                            {transaction.balance_after}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8 border rounded-lg">
                  <div className="text-center">
                    <History className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                    <h3 className="font-medium">No transaction history yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your credit transactions will appear here
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Jobs Features</CardTitle>
                    <CardDescription>Credits needed for job-related features</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center text-sm">
                        <span>AI Analysis</span>
                        <Badge variant="secondary">{CREDIT_COSTS.JOBS.AI_ANALYSIS} credits</Badge>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span>AI Specialized Resume</span>
                        <Badge variant="secondary">{CREDIT_COSTS.JOBS.AI_SPECIALIZED_RESUME} credits</Badge>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span>AI Preparation Guide</span>
                        <Badge variant="secondary">{CREDIT_COSTS.JOBS.AI_PREPARATION_GUIDE} credits</Badge>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span>Practice with AI</span>
                        <Badge variant="secondary">{CREDIT_COSTS.JOBS.PRACTICE_WITH_AI} credits</Badge>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Resume Features</CardTitle>
                    <CardDescription>Credits needed for resume features</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center text-sm">
                        <span>Generate Summary</span>
                        <Badge variant="secondary">{CREDIT_COSTS.RESUME.GENERATE_SUMMARY} credits</Badge>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span>Generate Description</span>
                        <Badge variant="secondary">{CREDIT_COSTS.RESUME.GENERATE_DESCRIPTION} credits</Badge>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span>Generate Achievements</span>
                        <Badge variant="secondary">{CREDIT_COSTS.RESUME.GENERATE_ACHIEVEMENTS} credits</Badge>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span>Suggest Skills</span>
                        <Badge variant="secondary">{CREDIT_COSTS.RESUME.SUGGEST_SKILLS} credits</Badge>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span>Generate Project Description</span>
                        <Badge variant="secondary">{CREDIT_COSTS.RESUME.GENERATE_PROJECT_DESCRIPTION} credits</Badge>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span>Generate Project Tech Stack</span>
                        <Badge variant="secondary">{CREDIT_COSTS.RESUME.GENERATE_PROJECT_TECH_STACK} credits</Badge>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span>Generate Project Achievements</span>
                        <Badge variant="secondary">{CREDIT_COSTS.RESUME.GENERATE_PROJECT_ACHIEVEMENTS} credits</Badge>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span>Generate Award Description</span>
                        <Badge variant="secondary">{CREDIT_COSTS.RESUME.GENERATE_AWARD_DESCRIPTION} credits</Badge>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span>ATS Analyze Resume</span>
                        <Badge variant="secondary">{CREDIT_COSTS.RESUME.ATS_ANALYZE_RESUME} credits</Badge>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span>Download Resume</span>
                        <Badge variant="secondary">{CREDIT_COSTS.RESUME.DOWNLOAD_RESUME} credits</Badge>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Cover Letter Features</CardTitle>
                    <CardDescription>Credits needed for cover letter features</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center text-sm">
                        <span>Generate Letter</span>
                        <Badge variant="secondary">{CREDIT_COSTS.COVER_LETTER.GENERATE_LETTER} credits</Badge>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <Button
                  id="purchase-credits-button"
                  className="gap-2"
                  onClick={() => {
                    const element = document.querySelector('.credits-indicator-button');
                    if (element instanceof HTMLElement) {
                      element.click();
                    }
                  }}
                >
                  <Coins className="h-4 w-4" />
                  Purchase Credits
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-4">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-6">
                <div className="relative size-24">
                  <div className="size-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile"
                        className="size-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended: Square image, at least 400x400px
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                Role
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Your role determines your access level and permissions
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {(user?.user_metadata as UserMetadata)?.role || 'user'}
                </Badge>
                {((user?.user_metadata as UserMetadata)?.role === 'support' || (user?.user_metadata as UserMetadata)?.role === 'admin') && (
                  <Badge variant="outline" className="bg-primary/10">
                    <Shield className="h-3 w-3 mr-1" />
                    Staff Member
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                }
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                Email Address
                {user.email_confirmed_at && (
                  <Badge variant="outline" className="font-normal">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Please contact support to change your email address
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Staff Information - Only shown for support/admin users */}
      {((user?.user_metadata as UserMetadata)?.role === 'support' || (user?.user_metadata as UserMetadata)?.role === 'admin') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Staff Information
            </CardTitle>
            <CardDescription>
              Your staff member information and statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-medium mb-1">Assigned Tickets</h4>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-medium mb-1">Resolved Tickets</h4>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-medium mb-1">Response Time</h4>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription - Hide for support users unless they are also subscribers */}
      {(user?.user_metadata as UserMetadata)?.role !== 'support' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>
              Manage your subscription and billing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium capitalize">{selectedPackage?.name || 'Free'} Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPackage ? 'Full access to all features' : 'Limited features'}
                  </p>
                </div>
              </div>
              {selectedPackage === null && (
                <Button variant="outline">
                  Upgrade Plan
                </Button>
              )}
            </div>
            
            {selectedPackage && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Next Payment</h4>
                  <p className="text-sm text-muted-foreground">
                    Your next payment of ${selectedPackage.price} will be processed on MM/DD/YYYY
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  Manage Subscription
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-10">
        <div className="price-card-container flex flex-col items-center md:items-start md:flex-row gap-4 flex-wrap">
          {CREDIT_PACKAGES.map((pkg) => (
            <div 
              key={pkg.id}
              className={`price-card cursor-pointer relative overflow-hidden bg-background border-2 rounded-xl transition-all duration-200 ${
                selectedPackage?.id === pkg.id ? 'border-primary' : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedPackage(pkg)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedPackage(pkg);
                }
              }}
            >
              {pkg.tag && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg text-xs font-medium">
                  {pkg.tag}
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold">{pkg.name}</h3>
                <div className="mt-2 flex items-end">
                  <span className="text-3xl font-bold">${pkg.price}</span>
                  <span className="text-muted-foreground ml-1 mb-1">one-time</span>
                </div>
                {pkg.discount && (
                  <div className="mt-1 text-sm text-green-500 font-medium">
                    {pkg.discount}% discount
                  </div>
                )}
                <div className="mt-4 text-center py-2 px-3 bg-secondary/50 rounded-md">
                  <span className="font-medium text-lg">{pkg.credits} credits</span>
                </div>
                <div className="mt-4">
                  <Button className="w-full" size="sm">
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-2">Your Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span>Unlimited Resumes & Cover Letters</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span>Access to All AI-Powered Features</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span>All Premium Templates</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span>Job Matching & Recommendations</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span>All Download Formats (PDF, DOCX, TXT)</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span>Priority Customer Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}