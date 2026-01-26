/*
 * File: src/app/(auth)/forgot-password/page.tsx
 * SR-DEV: Forgot Password Page
 * Features:
 * - Split layout consistent with Login/Register.
 * - Client-side form logic (self-contained).
 * - Suspense boundary for URL parameters.
 */

"use client";

import { useState, useTransition, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2Icon, ArrowLeftIcon, MindNamoLogo } from "@/components/Icons";
import { cn } from "@/lib/utils";
import FormSkeleton from "@/components/auth/FormSkeleton";

type Status = "idle" | "success" | "error";

// --- Inner Form Component ---
function ForgotPasswordForm() {
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  
  const searchParams = useSearchParams();

  // Prefill email if available in URL (e.g. from failed login)
  useEffect(() => {
    const emailParam = searchParams?.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("idle");
    setMessage("");

    startTransition(async () => {
      setStatus("error");
      setMessage("Password reset is currently unavailable.");
    });
  };

  if (status === "success") {
    return (
      <div className="text-center animate-in fade-in zoom-in duration-300 space-y-6">
        <div className="p-4 bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-300 rounded-lg text-sm font-medium">
          {message}
        </div>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Check your inbox and click the link to reset your password. The link expires in 1 hour.
        </p>
        <Button 
          variant="outline" 
          onClick={() => setStatus("idle")}
          className="w-full"
        >
          Send another link
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 animate-in fade-in duration-500">
      {status === "error" && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg font-medium text-center dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
          {message}
        </div>
      )}
      
      <div className="grid gap-2">
        <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">Email Address</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="name@example.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          required
          className="h-11 transition-all focus:ring-2 focus:ring-primary focus:ring-offset-1"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all" 
        disabled={isPending || !email}
      >
        {isPending ? (
          <><Loader2Icon className="mr-2 h-5 w-5 animate-spin" /> Sending Link...</>
        ) : (
          "Send Reset Link"
        )}
      </Button>
    </form>
  );
}

// --- Main Page Component ---
export default function ForgotPasswordPage() {
  return (
    <div className="w-full lg:grid lg:min-h-[100dvh] lg:grid-cols-2">
      
      {/* Left: Branding */}
      <div className="relative hidden h-full flex-col bg-zinc-900 p-10 text-white dark:border-r border-zinc-800 lg:flex">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=1920&auto=format&fit=crop"
            alt="Calm morning landscape"
            className="h-full w-full object-cover opacity-50 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-zinc-900/50 to-transparent" />
        </div>
        <div className="relative z-20">
           <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight transition-opacity hover:opacity-90 w-fit">
             <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                <MindNamoLogo className="h-6 w-6" />
             </div>
             Mind Namo
           </Link>
        </div>
        <div className="relative z-20 mt-auto max-w-md">
          <blockquote className="space-y-4">
            <p className="text-2xl font-light italic leading-relaxed text-zinc-100">
              &ldquo;Hope is being able to see that there is light despite all of the darkness.&rdquo;
            </p>
            <footer className="text-sm font-medium text-zinc-400 flex items-center gap-2">
               <span className="h-px w-8 bg-zinc-600"></span> Desmond Tutu
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex min-h-[100dvh] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-950">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8">
           <Link href="/" className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
              <MindNamoLogo className="h-8 w-8 text-primary" />
              Mind Namo
           </Link>
        </div>

        <div className="mx-auto w-full max-w-[400px] space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Forgot Password?</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
              Don&apos;t worry, it happens to the best of us. Enter your email below to reset it.
            </p>
          </div>

          {/* Suspense needed for useSearchParams */}
          <Suspense fallback={<FormSkeleton />}>
             <ForgotPasswordForm />
          </Suspense>

          <div className="text-center">
             <Link href="/login" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors group">
               <ArrowLeftIcon className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Login
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
