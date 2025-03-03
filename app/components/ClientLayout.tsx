"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "./DashboardLayout";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const isAuthPage = pathname === '/signin' || 
    pathname === '/signup' || 
    pathname === '/forgot-password';

  useEffect(() => {
    if (user && !isAuthPage && pathname === '/') {
      router.push('/dashboard');
    }
  }, [user, isAuthPage, pathname, router]);

  if (user && !isAuthPage) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
    </>
  );
} 