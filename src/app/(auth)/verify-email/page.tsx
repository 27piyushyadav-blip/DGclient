/*
 * File: src/app/(auth)/verify-email/page.tsx
 * Email Verification Page
 */

import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import EmailVerificationForm from "../../../components/auth/EmailVerificationForm";
import { MindNamoLogo } from "@/components/Icons";
import FormSkeleton from "@/components/auth/FormSkeleton";

export const metadata: Metadata = {
  title: "Verify Email | Mind Namo",
  description: "Verify your email address to complete your registration.",
};

export default function VerifyEmailPage() {
  return (
    <div className="w-full lg:grid lg:min-h-[100dvh] lg:grid-cols-2">
      
      {/* --- Left: Branding (Hidden on Mobile) --- */}
      <div className="relative hidden h-full flex-col bg-zinc-900 p-10 text-white dark:border-r border-zinc-800 lg:flex">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1920&auto=format&fit=crop"
            alt="Technology and innovation"
            className="h-full w-full object-cover opacity-50 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-zinc-900/50 to-transparent" />
        </div>
        
        {/* Logo Link to Home */}
        <div className="relative z-20">
           <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight transition-opacity hover:opacity-90 w-fit">
             <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                <MindNamoLogo className="h-6 w-6" />
             </div>
             Mind Namo
           </Link>
        </div>
        
        {/* Bottom Quote */}
        <div className="relative z-20 mt-auto max-w-md">
          <blockquote className="space-y-4">
            <p className="text-2xl font-light italic leading-relaxed text-zinc-100">
              &ldquo;Verification complete! You&apos;re one step closer to connecting with experts who can help you grow.&rdquo;
            </p>
            <footer className="text-sm font-medium text-zinc-400 flex items-center gap-2">
               <span className="h-px w-8 bg-zinc-600"></span> The Mind Namo Team
            </footer>
          </blockquote>
        </div>
      </div>

      {/* --- Right: Form --- */}
      <div className="flex min-h-[100dvh] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-950">
        
        {/* Mobile Logo (Visible only on small screens) */}
        <div className="lg:hidden mb-8">
           <Link href="/" className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
              <MindNamoLogo className="h-8 w-8 text-primary" />
              Mind Namo
           </Link>
        </div>

        <div className="mx-auto grid w-full max-w-[400px] gap-8">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Verify Your Email</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Click the verification link we sent to your email address
            </p>
          </div>

          {/* The Form Component (Wrapped in Suspense for searchParams access) */}
          <Suspense fallback={<FormSkeleton />}>
            <EmailVerificationForm />
          </Suspense>

          <div className="text-center text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Already verified? </span>
            <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
