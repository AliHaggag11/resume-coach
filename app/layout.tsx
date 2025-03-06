import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/app/context/AuthContext";
import { SubscriptionProvider } from "@/app/context/SubscriptionContext";
import { Toaster } from "sonner";
import ClientLayout from "./components/ClientLayout";

export const metadata: Metadata = {
  title: "ResumeCoach - AI-Powered Resume Builder",
  description: "Create professional resumes with AI assistance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Afacad+Flux:wght@100..1000&display=swap" rel="stylesheet" />
      </head>
      <body className="font-afacad">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SubscriptionProvider>
              <Toaster position="top-center" />
              <ClientLayout>{children}</ClientLayout>
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
