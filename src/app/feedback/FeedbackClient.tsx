/*
 * File: src/app/feedback/FeedbackClient.js
 * SR-DEV: Client component for the Feedback Submission Form.
 * Features: Structured feedback types, text area, and submission status.
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, CheckCircle2, MessageCircle } from "lucide-react";

// --- Mock Action (To be replaced by server action) ---
const submitFeedbackAction = async (formData: FormData) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate server success
    return { success: true, message: "Thank you for your valuable feedback!" };
};

// --- Validation Schema ---
const feedbackSchema = z.object({
  category: z.string().min(1, "Please select a category."),
  rating: z.string().optional(),
  details: z.string().min(20, "Please provide at least 20 characters of detail."),
});

const CATEGORIES = [
    { value: "bug_report", label: "Bug Report / Technical Issue" },
    { value: "feature_request", label: "Feature Request / Suggestion" },
    { value: "general_experience", label: "General Experience" },
    { value: "expert_issue", label: "Expert / Safety Concern" },
];

export default function FeedbackClient({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitSuccessful },
  } = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: "",
      rating: "5",
      details: "",
    },
  });
  
  const selectedCategory = watch("category");
  
  const onSubmit = (data: z.infer<typeof feedbackSchema>) => {
    startTransition(async () => {
      // 1. Prepare data for server action
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("userName", userName);
      formData.append("category", data.category);
      formData.append("rating", data.rating || "5");
      formData.append("details", data.details);

      // 2. Submit (using mock for now)
      const result = await submitFeedbackAction(formData);

      if (result.success) {
        toast.success("Feedback Received", {
          description: result.message,
        });
        // Redirect to a success state or home after a short delay
        setTimeout(() => router.push("/"), 2000); 
      } else {
        toast.error("Submission Failed", {
          description: result.message,
        });
      }
    });
  };

  if (isSubmitSuccessful) {
    return (
        <div className="text-center p-12 space-y-4 animate-in fade-in zoom-in duration-500">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Thank You!</h2>
            <p className="text-zinc-500">We've securely received your feedback and appreciate you helping us improve.</p>
            <Button onClick={() => router.push("/")} className="mt-6">Back to Home</Button>
        </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
      
      {/* User Info Display */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-sm text-zinc-600 dark:text-zinc-300">
        Submitting as: <span className="font-semibold">{userName}</span>
      </div>

      {/* 1. Category Select */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-zinc-700 dark:text-zinc-300">Type of Feedback</Label>
        <Select onValueChange={(v) => setValue("category", v, { shouldDirty: true })} value={selectedCategory}>
          <SelectTrigger id="category" className={cn("h-11", errors.category && "border-red-500")}>
            <SelectValue placeholder="Select one category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
      </div>
      
      {/* 2. Details Text Area */}
      <div className="space-y-2">
        <Label htmlFor="details" className="text-zinc-700 dark:text-zinc-300">Details</Label>
        <Textarea 
          id="details"
          placeholder="Describe your experience or suggestion in detail..."
          {...register("details")}
          rows={6}
          className={cn("resize-none", errors.details && "border-red-500")}
        />
        {errors.details && <p className="text-xs text-red-500">{errors.details.message}</p>}
      </div>

      {/* 3. Rating/Impact (Optional but helpful) */}
      <div className="space-y-2">
        <Label htmlFor="rating" className="text-zinc-700 dark:text-zinc-300">Overall Satisfaction (Optional)</Label>
        <Select onValueChange={(v) => setValue("rating", v, { shouldDirty: true })} defaultValue="5">
          <SelectTrigger id="rating" className="h-11">
            <SelectValue placeholder="How was your experience?" />
          </SelectTrigger>
          <SelectContent>
            {[5, 4, 3, 2, 1].map(r => (
              <SelectItem key={r} value={String(r)}>{r} - {r >= 4 ? "Great" : r >= 2 ? "Average" : "Poor"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 4. Submission Button */}
      <div className="pt-4">
        <Button 
          type="submit" 
          disabled={isPending || !isDirty}
          className="w-full h-12 text-base font-semibold shadow-md bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending Feedback...</>
          ) : (
            <><Send className="w-4 h-4 mr-2" /> Submit Feedback</>
          )}
        </Button>
      </div>
      
    </form>
  );
}