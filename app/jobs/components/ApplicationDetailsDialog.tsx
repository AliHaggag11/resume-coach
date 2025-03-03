import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, BriefcaseIcon, Calendar, PenLine, Trash2, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ApplicationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: any;
  onEdit: () => void;
  onAddInterview: () => void;
  onDelete: () => void;
}

const statusColors = {
  applied: 'bg-blue-500/10 text-blue-500',
  screening: 'bg-purple-500/10 text-purple-500',
  interview_scheduled: 'bg-yellow-500/10 text-yellow-500',
  interviewed: 'bg-orange-500/10 text-orange-500',
  offer_received: 'bg-green-500/10 text-green-500',
  offer_accepted: 'bg-emerald-500/10 text-emerald-500',
  offer_declined: 'bg-gray-500/10 text-gray-500',
  rejected: 'bg-red-500/10 text-red-500',
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-md border bg-muted/30 flex items-center justify-center shrink-0">
              {employerLogo ? (
                <img 
                  src={employerLogo}
                  alt={`${application.company_name} logo`}
                  className="h-14 w-14 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<svg class="h-8 w-8 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="16" x="8" y="4" rx="1"/><path d="M18 8h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-2"/><path d="M4 8h2a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1Z"/></svg>';
                  }}
                />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold">
                {application.company_name}
              </DialogTitle>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BriefcaseIcon className="h-4 w-4 shrink-0" />
                  <span>{application.job_title}</span>
                </div>
                {application.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{application.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Status and Dates */}
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="secondary" className={`${statusColors[application.status as keyof typeof statusColors]}`}>
              {application.status.replace('_', ' ')}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Applied {formatDate(application.created_at)}
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <h3 className="font-semibold">Job Description</h3>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap rounded-lg bg-muted/50 p-4">
              {jobDescription}
            </div>
          </div>

          {/* Notes */}
          {application.notes && (
            <div className="space-y-2">
              <h3 className="font-semibold">Notes</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap rounded-lg bg-muted/50 p-4">
                {application.notes}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Button onClick={onAddInterview} className="flex-1 sm:flex-none">
              <Calendar className="h-4 w-4 mr-2" />
              Add Interview
            </Button>
            <Button variant="outline" onClick={onEdit} className="flex-1 sm:flex-none">
              <PenLine className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              onClick={onDelete}
              className="flex-1 sm:flex-none text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            {applyLink && (
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none ml-auto"
                onClick={() => window.open(applyLink, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Original Post
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 