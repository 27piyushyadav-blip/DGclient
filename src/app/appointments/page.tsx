/*
 * File: src/app/appointments/page.tsx
 * FIXED: Adapted for User + ExpertProfile architecture.
 * - Removes reference to deleted 'Expert' model.
 * - Maps 'expertProfileId' to the card's ID field so links work correctly.
 */

import { Suspense } from "react";
import { Loader2Icon } from "@/components/Icons";
import Link from "next/link";
import AppointmentsClientGate from "./AppointmentsClientGate";

export const dynamic = 'force-dynamic';

const LoadingSpinner = () => (
  <div className="flex flex-1 items-center justify-center py-32">
    <Loader2Icon className="h-10 w-10 animate-spin text-zinc-300" />
  </div>
);

export default function AppointmentsPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-zinc-50/50 dark:bg-zinc-950">
      
      <main className="container mx-auto max-w-5xl px-4 md:px-8 py-8 flex-1">
        
        {/* Breadcrumb / Header */}
        <div className="mb-8">
           <div className="text-xs font-medium text-zinc-500 mb-3 flex items-center gap-2">
              <Link href="/" className="hover:underline hover:text-zinc-800 dark:hover:text-zinc-200">Your Account</Link>
              <span className="text-zinc-300">/</span>
              <span className="text-primary">Your Appointments</span>
           </div>
           <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Your Appointments</h1>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <AppointmentsClientGate />
        </Suspense>
      </main>
    </div>
  );
}
