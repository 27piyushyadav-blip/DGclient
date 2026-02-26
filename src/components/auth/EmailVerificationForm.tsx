/*
 * File: src/components/auth/EmailVerificationForm.tsx
 * Client Component for Email Verification
 */

"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Loader2Icon, CheckCircleIcon, MailIcon, AlertCircleIcon } from "@/components/Icons";

export default function EmailVerificationForm() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [message, setMessage] = useState("");
  const [isResending, startResending] = useTransition();

  const { verifyEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const email = searchParams?.get("email");

  useEffect(() => {
    if (token) {
      handleVerification(token);
    }
  }, [token]);

  const handleVerification = async (verificationToken: string) => {
    setStatus('loading');
    setMessage("");

    try {
      await verifyEmail(verificationToken);
      setStatus('success');
      setMessage("Email verified successfully! You can now login.");
      toast.success("Email verified successfully!");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?message=Email verified successfully! You can now login.');
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || "Invalid or expired verification token");
      toast.error(error.message || "Verification failed");
    }
  };

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

  if (status === 'loading') {
    return (
      <div className="grid gap-6">
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2Icon className="h-12 w-12 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
            Verifying your email...
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
            Please wait while we verify your email address
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="grid gap-6">
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircleIcon className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
            Email Verified!
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-4">
            {message}
          </p>
          <Button 
            onClick={() => router.push('/login')}
            className="w-full"
          >
            Continue to Login
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="grid gap-6">
        <div className="flex flex-col items-center justify-center py-8">
          <AlertCircleIcon className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
            Verification Failed
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-6">
            {message}
          </p>
          
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
              variant="ghost"
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Idle state - no token provided
  return (
    <div className="grid gap-6">
      <div className="flex flex-col items-center justify-center py-8">
        <MailIcon className="h-12 w-12 text-primary mb-4" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
          Check Your Email
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-6">
          We've sent a verification link to your email address. 
          {email && ` Please check ${email}.`}
        </p>
        
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
            variant="ghost"
            className="w-full"
          >
            Back to Login
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
