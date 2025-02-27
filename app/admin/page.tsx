"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Loader2, Shield, UserPlus, Trash2, PencilLine } from "lucide-react";

type StaffUser = {
  id: string;
  email: string;
  role: 'support' | 'admin';
  full_name: string;
  created_at: string;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    role: "support" as "support" | "admin",
    password: "",
  });

  const fetchStaffUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_staff_users');

      if (error) {
        console.error('Error fetching staff users:', error);
        throw error;
      }

      setStaffUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching staff users:', error);
      toast.error(error.message || 'Failed to load staff users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStaffUser = async () => {
    try {
      setIsCreating(true);
      const response = await fetch('/api/admin/create-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create staff user');
      }

      await fetchStaffUsers();
      toast.success('Staff user created successfully');
      setFormData({ email: "", fullName: "", role: "support", password: "" });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating staff user:', error);
      toast.error(error.message || 'Failed to create staff user');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'support' | 'admin') => {
    try {
      const response = await fetch('/api/admin/update-staff-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role');
      }

      setStaffUsers(users =>
        users.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      toast.success('Role updated successfully');
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Failed to update role');
    }
  };

  const handleDeleteStaffUser = async (userId: string) => {
    try {
      setIsDeleting(userId);
      const response = await fetch('/api/admin/delete-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete staff user');
      }

      await fetchStaffUsers();
      toast.success('Staff user deleted successfully');
    } catch (error: any) {
      console.error('Error deleting staff user:', error);
      toast.error(error.message || 'Failed to delete staff user');
    } finally {
      setIsDeleting(null);
    }
  };

  useEffect(() => {
    if (user?.user_metadata?.role === 'admin') {
      fetchStaffUsers();
    }
  }, [user]);

  if (!user || user.user_metadata?.role !== 'admin') {
    return (
      <div className="container max-w-4xl py-24">
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-semibold">Access Denied</h2>
              <p className="text-muted-foreground">
                You need administrator privileges to access this page
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Staff Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage staff users and their roles
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Users</CardTitle>
              <CardDescription>Manage support and admin users</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Staff User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Staff User</DialogTitle>
                  <DialogDescription>
                    Add a new staff member to the system
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, password: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: 'support' | 'admin') =>
                        setFormData((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateStaffUser} disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create User"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : staffUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No staff users found
            </div>
          ) : (
            <div className="space-y-4">
              {staffUsers.map((staffUser) => (
                <div
                  key={staffUser.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <h3 className="font-medium">{staffUser.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{staffUser.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={staffUser.role === 'admin' ? 'default' : 'secondary'}>
                        {staffUser.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Created: {new Date(staffUser.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={staffUser.role}
                      onValueChange={(value: 'support' | 'admin') =>
                        handleUpdateRole(staffUser.id, value)
                      }
                    >
                      <SelectTrigger className="w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteStaffUser(staffUser.id)}
                      disabled={isDeleting === staffUser.id}
                    >
                      {isDeleting === staffUser.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 