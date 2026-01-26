/*
 * File: src/app/profile/page.tsx
 * SR-DEV: Settings Page Container (Redesigned)
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2Icon } from "@/components/Icons";
import ProfileClientGate from "./ProfileClientGate";

export const metadata: Metadata = {
  title: "Account Settings | Mind Namo",
  description: "Manage your profile details and security preferences.",
};

function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2Icon className="h-10 w-10 animate-spin text-zinc-300" />
      <p className="text-sm text-zinc-500 font-medium animate-pulse">Loading settings...</p>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Page Content */}
      <main className="container mx-auto max-w-6xl px-4 md:px-6 py-12">
         <Suspense fallback={<Loading />}>
            <ProfileClientGate />
         </Suspense>
      </main>
    </div>
  );
}
