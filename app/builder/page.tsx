"use client";

import { ResumeProvider } from "@/app/context/ResumeContext";
import { ResumeStyleProvider } from "@/app/context/ResumeStyleContext";
import { BuilderPageContent } from "./components/BuilderPageContent";

export default function BuilderPage() {
  return (
    <ResumeProvider>
    <ResumeStyleProvider>
        <BuilderPageContent />
      </ResumeStyleProvider>
      </ResumeProvider>
  );
} 