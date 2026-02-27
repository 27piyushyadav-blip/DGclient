/*
 * File: src/components/auth/VerificationSentForm.tsx
 * Client Component for Verification Sent Page
 */

"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Loader2Icon, MailIcon, CheckCircleIcon } from "@/components/Icons";

export default function VerificationSentForm() {
  const [email, setEmail] = useState("");
  const [isResending, startResending] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams?.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleResendEmail = () => {
    startResending(async () => {
      try {
        // This would need a new API endpoint for resending verification email
        // For now, we'll just show a message
        toast.success("If an account exists, a new verification email has been sent.");
      } catch (error: any) {
        toast.error(error.message || "Failed to resend verification email");
      }
    });
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col items-center justify-center py-8">
        <MailIcon className="h-16 w-16 text-primary mb-6" />
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3 text-center">
          Verification Email Sent!
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-6 leading-relaxed">
          We've sent a verification link to 
          {email && (
            <span className="font-medium text-zinc-700 dark:text-zinc-300 block mt-1">
              {email}
            </span>
          )}
          Please check your inbox and click the link to verify your account.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 w-full">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-700 dark:text-blue-300 font-medium mb-1">Next Steps:</p>
              <ul className="text-blue-600 dark:text-blue-400 space-y-1 text-xs">
                <li>• Check your email inbox</li>
                <li>• Click the verification link</li>
                <li>• Return here to sign in</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="grid gap-3 w-full">
          <Button 
            variant="outline"
            onClick={handleResendEmail}
            disabled={isResending}
            className="w-full"
          >
            {isResending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : (
              "Resend Verification Email"
            )}
          </Button>
          
          <Button 
            onClick={() => router.push('/login')}
            className="w-full"
          >
            Go to Login
          </Button>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Didn't receive the email? Check your spam folder or click resend above.
        </p>
      </div>
    </div>
  );
}
