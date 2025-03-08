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
      setIsMobile(window.innerWidth < 768); // Changed from 640px to 768px for more consistent mobile experience
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Adjust scale automatically based on screen size
  useEffect(() => {
    if (isMobile && !fullscreen) {
      setScale(0.55); // Smaller scale on mobile by default
    } else if (isMobile && fullscreen) {
      setScale(0.75); // Better fullscreen view on mobile
    } else {
      setScale(0.7); // Default for desktop
    }
  }, [isMobile, fullscreen]);

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
    
    // When entering fullscreen, scroll to top to ensure visibility
    if (!fullscreen) {
      window.scrollTo(0, 0);
      // Lock body scroll when in fullscreen on mobile
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      // Restore scroll when exiting fullscreen
      if (isMobile) {
        document.body.style.overflow = '';
      }
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
    setScale(prev => Math.min(prev + (isMobile ? 0.1 : 0.1), isMobile ? 1.2 : 1.5));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - (isMobile ? 0.1 : 0.1), isMobile ? 0.4 : 0.3));
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
          disabled={scale <= (isMobile ? 0.4 : 0.3)}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
        >
          <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <CustomSlider
          value={[scale * 100]}
          min={isMobile ? 40 : 30}
          max={isMobile ? 120 : 150}
          step={10}
          className="w-[60px] sm:w-[100px] md:w-[120px]"
          onValueChange={(value: number[]) => setScale(value[0] / 100)}
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={zoomIn}
          disabled={scale >= (isMobile ? 1.2 : 1.5)}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
        >
          <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <span className="text-[10px] sm:text-xs font-medium w-9 text-center">{Math.round(scale * 100)}%</span>
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
              className="h-8 flex items-center touch-manipulation"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            
            <span className="text-xs sm:text-sm font-medium">Resume Preview</span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 touch-manipulation"
            >
              <Minimize className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Bottom controls wrapper for mobile */}
          <div className="absolute bottom-0 left-0 right-0 bg-background border-t px-2 py-3 z-[102] flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 p-2 touch-manipulation"
                onClick={zoomOut}
                disabled={scale <= (isMobile ? 0.4 : 0.3)}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium">{Math.round(scale * 100)}%</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 p-2 touch-manipulation"
                onClick={zoomIn}
                disabled={scale >= (isMobile ? 1.2 : 1.5)}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 touch-manipulation"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs">
                  {currentPage}/{totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 touch-manipulation"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {onExport && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExport}
                className="h-8 p-2 touch-manipulation"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
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
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-1 sm:gap-2">
            {/* Show zoom control based on screen size */}
            <div className="sm:block flex-1 max-w-[180px]">
              {renderZoomControl()}
            </div>
            
            <div className="flex items-center">
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
                  title="Fullscreen preview"
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
                  title="Export resume"
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
                  title="Share resume"
                  className="h-7 w-7 sm:h-9 sm:w-9"
                >
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Page navigation for multi-page resumes - desktop/tablet only */}
      {totalPages > 1 && !isMobile && !fullscreen && (
        <div className="hidden sm:flex items-center justify-center gap-1 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={prevPage}
            disabled={currentPage === 1}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-xs">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      {/* Resume Preview */}
      <div 
        className={cn(
          "flex-1 overflow-auto bg-muted rounded-lg flex items-start justify-center p-2 sm:p-4",
          fullscreen && "absolute inset-0 z-[101]",
          fullscreen && isMobile && "pt-14 pb-14"
        )}
      >
        <div 
          className="transition-all bg-white shadow-md mx-auto my-2"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            width: '210mm', // A4 width
            height: 'auto', // Let the height adjust based on content
            maxHeight: fullscreen ? (isMobile ? 'calc(100vh - 100px)' : 'calc(100vh - 140px)') : 'none'
          }}
        >
          <ResumePreview 
            template={style.theme}
            scale={1}
            key={`resume-${currentPage}-${showDetails ? 'details' : 'no-details'}`}
          />
        </div>
      </div>
    </div>
  );
}