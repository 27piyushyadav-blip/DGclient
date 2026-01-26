/*
 * File: src/app/(auth)/reset-password/page.tsx
 * SR-DEV: Premium Reset Password Page UI
 *
 * FEATURES:
 * - Password visibility toggle with micro-interactions.
 * - Split-screen layout for consistency.
 * - Success state with auto-redirect feedback.
 */

"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2Icon, EyeIcon, EyeOffIcon, MindNamoLogo, ArrowLeftIcon } from "@/components/Icons";
import FormSkeleton from "@/components/auth/FormSkeleton";
import { SVGProps } from "react";

type Status = "" | "success" | "error";

function ResetPasswordForm() {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const [status, setStatus] = useState<Status>("");
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
       setStatus("error");
       setMessage("Passwords do not match.");
       return;
    }

    startTransition(async () => {
       setStatus("error");
       setMessage("Password reset is currently unavailable.");
    });
  };

  if (!token) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center animate-in fade-in zoom-in">
           <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
           </div>
           <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Invalid Link</h3>
           <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 mb-6">This password reset link is missing or invalid.</p>
           <Link href="/forgot-password">
              <Button variant="outline">Request New Link</Button>
           </Link>
        </div>
      );
  }

  if (status === "success") {
     return (
        <div className="flex flex-col items-center justify-center h-64 text-center animate-in fade-in zoom-in">
           <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
             <CheckIcon className="h-8 w-8" />
           </div>
           <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Password Reset!</h3>
           <p className="text-zinc-500 dark:text-zinc-400 mt-2 mb-8">Your password has been successfully updated.</p>
           <Link href="/login">
             <Button className="w-full min-w-[200px]">Go to Login</Button>
           </Link>
        </div>
     );
  }

  return (
     <form onSubmit={handleSubmit} className="grid gap-6">
        {message && status === 'error' && (
           <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg font-medium text-center dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
             {message}
           </div>
        )}
        
        <div className="grid gap-2">
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Input 
              id="new-password" 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              required
              minLength={8}
              placeholder="Min 8 characters"
              className="pr-10 h-11 transition-all focus:ring-2 focus:ring-primary"
            />
             <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-11 w-11 text-zinc-400 hover:text-zinc-600" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
             </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input 
            id="confirm-password" 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isPending}
            required
            placeholder="Repeat password"
            className="h-11 transition-all focus:ring-2 focus:ring-primary"
          />
        </div>

        <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all mt-2" disabled={isPending}>
          {isPending ? <><Loader2Icon className="mr-2 h-5 w-5 animate-spin" /> Resetting...</> : "Reset Password"}
        </Button>
     </form>
  );
}

// Helper Icon for Success State
const CheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

export default function ResetPasswordPage() {
  return (
    <div className="w-full lg:grid lg:min-h-[100dvh] lg:grid-cols-2">
      
      {/* --- Left: Branding --- */}
      <div className="relative hidden h-full flex-col bg-zinc-900 p-10 text-white dark:border-r border-zinc-800 lg:flex">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1920&auto=format&fit=crop"
            alt="Mountain path symbolizing new beginnings"
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
              &ldquo;It does not matter how slowly you go as long as you do not stop.&rdquo;
            </p>
            <footer className="text-sm font-medium text-zinc-400 flex items-center gap-2">
               <span className="h-px w-8 bg-zinc-600"></span> Confucius
            </footer>
          </blockquote>
        </div>
      </div>

      {/* --- Right: Form --- */}
      <div className="flex min-h-[100dvh] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-950">
        <div className="lg:hidden mb-8">
           <Link href="/" className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
              <MindNamoLogo className="h-8 w-8 text-primary" />
              Mind Namo
           </Link>
        </div>

        <div className="mx-auto w-full max-w-[400px] gap-8">
          <div className="grid gap-2 text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Set New Password</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Create a strong password to secure your account.
            </p>
          </div>

          <Suspense fallback={<FormSkeleton />}>
             <ResetPasswordForm />
          </Suspense>

          <div className="text-center mt-8">
             <Link href="/login" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
               <ArrowLeftIcon className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Cancel & Back to Login
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
