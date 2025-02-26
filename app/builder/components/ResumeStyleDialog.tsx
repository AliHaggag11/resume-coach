"use client";

import { useResumeStyle } from "@/app/context/ResumeStyleContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HexColorPicker } from "react-colorful";

interface ResumeStyleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ResumeStyleDialog({
  open,
  onOpenChange,
}: ResumeStyleDialogProps) {
  const { style, updateStyle } = useResumeStyle();

  const themes = [
    { value: "modern", label: "Modern" },
    { value: "classic", label: "Classic" },
    { value: "minimal", label: "Minimal" },
    { value: "professional", label: "Professional" },
  ];

  const fonts = [
    { value: "inter", label: "Inter" },
    { value: "roboto", label: "Roboto" },
    { value: "merriweather", label: "Merriweather" },
    { value: "playfair", label: "Playfair Display" },
  ];

  const fontSizes = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ];

  const spacings = [
    { value: "compact", label: "Compact" },
    { value: "comfortable", label: "Comfortable" },
    { value: "spacious", label: "Spacious" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Resume Style Settings</DialogTitle>
          <DialogDescription>
            Customize the appearance of your resume
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="theme" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="font">Font</TabsTrigger>
            <TabsTrigger value="spacing">Spacing</TabsTrigger>
            <TabsTrigger value="color">Color</TabsTrigger>
          </TabsList>
          <TabsContent value="theme" className="mt-4">
            <div className="space-y-4">
              <Label>Theme Style</Label>
              <RadioGroup
                value={style.theme}
                onValueChange={(value: any) => updateStyle({ theme: value })}
                className="grid grid-cols-2 gap-4"
              >
                {themes.map((theme) => (
                  <Label
                    key={theme.value}
                    className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent"
                  >
                    <RadioGroupItem value={theme.value} />
                    <span>{theme.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </TabsContent>
          <TabsContent value="font" className="mt-4">
            <div className="space-y-4">
              <div>
                <Label>Font Family</Label>
                <RadioGroup
                  value={style.font}
                  onValueChange={(value: any) => updateStyle({ font: value })}
                  className="grid grid-cols-2 gap-4 mt-2"
                >
                  {fonts.map((font) => (
                    <Label
                      key={font.value}
                      className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent"
                    >
                      <RadioGroupItem value={font.value} />
                      <span className={font.value}>{font.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <Label>Font Size</Label>
                <RadioGroup
                  value={style.fontSize}
                  onValueChange={(value: any) => updateStyle({ fontSize: value })}
                  className="grid grid-cols-3 gap-4 mt-2"
                >
                  {fontSizes.map((size) => (
                    <Label
                      key={size.value}
                      className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent"
                    >
                      <RadioGroupItem value={size.value} />
                      <span>{size.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="spacing" className="mt-4">
            <div className="space-y-4">
              <Label>Layout Spacing</Label>
              <RadioGroup
                value={style.spacing}
                onValueChange={(value: any) => updateStyle({ spacing: value })}
                className="grid grid-cols-1 gap-4"
              >
                {spacings.map((spacing) => (
                  <Label
                    key={spacing.value}
                    className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent"
                  >
                    <RadioGroupItem value={spacing.value} />
                    <span>{spacing.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </TabsContent>
          <TabsContent value="color" className="mt-4">
            <div className="space-y-4">
              <Label>Accent Color</Label>
              <HexColorPicker
                color={style.accentColor}
                onChange={(color) => updateStyle({ accentColor: color })}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 