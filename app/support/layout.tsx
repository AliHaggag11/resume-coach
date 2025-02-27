"use client";

import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      redirect("/login");
    } else if (user.user_metadata?.role !== "support" && user.user_metadata?.role !== "admin") {
      redirect("/");
    }
  }, [user]);

  if (!user || (user.user_metadata?.role !== "support" && user.user_metadata?.role !== "admin")) {
    return null;
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Support Dashboard</h1>
          <p className="text-muted-foreground">Manage customer inquiries and support tickets</p>
        </div>
      </div>
      {children}
    </div>
  );
} 