"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PrivacyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyDialog({ isOpen, onClose }: PrivacyDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Privacy Policy</DialogTitle>
          <DialogDescription className="text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-4 text-sm">
          <h3 className="text-lg font-semibold">1. Information We Collect</h3>
          <p>
            We collect information you provide directly to us, including personal information such as your name, email address, and resume content. We also collect usage data and analytics to improve our services.
          </p>

          <h3 className="text-lg font-semibold">2. How We Use Your Information</h3>
          <p>
            We use the information we collect to provide and improve our services, communicate with you, and personalize your experience. We do not sell your personal information to third parties.
          </p>

          <h3 className="text-lg font-semibold">3. Data Storage and Security</h3>
          <p>
            We implement appropriate security measures to protect your personal information. Your data is stored securely and encrypted using industry-standard protocols.
          </p>

          <h3 className="text-lg font-semibold">4. Cookies and Tracking</h3>
          <p>
            We use cookies and similar tracking technologies to enhance your experience and collect usage data. You can control cookie settings through your browser preferences.
          </p>

          <h3 className="text-lg font-semibold">5. Third-Party Services</h3>
          <p>
            We may use third-party services to help us operate our service. These services have access to your information only to perform specific tasks on our behalf.
          </p>

          <h3 className="text-lg font-semibold">6. Your Rights</h3>
          <p>
            You have the right to access, correct, or delete your personal information. You can also request a copy of your data or opt out of certain data collection practices.
          </p>

          <h3 className="text-lg font-semibold">7. Children's Privacy</h3>
          <p>
            Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
          </p>

          <h3 className="text-lg font-semibold">8. Changes to Privacy Policy</h3>
          <p>
            We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page.
          </p>

          <h3 className="text-lg font-semibold">9. Contact Us</h3>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@resumecoach.com.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 