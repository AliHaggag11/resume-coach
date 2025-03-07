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
  Plus,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Users,
  FileText,
  Settings,
  DollarSign,
  UserPlus,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface UserMetadata {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  role?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { credits, creditHistory, purchaseCredits } = useSubscription();
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
  const [isOpen, setIsOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

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

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    
    setIsPurchasing(true);
    try {
      const { success, error } = await purchaseCredits(selectedPackage.credits);
      
      if (success) {
        toast.success(`Successfully purchased ${selectedPackage.credits} credits!`);
        setIsOpen(false);
        setSelectedPackage(null);
      } else {
        toast.error(error || 'Failed to purchase credits');
      }
    } catch (error: any) {
      console.error('Error purchasing credits:', error);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsPurchasing(false);
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
          Manage your account settings and preferences
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

      {/* Tabs Navigation */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Personal Info</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="credits" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span>Credits & Usage</span>
          </TabsTrigger>
          {((user?.user_metadata as UserMetadata)?.role === 'support' || (user?.user_metadata as UserMetadata)?.role === 'admin') && (
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Staff Management</span>
            </TabsTrigger>
          )}
            </TabsList>
            
        {/* Personal Info Tab */}
        <TabsContent value="personal" className="space-y-6">
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
                  <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                    value={formData.email}
                disabled
                    className="bg-muted/50"
              />
                  <p className="text-xs text-muted-foreground">
                    To change your email, please contact support
                  </p>
            </div>
            <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                    placeholder="(555) 555-5555"
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
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
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
        </TabsContent>

        {/* Credits & Usage Tab */}
        <TabsContent value="credits" className="space-y-6">
        <Card>
            <CardHeader className="flex items-center gap-2 pb-2">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Coins className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <CardTitle>Credits & Usage</CardTitle>
            <CardDescription>
                  Manage your AI credits and view usage history
            </CardDescription>
              </div>
          </CardHeader>
          <CardContent className="space-y-6">
              {/* Current Balance */}
              <div className="bg-muted rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-500/20 p-2 rounded-lg mr-3">
                      <Coins className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Balance</p>
                      <p className="text-2xl font-bold">{credits} Credits</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setIsOpen(true)} 
                    className="bg-primary hover:bg-primary/90"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Credits
                  </Button>
                </div>
              </div>

              {/* Credit Usage Stats */}
              <div>
                <h3 className="text-lg font-medium mb-4">Credit Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-lg bg-card border">
                    <p className="text-base mb-2 text-muted-foreground">Resume Edits</p>
                    <p className="text-2xl font-bold">45</p>
              </div>
                  <div className="p-5 rounded-lg bg-card border">
                    <p className="text-base mb-2 text-muted-foreground">Cover Letters</p>
                    <p className="text-2xl font-bold">12</p>
              </div>
                  <div className="p-5 rounded-lg bg-card border">
                    <p className="text-base mb-2 text-muted-foreground">Job Analyses</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Transaction History</h3>
                  <Button variant="ghost" size="sm" className="gap-1 h-8">
                    <Clock className="h-3.5 w-3.5" />
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {creditHistory.slice(0, 3).map((transaction, index) => (
                    <div key={transaction.id || index} className="flex items-center justify-between p-4 rounded-lg bg-card border">
                      <div className="flex items-center">
                        <div className="bg-blue-500/20 p-2 rounded-lg mr-3">
                          <Coins className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            about {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: false })} ago
                          </p>
                        </div>
                      </div>
                      <p className={`font-medium ${transaction.amount > 0 ? 'text-green-500' : 'text-blue-500'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} Credits
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Staff Management Tab */}
        {((user?.user_metadata as UserMetadata)?.role === 'support' || (user?.user_metadata as UserMetadata)?.role === 'admin') && (
          <TabsContent value="staff" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Staff Dashboard
            </CardTitle>
            <CardDescription>
                  Access staff tools and monitor support metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
                {/* Activity Overview */}
                <div>
                  <h3 className="font-medium mb-3">Activity Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border bg-card">
                      <h4 className="text-sm text-muted-foreground mb-1">Assigned Tickets</h4>
                      <p className="text-2xl font-bold">12</p>
                      <div className="mt-2 text-xs text-green-500 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        <span>25% this week</span>
                </div>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <h4 className="text-sm text-muted-foreground mb-1">Resolved Tickets</h4>
                      <p className="text-2xl font-bold">48</p>
                      <div className="mt-2 text-xs text-green-500 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        <span>15% this month</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <h4 className="text-sm text-muted-foreground mb-1">Avg. Response Time</h4>
                      <p className="text-2xl font-bold">2.4h</p>
                      <div className="mt-2 text-xs text-blue-500 flex items-center">
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        <span>10% improvement</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support Queue */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Active Support Queue</h3>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Refresh</span>
                    </Button>
                </div>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/40 px-4 py-2.5 border-b grid grid-cols-12 gap-4 text-sm font-medium">
                      <div className="col-span-1">#</div>
                      <div className="col-span-3">User</div>
                      <div className="col-span-4">Subject</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2 text-right">Waiting</div>
              </div>
                    <div className="divide-y">
                      {[
                        { id: 'T-1023', user: 'james@example.com', subject: 'Resume builder not working', status: 'New', time: '10m' },
                        { id: 'T-1022', user: 'sarah@example.com', subject: 'Login issues after password reset', status: 'In Progress', time: '32m' },
                        { id: 'T-1021', user: 'michael@example.com', subject: 'Feature request: Add new template', status: 'Waiting', time: '2h' },
                      ].map((ticket, i) => (
                        <div key={i} className="px-4 py-3 grid grid-cols-12 gap-4 text-sm hover:bg-muted/20 transition-colors">
                          <div className="col-span-1 font-mono">{ticket.id}</div>
                          <div className="col-span-3 truncate">{ticket.user}</div>
                          <div className="col-span-4 truncate">{ticket.subject}</div>
                          <div className="col-span-2">
                            <Badge className={
                              ticket.status === 'New' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-200' :
                              ticket.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-200' :
                              'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-200'
                            }>
                              {ticket.status}
                            </Badge>
                          </div>
                          <div className="col-span-2 text-right text-muted-foreground">{ticket.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center mt-3">
                    <Button variant="link" size="sm" className="text-xs text-muted-foreground">
                      View All Tickets
                </Button>
                  </div>
            </div>
            
                {/* Admin Tools */}
                {(user?.user_metadata as UserMetadata)?.role === 'admin' && (
              <>
                <Separator />
                    <div>
                      <h3 className="font-medium mb-3">Administration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                              <Users className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <h4 className="font-medium">User Management</h4>
                              <p className="text-sm text-muted-foreground mt-1 mb-3">
                                Manage user roles, permissions, and accounts
                              </p>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  View Users
                                </Button>
                                <Button variant="default" size="sm" className="gap-1">
                                  <UserPlus className="h-3.5 w-3.5" />
                                  Add User
                                </Button>
                </div>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                              <BarChart3 className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                              <h4 className="font-medium">Analytics & Reports</h4>
                              <p className="text-sm text-muted-foreground mt-1 mb-3">
                                View platform usage metrics and generate reports
                              </p>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  Dashboard
                </Button>
                                <Button variant="default" size="sm" className="gap-1">
                                  <FileText className="h-3.5 w-3.5" />
                                  Generate Report
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                              <Settings className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                              <h4 className="font-medium">System Settings</h4>
                              <p className="text-sm text-muted-foreground mt-1 mb-3">
                                Configure application settings and features
                              </p>
                              <Button variant="outline" size="sm">
                                Manage Settings
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                              <DollarSign className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                              <h4 className="font-medium">Billing & Subscriptions</h4>
                              <p className="text-sm text-muted-foreground mt-1 mb-3">
                                Manage billing settings and subscription plans
                              </p>
                              <Button variant="outline" size="sm">
                                Billing Dashboard
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* System Health */}
                    <div>
                      <h3 className="font-medium mb-3">System Health</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-200">
                              Operational
                            </Badge>
                            <span className="font-medium">API Services</span>
                          </div>
                          <div className="text-right text-sm">
                            <span className="text-muted-foreground">Uptime:</span> 99.98%
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-200">
                              Operational
                            </Badge>
                            <span className="font-medium">Database</span>
                          </div>
                          <div className="text-right text-sm">
                            <span className="text-muted-foreground">Uptime:</span> 100%
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-200">
                              Degraded
                            </Badge>
                            <span className="font-medium">Storage</span>
                          </div>
                          <div className="text-right text-sm">
                            <span className="text-muted-foreground">Uptime:</span> 98.5%
                          </div>
                        </div>
                      </div>
                    </div>
              </>
            )}
          </CardContent>
        </Card>
          </TabsContent>
        )}
      </Tabs>
      
      {/* Purchase Credits Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md border-0 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="bg-blue-500/20 p-1.5 rounded-md">
              <Coins className="h-5 w-5 text-blue-500" />
            </div>
            <DialogTitle className="text-xl font-semibold p-0 m-0">
              Purchase Credits
            </DialogTitle>
          </div>
          
          <DialogDescription className="text-muted-foreground pb-4">
            Credits are used for AI-powered features like resume generation, mock interviews, and more.
          </DialogDescription>
          
          <div className="space-y-5 py-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Current Balance:</span>
              <div className="font-bold text-lg flex items-center gap-2">
                <div className="bg-blue-500/20 p-1 rounded-md">
                  <Coins className="h-4 w-4 text-blue-500" />
                </div>
                {credits} Credits
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-3">Select a Package:</p>
              <div className="space-y-3">
                {CREDIT_PACKAGES.map((pkg, index) => (
            <div 
              key={pkg.id}
                    className={cn(
                      "relative border rounded-xl p-4 cursor-pointer transition-colors",
                      selectedPackage?.id === pkg.id 
                        ? "border-blue-500 bg-blue-500/5" 
                        : "border-border hover:border-blue-500/30 hover:bg-blue-500/5"
                    )}
              onClick={() => setSelectedPackage(pkg)}
            >
              {pkg.tag && (
                      <span className={cn(
                        "absolute right-3 top-0 -translate-y-1/2 text-xs px-3 py-0.5 rounded-full font-medium",
                        "bg-blue-500 text-white"
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
                          <div className="text-lg font-medium">{pkg.credits} Credits</div>
                {pkg.discount && (
                            <div className="text-sm text-blue-500">
                              Save {pkg.discount}%
                  </div>
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

          <div className="flex items-center justify-between gap-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 border-blue-500/20 hover:bg-blue-500/5 hover:text-blue-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase} 
              disabled={isPurchasing || !selectedPackage}
              className="flex-1 gap-1 bg-blue-600 hover:bg-blue-700 text-white"
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}