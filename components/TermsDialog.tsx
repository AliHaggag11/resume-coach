"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TermsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsDialog({ isOpen, onClose }: TermsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Terms of Service</DialogTitle>
          <DialogDescription className="text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-4 text-sm">
          <h3 className="text-lg font-semibold">1. Acceptance of Terms</h3>
          <p>
            By accessing and using ResumeCoach, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
          </p>

          <h3 className="text-lg font-semibold">2. Use of Service</h3>
          <p>
            ResumeCoach provides resume building and career development tools. You agree to use these services only for lawful purposes and in accordance with these terms.
          </p>

          <h3 className="text-lg font-semibold">3. User Accounts</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
          </p>

          <h3 className="text-lg font-semibold">4. Privacy</h3>
          <p>
            Your use of ResumeCoach is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
          </p>

          <h3 className="text-lg font-semibold">5. Content</h3>
          <p>
            You retain all rights to the content you create using our service. However, you grant us a license to use, store, and copy your content to provide you with our services.
          </p>

          <h3 className="text-lg font-semibold">6. Changes to Terms</h3>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any material changes to these terms.
          </p>

          <h3 className="text-lg font-semibold">7. Termination</h3>
          <p>
            We reserve the right to terminate or suspend access to our services immediately, without prior notice, for any violation of these terms.
          </p>

          <h3 className="text-lg font-semibold">8. Disclaimer</h3>
          <p>
            ResumeCoach is provided "as is" without any warranties, expressed or implied. We do not guarantee that our services will be error-free or uninterrupted.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 