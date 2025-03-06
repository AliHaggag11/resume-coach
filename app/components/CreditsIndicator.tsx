"use client";

import { useState } from "react";
import { useSubscription } from "@/app/context/SubscriptionContext";
import { Coins, Plus, Sparkles, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CreditsIndicatorProps {
  collapsed?: boolean;
}

// Credit package options
const CREDIT_PACKAGES = [
  { amount: 50, price: 5, tag: "" },
  { amount: 125, price: 10, tag: "Popular", discount: "Save 20%" },
  { amount: 300, price: 20, tag: "Best Value", discount: "Save 33%" }
];

export default function CreditsIndicator({ collapsed = false }: CreditsIndicatorProps) {
  const { credits, isLoading, purchaseCredits } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async () => {
    if (selectedPackage === null) return;
    
    const packageAmount = CREDIT_PACKAGES[selectedPackage].amount;
    setIsPurchasing(true);
    
    try {
      const result = await purchaseCredits(packageAmount);
      if (result.success) {
        setIsOpen(false);
        toast.success(`Successfully added ${packageAmount} credits to your account!`);
      } else {
        toast.error(`Purchase failed: ${result.error}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred during purchase");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
          "bg-muted/50 hover:bg-muted text-foreground group",
          collapsed ? "justify-center" : ""
        )}
      >
        <div className="flex items-center gap-1.5">
          <Coins className={cn(
            "h-5 w-5 text-primary transition-transform",
            collapsed ? "group-hover:scale-110" : ""
          )} />
          {!collapsed && (
            <span className="truncate font-semibold">
              {isLoading ? "Loading..." : `${credits} Credits`}
            </span>
          )}
        </div>
        {!collapsed && (
          <span className="ml-auto rounded-full bg-primary/10 text-primary p-1">
            <Plus className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Purchase Credits
            </DialogTitle>
            <DialogDescription>
              Credits are used for AI-powered features like resume generation, mock interviews, and more.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Current Balance:</span>
              <span className="font-semibold text-lg flex items-center gap-1">
                <Coins className="h-4 w-4 text-primary" />
                {credits} Credits
              </span>
            </div>
            
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-medium">Select a Package:</h4>
              {CREDIT_PACKAGES.map((pkg, index) => (
                <div 
                  key={index}
                  className={cn(
                    "relative border rounded-lg p-4 cursor-pointer transition-all",
                    selectedPackage === index 
                      ? "border-primary bg-primary/5 ring-1 ring-primary" 
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedPackage(index)}
                >
                  {pkg.tag && (
                    <span className="absolute right-3 top-0 -translate-y-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {pkg.tag}
                    </span>
                  )}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-lg p-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{pkg.amount} Credits</div>
                        {pkg.discount && (
                          <div className="text-xs text-primary font-medium">{pkg.discount}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-lg font-bold">${pkg.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPurchasing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase} 
              disabled={selectedPackage === null || isPurchasing}
              className="gap-2"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Purchase
                  <Plus className="h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 