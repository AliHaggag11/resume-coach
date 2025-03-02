import { ReactElement } from 'react';
import { Card } from '@/components/ui/card';
import CoverLetterForm from './components/CoverLetterForm';
import { Sparkles, CheckCircle2, Clock, FileText } from 'lucide-react';

export default function CoverLetterPage(): ReactElement {
  return (
    <div className="container mx-auto py-4 md:py-8 px-4 space-y-6 md:space-y-8">
      <div className="max-w-3xl mx-auto text-center space-y-3 md:space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          AI Cover Letter Builder
        </h1>
        <p className="text-base md:text-lg text-muted-foreground">
          Create a professional, tailored cover letter in seconds using AI. Our tool analyzes job descriptions
          and your experience to generate compelling cover letters that stand out.
        </p>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 py-4 md:py-8">
        <div className="flex items-start gap-3 p-3 md:p-4">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Save Time</h3>
            <p className="text-sm text-muted-foreground">Generate a professional cover letter in seconds, not hours</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 md:p-4">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Tailored Content</h3>
            <p className="text-sm text-muted-foreground">AI-powered customization for each job application</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 md:p-4">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Professional Quality</h3>
            <p className="text-sm text-muted-foreground">Polished and engaging letters that get noticed</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
        <Card className="p-4 md:p-6 lg:col-span-2 border-primary/10 shadow-md order-2 lg:order-1">
          <CoverLetterForm />
        </Card>

        <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
          <Card className="p-4 md:p-6 bg-primary/5 border-primary/10 shadow-md">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 md:mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              Tips for Success
            </h3>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex items-start gap-2">
                <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-xs text-primary font-medium">1</span>
                </div>
                <span className="text-sm text-muted-foreground">Paste the complete job description for better results</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-xs text-primary font-medium">2</span>
                </div>
                <span className="text-sm text-muted-foreground">Include specific achievements and metrics in your experience</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-xs text-primary font-medium">3</span>
                </div>
                <span className="text-sm text-muted-foreground">Add the hiring manager's name for a personal touch</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-xs text-primary font-medium">4</span>
                </div>
                <span className="text-sm text-muted-foreground">Choose a tone that matches the company culture</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-xs text-primary font-medium">5</span>
                </div>
                <span className="text-sm text-muted-foreground">Review and customize the generated letter as needed</span>
              </li>
            </ul>
          </Card>

          <Card className="p-4 md:p-6 bg-muted/50 border-muted shadow-md">
            <h3 className="text-sm font-medium mb-2">Example Job Description</h3>
            <p className="text-xs text-muted-foreground">
              "We are seeking a talented [Job Title] to join our team. The ideal candidate will have experience in [Key Skills] and a proven track record of [Achievements]. Responsibilities include [Main Tasks]. Required qualifications: [Requirements]."
            </p>
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Example Experience</h3>
              <p className="text-xs text-muted-foreground">
                "Led a team of 5 developers, delivering 3 major projects ahead of schedule. Improved system performance by 40% through optimization. Implemented new testing protocols reducing bugs by 60%."
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 