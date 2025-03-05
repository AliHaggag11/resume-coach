"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ResumeStyle {
  theme: 'modern' | 'classic' | 'minimal' | 'professional' | 'creative' | 'technical' | 'executive';
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

  // Load saved style from localStorage if available
  useEffect(() => {
    const savedStyle = localStorage.getItem('resumeStyle');
    if (savedStyle) {
      try {
        const parsedStyle = JSON.parse(savedStyle);
        setStyle(parsedStyle);
      } catch (error) {
        console.error('Error parsing saved style:', error);
      }
    }
  }, []);

  const updateStyle = (newStyle: Partial<ResumeStyle>) => {
    console.log('Updating style with:', newStyle);
    
    // Create the updated style
    const updatedStyle = { ...style, ...newStyle };
    
    // Save to state
    setStyle(updatedStyle);
    
    // Persist to localStorage
    try {
      localStorage.setItem('resumeStyle', JSON.stringify(updatedStyle));
    } catch (error) {
      console.error('Error saving style to localStorage:', error);
    }
    
    console.log('Style updated to:', updatedStyle);
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