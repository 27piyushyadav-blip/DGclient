/*
 * File: src/app/sully/client/verify/page.tsx
 * Email Verification Redirect Page - Handles backend verification URLs
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon, CheckCircleIcon, AlertCircleIcon } from "@/components/Icons";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// 1. Extract the hook usage into a separate component
function VerifyContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("");
  
  const { verifyEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage("No verification token provided");
      return;
    }

    const handleVerification = async (verificationToken: string) => {
      try {
        await verifyEmail(verificationToken);
        setStatus('success');
        setMessage("Email verified successfully! Redirecting to login...");
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

    handleVerification(token);
  }, [token, router, verifyEmail]);

  if (status === 'loading') {
    return (
      <div className="text-center">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
          Verifying your email...
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Please wait while we verify your email address
        </p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center max-w-md mx-auto px-4">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Email Verified!
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          {message}
        </p>
        <button
          onClick={() => router.push('/login')}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md font-medium transition-colors"
        >
          Continue to Login
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center max-w-md mx-auto px-4">
        <AlertCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Verification Failed
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          {message}
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.push('/verify-email')}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md font-medium transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/login')}
            className="w-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 h-11 rounded-md font-medium transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// 2. Wrap the component consuming useSearchParams in a Suspense boundary
export default function VerifyRedirectPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
      <Suspense 
        fallback={
          <div className="text-center">
            <Loader2Icon className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
              Loading...
            </h2>
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  );
}
