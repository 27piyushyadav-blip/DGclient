/*
 * File: src/components/modals/ReportModal.js
 * SR-DEV: Modular component for reporting an expert profile.
 */

"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const REASONS = [
  "Inappropriate content/behavior",
  "Fake/Misleading profile",
  "Spam or solicitation attempt",
  "Safety concern / Danger",
  "Other",
];

export default function ReportModal({ 
  isOpen, 
  onClose, 
  expertId, 
  expertName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  expertId: string; 
  expertName: string; 
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isPending, startTransition] = useTransition();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = ''; 
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Validation Error", { description: "Please select a reason for the report." });
      return;
    }
    
    const finalReason = reason === "Other" ? (details.trim() || "Other (No details provided)") : reason;

    startTransition(async () => {
      // --- TODO: Implement Server Action to handle report submission ---
      // In a real application, this would call a server action:
      // const result = await submitReportAction({ expertId, userId, reason: finalReason, details });
      
      await new Promise(r => setTimeout(r, 1500)); // Simulate API delay
      
      // Simulate success response
      const success = true; 

      if (success) {
        toast.success("Report Submitted", {
          description: `Thank you. We will review ${expertName}'s profile shortly.`,
        });
        onClose();
      } else {
        toast.error("Submission Failed", {
          description: "An error occurred. Please try again later.",
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" /> Report Profile
          </DialogTitle>
          <DialogDescription>
            Why are you reporting **{expertName}**? This helps us keep our community safe.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <RadioGroup value={reason} onValueChange={setReason}>
            {REASONS.map(r => (
              <div className="flex items-center space-x-2" key={r}>
                <RadioGroupItem value={r} id={r} disabled={isPending} />
                <Label htmlFor={r} className="cursor-pointer">{r}</Label>
              </div>
            ))}
          </RadioGroup>
          {reason === "Other" && (
             <Textarea 
                placeholder="Please provide more details (required for 'Other')..." 
                value={details} 
                onChange={(e) => setDetails(e.target.value)} 
                className="resize-none" 
                disabled={isPending}
             />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isPending || !reason || (reason === 'Other' && !details.trim())}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}