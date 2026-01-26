/*
 * File: src/components/CancelAppointmentModal.js
 * SR-DEV: Cancellation Modal (Shadcn Radio Buttons)
 */

"use client";

import { useState, useTransition } from "react";
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
import { Loader2 } from "lucide-react";

const REASONS = [
  "Schedule conflict",
  "Found another expert",
  "Prefer a different time",
  "Financial reasons",
  "Other",
];

export default function CancelAppointmentModal({ 
  appointment, 
  onClose, 
  onConfirm 
}) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!selectedReason) {
      setError("Please select a reason.");
      return;
    }
    const finalReason = selectedReason === "Other" ? customReason : selectedReason;
    if (selectedReason === "Other" && !customReason.trim()) {
       setError("Please tell us more about why you're cancelling.");
       return;
    }
    
    setError("");
    startTransition(async () => {
      const res = await onConfirm(finalReason);
      if (!res?.success) setError(res?.message || "Failed to cancel.");
    });
  };

  return (
    <Dialog open={!!appointment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Cancel Appointment</DialogTitle>
          <DialogDescription>
            We're sorry to see you cancel. Please let us know why.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
           <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {REASONS.map((reason) => (
                <div className="flex items-center space-x-2" key={reason}>
                  <RadioGroupItem value={reason} id={reason} />
                  <Label htmlFor={reason} className="cursor-pointer">{reason}</Label>
                </div>
              ))}
           </RadioGroup>

           {selectedReason === "Other" && (
             <Textarea
               placeholder="Please specify..."
               value={customReason}
               onChange={(e) => setCustomReason(e.target.value)}
               className="resize-none"
             />
           )}

           {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Keep Appointment
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm Cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}