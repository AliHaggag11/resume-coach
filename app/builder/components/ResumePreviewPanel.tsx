"use client";

import { useState, useEffect } from "react";
import { useResume } from "@/app/context/ResumeContext";
import { useResumeStyle } from "@/app/context/ResumeStyleContext";
import ResumePreview from "./ResumePreview";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize, Minimize, Download, Share2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumePreviewPanelProps {
  onExport?: () => void;
  onShare?: () => void;
  className?: string;
}

// Custom slider component since we may not have access to the Slider component
const CustomSlider: React.FC<{
  value: number[];
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number[]) => void;
  className?: string;
}> = ({ value, min, max, step, onValueChange, className }) => {
  return (
    <div className={`relative w-full h-5 ${className}`}>
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

export default function ResumePreviewPanel({
  onExport,
  onShare,
  className
}: ResumePreviewPanelProps) {
  const { resumeData } = useResume();
  const { style } = useResumeStyle();
  const [scale, setScale] = useState(0.7);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetails, setShowDetails] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Calculate total pages based on content
  useEffect(() => {
    // This would be a real implementation that calculates pages based on content
    const calculatePages = () => {
      // Simple estimation for demo purposes
      const contentSize = JSON.stringify(resumeData).length;
      const estimatedPages = Math.ceil(contentSize / 5000);
      return Math.max(1, Math.min(estimatedPages, 3)); // Cap at 3 pages for demo
    };
    
    setTotalPages(calculatePages());
  }, [resumeData]);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
    
    // When entering fullscreen, scroll to top to ensure visibility
    if (!fullscreen) {
      window.scrollTo(0, 0);
    }
  };

  // Add a keyboard event listener to exit fullscreen with Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && fullscreen) {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullscreen]);

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 1.5));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.3));
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Create a custom zoom control since Slider component may not be available
  const renderZoomControl = () => {
    return (
      <div className="flex items-center space-x-1 sm:space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={zoomOut}
          disabled={scale <= 0.3}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
        >
          <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <CustomSlider
          value={[scale * 100]}
          min={30}
          max={150}
          step={10}
          className="w-[60px] sm:w-[120px]"
          onValueChange={(value: number[]) => setScale(value[0] / 100)}
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={zoomIn}
          disabled={scale >= 1.5}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
        >
          <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <span className="text-[10px] sm:text-xs font-medium">{Math.round(scale * 100)}%</span>
      </div>
    );
  };

  return (
    <div 
      className={cn(
        "flex flex-col h-full transition-all",
        fullscreen ? "fixed left-0 right-0 top-0 bottom-0 z-[100] bg-background" : "",
        className
      )}
      style={fullscreen ? {
        padding: isMobile ? '48px 8px 64px 8px' : '72px 24px 24px 72px',
      } : {}}
    >
      {/* Fullscreen UI */}
      {fullscreen && (
        <>
          {/* Mobile-optimized header bar with exit button */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-background flex items-center justify-between px-3 z-[102] border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            
            <span className="text-xs sm:text-sm font-medium">Resume Preview</span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8"
            >
              <Minimize className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Bottom controls wrapper for mobile */}
          <div className="absolute bottom-0 left-0 right-0 bg-background border-t px-2 py-3 z-[102] sm:hidden">
            <div className="flex justify-between items-center">
              <div className="text-xs font-medium flex items-center">
                <ZoomOut className="h-3 w-3 mr-1 text-muted-foreground" onClick={zoomOut} />
                <span>{Math.round(scale * 100)}%</span>
                <ZoomIn className="h-3 w-3 ml-1 text-muted-foreground" onClick={zoomIn} />
              </div>
              <div className="text-xs">
                <kbd className="px-1 py-0.5 bg-muted border rounded text-muted-foreground">ESC</kbd>
                <span className="ml-1">to exit</span>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Normal preview controls - hide in fullscreen mobile */}
      {(!fullscreen || !isMobile) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-4 gap-2 sm:gap-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm sm:text-base font-medium">Preview</h3>
            {totalPages > 1 && (
              <span className="text-xs sm:text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowDetails(!showDetails)}
              title={showDetails ? "Hide details" : "Show details"}
              className="h-7 w-7 sm:h-9 sm:w-9"
            >
              {showDetails ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
            {!fullscreen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                title="Fullscreen"
                className="h-7 w-7 sm:h-9 sm:w-9"
              >
                <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
            {onExport && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onExport} 
                title="Export"
                className="h-7 w-7 sm:h-9 sm:w-9"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
            {onShare && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onShare} 
                title="Share"
                className="h-7 w-7 sm:h-9 sm:w-9"
              >
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="relative flex-1 overflow-hidden bg-muted/30 rounded-lg flex items-center justify-center">
        <div 
          className={cn(
            "transition-transform duration-200 shadow-xl",
            fullscreen ? "transform-gpu" : ""
          )}
          style={{ 
            transform: `scale(${scale})`,
            transition: "transform 0.2s ease"
          }}
        >
          <ResumePreview 
            template={style.theme} 
            scale={1} 
          />
        </div>

        {/* Page navigation */}
        {totalPages > 1 && (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 bg-background/80 hover:bg-background shadow-sm"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 bg-background/80 hover:bg-background shadow-sm"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Show details panel only when not in fullscreen mobile mode */}
      {showDetails && (!fullscreen || !isMobile) && (
        <Card className="mt-2 sm:mt-4 p-2 sm:p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-2">
            {renderZoomControl()}
            <div className="text-[10px] sm:text-xs text-muted-foreground">
              Template: <span className="font-medium capitalize">{style.theme}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1 sm:gap-2 text-[10px] sm:text-xs">
            <div>
              <span className="text-muted-foreground">Font:</span> <span className="font-medium">{style.font} ({style.fontSize})</span>
            </div>
            <div>
              <span className="text-muted-foreground">Spacing:</span> <span className="font-medium">{style.spacing}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
} 