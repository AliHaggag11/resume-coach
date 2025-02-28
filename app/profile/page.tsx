"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
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
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserMetadata {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  role?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { tier } = useSubscription();
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
                  <h3 className="font-medium capitalize">{tier} Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    {tier === 'free' ? 'Limited features' : 'Full access to all features'}
                  </p>
                </div>
              </div>
              {tier === 'free' && (
                <Button variant="outline">
                  Upgrade Plan
                </Button>
              )}
            </div>
            
            {tier !== 'free' && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Next Payment</h4>
                  <p className="text-sm text-muted-foreground">
                    Your next payment of $X will be processed on MM/DD/YYYY
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
    </div>
  );
}