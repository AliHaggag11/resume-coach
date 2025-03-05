"use client";

import React, { useState } from 'react';
import { useResume } from "@/app/context/ResumeContext";
import { useResumeStyle } from "@/app/context/ResumeStyleContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import ResumePreview from "./ResumePreview";
import { Loader2, Download, FileText, Mail, Link2, Share2, Copy, Linkedin } from "lucide-react";
import { toast } from "sonner";

interface ResumeExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: string, options: ExportOptions) => Promise<void>;
}

interface ExportOptions {
  filename: string;
  quality: number;
  includeContactInfo: boolean;
  pageSize: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
}

const CustomSlider: React.FC<{
  value: number[];
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number[]) => void;
  className?: string;
}> = ({ value, min, max, step, onValueChange, className }) => {
  return (
    <div className={`relative w-full h-5 ${className || ''}`}>
      <div className="w-full h-2 bg-muted rounded-full">
        <div 
          className="h-full bg-primary rounded-full"
          style={{ 
            width: `${((value[0] - min) / (max - min)) * 100}%` 
          }} 
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([parseInt(e.target.value)])}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
};

export default function ResumeExportDialog({
  open,
  onOpenChange,
  onExport,
}: ResumeExportDialogProps) {
  const { resumeData } = useResume();
  const { style } = useResumeStyle();
  const [isExporting, setIsExporting] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<string>("pdf");
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    filename: `resume-${new Date().toISOString().split('T')[0]}`,
    quality: 90,
    includeContactInfo: true,
    pageSize: 'a4',
    orientation: 'portrait',
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(exportFormat, exportOptions);
      toast.success(`Resume exported as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export resume");
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    setIsExporting(true);
    try {
      // Simulate generating a shareable link
      await new Promise(resolve => setTimeout(resolve, 1500));
      const dummyShareUrl = `https://resumecoach.com/s/${Math.random().toString(36).substring(2, 10)}`;
      setShareUrl(dummyShareUrl);
      toast.success("Shareable link created!");
    } catch (error) {
      toast.error("Failed to create shareable link");
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    }
  };

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Export Resume</DialogTitle>
          <DialogDescription>
            Export your resume to different formats or share it online
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="share">Share</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="mt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Export Format</Label>
                  <RadioGroup
                    value={exportFormat}
                    onValueChange={setExportFormat}
                    className="grid grid-cols-2 gap-4 mt-2"
                  >
                    <Label className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="pdf" />
                      <span>PDF</span>
                    </Label>
                    <Label className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="png" />
                      <span>PNG Image</span>
                    </Label>
                    <Label className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="docx" />
                      <span>Word (DOCX)</span>
                    </Label>
                    <Label className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="json" />
                      <span>JSON Data</span>
                    </Label>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filename">Filename</Label>
                  <Input
                    id="filename"
                    value={exportOptions.filename}
                    onChange={(e) => handleOptionChange('filename', e.target.value)}
                    placeholder="resume-filename"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Page Size</Label>
                  </div>
                  <RadioGroup
                    value={exportOptions.pageSize}
                    onValueChange={(value) => handleOptionChange('pageSize', value)}
                    className="grid grid-cols-3 gap-2"
                  >
                    <Label className="flex items-center justify-center border rounded-md p-2 cursor-pointer hover:bg-accent text-center">
                      <RadioGroupItem value="a4" className="sr-only" />
                      <span>A4</span>
                    </Label>
                    <Label className="flex items-center justify-center border rounded-md p-2 cursor-pointer hover:bg-accent text-center">
                      <RadioGroupItem value="letter" className="sr-only" />
                      <span>Letter</span>
                    </Label>
                    <Label className="flex items-center justify-center border rounded-md p-2 cursor-pointer hover:bg-accent text-center">
                      <RadioGroupItem value="legal" className="sr-only" />
                      <span>Legal</span>
                    </Label>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Orientation</Label>
                  </div>
                  <RadioGroup
                    value={exportOptions.orientation}
                    onValueChange={(value) => handleOptionChange('orientation', value)}
                    className="grid grid-cols-2 gap-2"
                  >
                    <Label className="flex items-center justify-center border rounded-md p-2 cursor-pointer hover:bg-accent text-center">
                      <RadioGroupItem value="portrait" className="sr-only" />
                      <span>Portrait</span>
                    </Label>
                    <Label className="flex items-center justify-center border rounded-md p-2 cursor-pointer hover:bg-accent text-center">
                      <RadioGroupItem value="landscape" className="sr-only" />
                      <span>Landscape</span>
                    </Label>
                  </RadioGroup>
                </div>

                {exportFormat === 'png' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Quality: {exportOptions.quality}%</Label>
                    </div>
                    <CustomSlider
                      value={[exportOptions.quality]}
                      min={60}
                      max={100}
                      step={5}
                      onValueChange={(value: number[]) => handleOptionChange('quality', value[0])}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="contact-info"
                    checked={exportOptions.includeContactInfo}
                    onCheckedChange={(checked) => handleOptionChange('includeContactInfo', checked)}
                  />
                  <Label htmlFor="contact-info">Include contact information</Label>
                </div>
              </div>

              <div className="border rounded-lg p-4 flex flex-col items-center justify-center bg-muted/30">
                <div className="text-center mb-4">
                  <h3 className="font-medium">Preview</h3>
                  <p className="text-sm text-muted-foreground">How your resume will look when exported</p>
                </div>
                <div className="w-full h-[300px] overflow-hidden flex items-center justify-center">
                  <div className="transform scale-[0.4] origin-center">
                    <ResumePreview template={style.theme} scale={0.8} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="share" className="mt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-lg">Share Your Resume</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a shareable link that allows others to view your resume online
                  </p>
                </div>

                {shareUrl ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Input value={shareUrl} readOnly />
                      <Button variant="outline" size="icon" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Or share directly:</p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Mail className="h-4 w-4 mr-2" /> Email
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Linkedin className="h-4 w-4 mr-2" /> LinkedIn
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm">
                      When you share your resume, people with the link can view your resume online in a clean, 
                      mobile-friendly format without downloading any files.
                    </p>
                    <Button 
                      onClick={handleShare} 
                      disabled={isExporting}
                      className="w-full"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating Link...
                        </>
                      ) : (
                        <>
                          <Link2 className="h-4 w-4 mr-2" /> Create Shareable Link
                        </>
                      )}
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      <p>Privacy Note: Anyone with the link can view your resume.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-4 flex flex-col items-center justify-center bg-muted/30">
                <div className="text-center mb-4">
                  <h3 className="font-medium">Online Preview</h3>
                  <p className="text-sm text-muted-foreground">How others will see your shared resume</p>
                </div>
                <div className="w-full h-[300px] overflow-hidden flex items-center justify-center">
                  <div className="transform scale-[0.4] origin-center">
                    <ResumePreview template={style.theme} scale={0.8} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {exportFormat && (
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> 
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" /> 
                  Export as {exportFormat.toUpperCase()}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 