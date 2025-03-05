import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, BriefcaseIcon, Calendar, PenLine, Trash2, ExternalLink, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ApplicationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: any;
  onEdit: () => void;
  onAddInterview: () => void;
  onDelete: () => void;
}

const statusColors = {
  applied: 'bg-blue-500/10 text-blue-500 border-blue-200',
  screening: 'bg-purple-500/10 text-purple-500 border-purple-200',
  interview_scheduled: 'bg-yellow-500/10 text-yellow-500 border-yellow-200',
  interviewed: 'bg-orange-500/10 text-orange-500 border-orange-200',
  offer_received: 'bg-green-500/10 text-green-500 border-green-200',
  offer_accepted: 'bg-emerald-500/10 text-emerald-500 border-emerald-200',
  offer_declined: 'bg-gray-500/10 text-gray-500 border-gray-200',
  rejected: 'bg-red-500/10 text-red-500 border-red-200',
};

export default function ApplicationDetailsDialog({
  open,
  onOpenChange,
  application,
  onEdit,
  onAddInterview,
  onDelete,
}: ApplicationDetailsDialogProps) {
  if (!application) return null;

  const employerLogo = application.job_description.includes('employer_logo:') 
    ? application.job_description.split('employer_logo:')[1]?.split('\n')[0]
    : null;

  const jobDescription = application.job_description.split('\n\njob_id:')[0];
  const applyLink = application.job_description.includes('job_apply_link:') 
    ? application.job_description.split('job_apply_link:')[1]?.split('\n')[0]
    : null;
    
  const createdDate = new Date(application.created_at);
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });
  const formattedDate = formatDate(application.created_at);
  
  // Check if the application is recent (within 3 days)
  const isRecent = (new Date().getTime() - createdDate.getTime()) < 3 * 24 * 60 * 60 * 1000;

  // Get status text with proper capitalization
  const statusText = application.status
    .split('_')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-t-lg">
          <div className="flex items-start gap-5">
            <div className="h-20 w-20 rounded-xl border bg-background shadow-sm flex items-center justify-center shrink-0">
              {employerLogo ? (
                <img 
                  src={employerLogo}
                  alt={`${application.company_name} logo`}
                  className="h-16 w-16 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<svg class="h-10 w-10 text-muted-foreground/60" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="16" x="8" y="4" rx="1"/><path d="M18 8h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-2"/><path d="M4 8h2a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1Z"/></svg>';
                  }}
                />
              ) : (
                <Building2 className="h-10 w-10 text-muted-foreground/60" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground leading-tight">
                {application.company_name}
              </DialogTitle>
              <h2 className="text-lg font-medium text-primary mt-1">
                {application.job_title}
              </h2>
              {application.location && (
                <div className="flex items-center gap-2 text-muted-foreground mt-3">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{application.location}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Status Badge - Prominently displayed */}
          <div className="mt-5">
            <Badge 
              variant="outline" 
              className={`text-sm py-1 px-3 rounded-md font-medium border ${statusColors[application.status as keyof typeof statusColors]}`}
            >
              {statusText}
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Application Timeline */}
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium text-muted-foreground">Application Timeline</div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <div className="flex flex-wrap items-center gap-1">
                <span className="font-medium">Applied on {formattedDate}</span>
                <span className="text-muted-foreground">({timeAgo})</span>
              </div>
            </div>
            {isRecent && (
              <div className="flex items-center gap-2 text-green-600 text-sm mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Recent application</span>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <BriefcaseIcon className="h-4 w-4 text-primary" />
              Job Description
            </h3>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap rounded-lg bg-muted/40 p-5 border border-muted/50">
              {jobDescription}
            </div>
          </div>

          {/* Notes */}
          {application.notes && (
            <div className="space-y-2">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <PenLine className="h-4 w-4 text-primary" />
                My Notes
              </h3>
              <div className="text-sm whitespace-pre-wrap rounded-lg bg-primary/5 p-5 border border-primary/10 text-foreground/90">
                {application.notes}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t mt-6">
            <Button 
              onClick={onAddInterview} 
              className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Add Interview
            </Button>
            <Button 
              variant="outline" 
              onClick={onEdit} 
              className="flex-1 sm:flex-none border-primary/20 text-primary hover:bg-primary/5"
            >
              <PenLine className="h-4 w-4 mr-2" />
              Edit Application
            </Button>
            <Button 
              variant="outline" 
              onClick={onDelete}
              className="flex-1 sm:flex-none border-destructive/30 text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            {applyLink && (
              <Button 
                variant="ghost" 
                className="flex-1 sm:flex-none ml-auto hover:bg-muted/50"
                onClick={() => window.open(applyLink, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Original Job
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 