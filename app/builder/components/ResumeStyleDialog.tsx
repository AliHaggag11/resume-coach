"use client";

import { useResumeStyle } from "@/app/context/ResumeStyleContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HexColorPicker } from "react-colorful";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { 
  Check, 
  RotateCcw, 
  Palette, 
  Type, 
  LayoutGrid, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_COLOR_PRESETS = [
  "#2563eb", // Blue
  "#16a34a", // Green
  "#dc2626", // Red
  "#9333ea", // Purple
  "#ea580c", // Orange
  "#0d9488", // Teal
  "#4338ca", // Indigo
  "#be123c", // Rose
  "#1e293b", // Slate
  "#000000", // Black
];

interface ResumeStyleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define the ResumeStyle type to exactly match the context
interface ResumeStyle {
  theme: 'modern' | 'classic' | 'minimal' | 'professional';
  font: 'inter' | 'roboto' | 'merriweather' | 'playfair';
  fontSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'comfortable' | 'spacious';
  accentColor: string;
}

// Extended fonts for the UI display only
type DisplayFont = ResumeStyle['font'] | 'openSans' | 'lato' | 'montserrat' | 'garamond';

export default function ResumeStyleDialog({
  open,
  onOpenChange,
}: ResumeStyleDialogProps) {
  const { style, updateStyle } = useResumeStyle();
  const [previewTheme, setPreviewTheme] = useState<ResumeStyle['theme']>(style.theme);
  const [tempStyle, setTempStyle] = useState<ResumeStyle>(style);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  // Reset temp style whenever dialog opens
  useEffect(() => {
    if (open) {
      setTempStyle(style);
      setPreviewTheme(style.theme);
    }
  }, [open, style]);

  const themes = [
    { value: "modern" as const, label: "Modern", description: "Clean and contemporary design with a focus on readability" },
    { value: "classic" as const, label: "Classic", description: "Traditional format with a timeless professional appeal" },
    { value: "minimal" as const, label: "Minimal", description: "Simple and streamlined layout with minimal styling" },
    { value: "professional" as const, label: "Professional", description: "Polished appearance ideal for corporate environments" },
  ];

  const fonts = [
    { value: "inter" as const, label: "Inter", family: "'Inter', sans-serif" },
    { value: "roboto" as const, label: "Roboto", family: "'Roboto', sans-serif" },
    { value: "merriweather" as const, label: "Merriweather", family: "'Merriweather', serif" },
    { value: "playfair" as const, label: "Playfair Display", family: "'Playfair Display', serif" },
    // These extra fonts are only for display in the UI but won't be selectable in final output
    { value: "openSans" as const, label: "Open Sans", family: "'Open Sans', sans-serif", disabled: true },
    { value: "lato" as const, label: "Lato", family: "'Lato', sans-serif", disabled: true },
    { value: "montserrat" as const, label: "Montserrat", family: "'Montserrat', sans-serif", disabled: true },
    { value: "garamond" as const, label: "Garamond", family: "'EB Garamond', serif", disabled: true },
  ];

  const fontSizes = [
    { value: "small" as const, label: "Small", scale: "90%" },
    { value: "medium" as const, label: "Medium", scale: "100%" },
    { value: "large" as const, label: "Large", scale: "110%" },
  ];

  const spacings = [
    { value: "compact" as const, label: "Compact", description: "Tighter spacing for maximum content" },
    { value: "comfortable" as const, label: "Comfortable", description: "Balanced spacing for readability" },
    { value: "spacious" as const, label: "Spacious", description: "More whitespace for a modern look" },
  ];

  const applyChanges = () => {
    // Only pass properties that are compatible with the expected type
    updateStyle({
      theme: tempStyle.theme,
      font: tempStyle.font,
      fontSize: tempStyle.fontSize,
      spacing: tempStyle.spacing,
      accentColor: tempStyle.accentColor
    });
    
    toast.success("Style settings updated", {
      description: "Your resume styling has been updated"
    });
    onOpenChange(false);
  };

  const resetToDefaults = () => {
    const defaultStyle: ResumeStyle = {
      theme: 'modern',
      font: 'inter',
      fontSize: 'medium',
      spacing: 'comfortable',
      accentColor: '#2563eb',
    };
    setTempStyle(defaultStyle);
    setPreviewTheme(defaultStyle.theme);
  };

  const updateTempStyle = (key: keyof ResumeStyle, value: any) => {
    // For the font key, ensure we only allow supported values
    if (key === 'font') {
      // Check if the font is one of the allowed values in ResumeStyle
      const isValidFont = ['inter', 'roboto', 'merriweather', 'playfair'].includes(value);
      if (!isValidFont) {
        // If not valid, default to 'inter'
        value = 'inter';
      }
    }
    
    setTempStyle((prev: ResumeStyle) => ({ ...prev, [key]: value }));
    if (key === 'theme') {
      setPreviewTheme(value as ResumeStyle['theme']);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Palette className="mr-2 h-5 w-5" /> Resume Style Settings
          </DialogTitle>
          <DialogDescription>
            Customize the appearance of your resume to make it stand out
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 mt-4">
          <ScrollArea className="h-[500px] pr-4">
        <Tabs defaultValue="theme" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="theme" className="flex items-center justify-center">
                  <LayoutGrid className="h-4 w-4 mr-2" /> Theme
                </TabsTrigger>
                <TabsTrigger value="font" className="flex items-center justify-center">
                  <Type className="h-4 w-4 mr-2" /> Typography
                </TabsTrigger>
                <TabsTrigger value="spacing" className="flex items-center justify-center">
                  <LayoutGrid className="h-4 w-4 mr-2" /> Layout
                </TabsTrigger>
                <TabsTrigger value="color" className="flex items-center justify-center">
                  <Palette className="h-4 w-4 mr-2" /> Colors
                </TabsTrigger>
          </TabsList>

              <TabsContent value="theme" className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Resume Theme</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a theme that best represents your professional style
                </p>
                
                <div className="grid grid-cols-1 gap-4">
                {themes.map((theme) => (
                    <div 
                    key={theme.value}
                      className={`
                        relative flex flex-col border rounded-lg p-4 cursor-pointer transition-all
                        ${tempStyle.theme === theme.value 
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                          : 'hover:border-primary/50 hover:bg-accent'
                        }
                      `}
                      onClick={() => updateTempStyle('theme', theme.value)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-medium">{theme.label}</span>
                          <p className="text-sm text-muted-foreground mt-1">{theme.description}</p>
                        </div>
                        {tempStyle.theme === theme.value && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                      <div 
                        className="mt-4 h-20 w-full bg-muted rounded-md overflow-hidden flex items-center justify-center"
                        style={{ backgroundImage: `url(/themes/${theme.value}-preview.png)`, backgroundSize: 'cover' }}
                      >
                        {/* Theme preview image would go here in a real implementation */}
                      </div>
                    </div>
                  ))}
            </div>
          </TabsContent>

              <TabsContent value="font" className="mt-6 space-y-6">
            <div className="space-y-4">
                  <h3 className="text-lg font-medium">Font Family</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select a font that enhances readability and matches your style
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3">
                  {fonts.map((font) => (
                      <div 
                      key={font.value}
                        className={`
                          relative flex items-center border rounded-lg p-3 cursor-pointer transition-all
                          ${tempStyle.font === font.value 
                            ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                            : 'hover:border-primary/50 hover:bg-accent'
                          }
                          ${font.disabled ? 'opacity-50' : ''}
                        `}
                        onClick={() => {
                          if (!font.disabled) {
                            updateTempStyle('font', font.value);
                          }
                        }}
                      >
                        <div className="flex-1">
                          <span 
                            className="font-medium" 
                            style={{ fontFamily: font.family }}
                          >
                            {font.label}
                          </span>
                          <p 
                            className="text-sm text-muted-foreground mt-1"
                            style={{ fontFamily: font.family }}
                          >
                            The quick brown fox jumps over the lazy dog
                          </p>
                        </div>
                        {tempStyle.font === font.value && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white ml-2">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                        {font.disabled && (
                          <span className="ml-2 text-xs text-muted-foreground">Coming soon</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Font Size</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Adjust the overall text size of your resume
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Size Scale: {tempStyle.fontSize}</Label>
              </div>
                <RadioGroup
                      value={tempStyle.fontSize}
                      onValueChange={(value: any) => updateTempStyle('fontSize', value)}
                      className="grid grid-cols-3 gap-4"
                >
                  {fontSizes.map((size) => (
                    <Label
                      key={size.value}
                          className={`
                            flex flex-col items-center justify-center border rounded-lg p-3 cursor-pointer transition-all
                            ${tempStyle.fontSize === size.value 
                              ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                              : 'hover:border-primary/50 hover:bg-accent'
                            }
                          `}
                        >
                          <RadioGroupItem value={size.value} className="sr-only" />
                          <span className="text-center mb-1">{size.label}</span>
                          <span 
                            className="text-xs text-muted-foreground text-center" 
                            style={{ fontSize: size.scale }}
                          >
                            ({size.scale})
                          </span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </TabsContent>

              <TabsContent value="spacing" className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Layout Spacing</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Control how much whitespace appears between elements
                </p>
                
                <div className="grid grid-cols-1 gap-4">
                {spacings.map((spacing) => (
                    <div 
                    key={spacing.value}
                      className={`
                        relative flex items-start border rounded-lg p-4 cursor-pointer transition-all
                        ${tempStyle.spacing === spacing.value 
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                          : 'hover:border-primary/50 hover:bg-accent'
                        }
                      `}
                      onClick={() => updateTempStyle('spacing', spacing.value)}
                    >
                      <div className="flex-1">
                        <span className="font-medium">{spacing.label}</span>
                        <p className="text-sm text-muted-foreground mt-1">{spacing.description}</p>
                        
                        <div className="mt-3 h-8 w-full bg-muted rounded flex overflow-hidden">
                          {spacing.value === 'compact' && (
                            <div className="flex w-full">
                              <div className="bg-muted-foreground/30 w-[30%] h-full" />
                              <div className="bg-muted-foreground/20 w-[20%] h-full ml-[2px]" />
                              <div className="bg-muted-foreground/30 w-[50%] h-full ml-[2px]" />
                            </div>
                          )}
                          {spacing.value === 'comfortable' && (
                            <div className="flex w-full">
                              <div className="bg-muted-foreground/30 w-[28%] h-full" />
                              <div className="bg-muted-foreground/20 w-[18%] h-full ml-[5px]" />
                              <div className="bg-muted-foreground/30 w-[46%] h-full ml-[5px]" />
                            </div>
                          )}
                          {spacing.value === 'spacious' && (
                            <div className="flex w-full">
                              <div className="bg-muted-foreground/30 w-[25%] h-full" />
                              <div className="bg-muted-foreground/20 w-[15%] h-full ml-[10px]" />
                              <div className="bg-muted-foreground/30 w-[40%] h-full ml-[10px]" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {tempStyle.spacing === spacing.value && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white ml-2">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  ))}
            </div>
          </TabsContent>

              <TabsContent value="color" className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Accent Color</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a color to highlight important elements of your resume
                </p>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-5 gap-3">
                    {DEFAULT_COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        className={`
                          h-10 rounded-md transition-all relative
                          ${tempStyle.accentColor === color 
                            ? 'ring-2 ring-primary ring-offset-2' 
                            : 'hover:scale-110'
                          }
                        `}
                        style={{ backgroundColor: color }}
                        onClick={() => updateTempStyle('accentColor', color)}
                      >
                        {tempStyle.accentColor === color && (
                          <Check className="h-4 w-4 absolute inset-0 m-auto text-white drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <div>
                    <div className="w-full p-4 border rounded-md">
                      <div className="flex items-center mb-2">
                        <div 
                          className="h-5 w-5 rounded mr-2" 
                          style={{ backgroundColor: tempStyle.accentColor }} 
                        />
                        <span>Current color: {tempStyle.accentColor}</span>
                      </div>
              <HexColorPicker
                        color={tempStyle.accentColor}
                        onChange={(color) => updateTempStyle('accentColor', color)}
                        className="w-full"
              />
                    </div>
                  </div>
            </div>
          </TabsContent>
        </Tabs>
          </ScrollArea>
          
          <div className="flex flex-col space-y-4">
            <div className="border rounded-lg p-4 flex-1 bg-muted/30">
              <h3 className="font-medium text-center mb-2">Preview</h3>
              <div className="h-[400px] flex items-center justify-center overflow-hidden">
                <div className="transform scale-[0.35] origin-center border shadow-xl rounded-lg">
                  {/* This would be a real resume preview in the actual implementation */}
                  <div 
                    className="w-[600px] h-[800px] bg-white p-8"
                    style={{ 
                      fontFamily: fonts.find(f => f.value === tempStyle.font)?.family || 'Inter, sans-serif',
                      color: previewTheme === 'minimal' ? '#111' : '#333',
                    }}
                  >
                    <div className="border-b pb-4 mb-4" style={{ borderColor: tempStyle.accentColor }}>
                      <h1 className="text-2xl font-bold" style={{ color: tempStyle.accentColor }}>John Doe</h1>
                      <p className="text-sm">Product Designer</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-lg font-semibold mb-2" style={{ color: tempStyle.accentColor }}>Experience</h2>
                        <div className="pl-0 space-y-1">
                          <div className="text-sm font-medium">Senior Designer</div>
                          <div className="text-xs">Company Inc • 2018 - Present</div>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold mb-2" style={{ color: tempStyle.accentColor }}>Education</h2>
                        <div className="pl-0 space-y-1">
                          <div className="text-sm font-medium">Master of Design</div>
                          <div className="text-xs">University of Design • 2014 - 2018</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button 
                className="w-full flex items-center justify-center gap-2"
                onClick={applyChanges}
              >
                <CheckCircle2 className="h-4 w-4" />
                Apply Changes
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={resetToDefaults}
                  title="Reset to defaults"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 