/*
 * File: src/components/auth/FormSkeleton.tsx
 * SR-DEV: Component-Level Loading Skeleton
 *
 * PURPOSE:
 * - Replaces ONLY the form inputs during load.
 * - Allows the main Page Layout (Branding + Title) to render instantly.
 */

import { cn } from "@/lib/utils";

interface FormSkeletonProps {
  className?: string;
}

export default function FormSkeleton({ className }: FormSkeletonProps) {
  return (
    <div className={cn("space-y-6 w-full animate-pulse", className)}>
      {/* Google Button Placeholder */}
      <div className="h-11 w-full bg-zinc-100 dark:bg-zinc-800 rounded-md" />

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800" />
        <div className="absolute bg-white dark:bg-zinc-950 px-2">
          <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-900 rounded" />
        </div>
      </div>

      {/* Inputs Group */}
      <div className="space-y-4">
        {/* Input 1 */}
        <div className="space-y-2">
          <div className="h-4 w-16 bg-zinc-100 dark:bg-zinc-800 rounded" />
          <div className="h-11 w-full bg-zinc-100 dark:bg-zinc-800 rounded-md" />
        </div>
        
        {/* Input 2 */}
        <div className="space-y-2">
          <div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
          <div className="h-11 w-full bg-zinc-100 dark:bg-zinc-800 rounded-md" />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <div className="h-11 w-full bg-zinc-200 dark:bg-zinc-700 rounded-md shadow-sm" />
      </div>
      
      {/* Footer Link Placeholder */}
      <div className="flex justify-center pt-2">
         <div className="h-4 w-48 bg-zinc-50 dark:bg-zinc-900 rounded" />
      </div>
    </div>
  );
}
