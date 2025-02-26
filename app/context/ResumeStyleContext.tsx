"use client";

import React, { createContext, useContext, useState } from 'react';

interface ResumeStyle {
  theme: 'modern' | 'classic' | 'minimal' | 'professional';
  font: 'inter' | 'roboto' | 'merriweather' | 'playfair';
  fontSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'comfortable' | 'spacious';
  accentColor: string;
}

interface ResumeStyleContextType {
  style: ResumeStyle;
  updateStyle: (newStyle: Partial<ResumeStyle>) => void;
}

const defaultStyle: ResumeStyle = {
  theme: 'modern',
  font: 'inter',
  fontSize: 'medium',
  spacing: 'comfortable',
  accentColor: '#2563eb', // Default blue
};

const ResumeStyleContext = createContext<ResumeStyleContextType | undefined>(undefined);

export function ResumeStyleProvider({ children }: { children: React.ReactNode }) {
  const [style, setStyle] = useState<ResumeStyle>(defaultStyle);

  const updateStyle = (newStyle: Partial<ResumeStyle>) => {
    setStyle(prev => ({ ...prev, ...newStyle }));
  };

  return (
    <ResumeStyleContext.Provider value={{ style, updateStyle }}>
      {children}
    </ResumeStyleContext.Provider>
  );
}

export function useResumeStyle() {
  const context = useContext(ResumeStyleContext);
  if (context === undefined) {
    throw new Error('useResumeStyle must be used within a ResumeStyleProvider');
  }
  return context;
} 