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
      redirect("/signin");
    } else if (user.user_metadata?.role !== "support" && user.user_metadata?.role !== "admin") {
      redirect("/");
    }
  }, [user]);

  if (!user || (user.user_metadata?.role !== "support" && user.user_metadata?.role !== "admin")) {
    return null;
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {children}
    </div>
  );
} 