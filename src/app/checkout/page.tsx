/*
 * File: src/app/checkout/page.tsx
 * SR-DEV: Checkout Page Shell
 * Wraps the interactive checkout form in a Suspense boundary to handle URL search params safely.
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";
import { Loader2Icon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Secure Checkout | Mind Namo",
  description: "Complete your booking securely.",
};

// --- Loading Fallback ---
function CheckoutLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2Icon className="h-10 w-10 animate-spin text-zinc-300" />
      <p className="text-sm text-zinc-500 font-medium">Preparing secure checkout...</p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <main className="flex-1">
        <Suspense fallback={<CheckoutLoading />}>
          <CheckoutClient />
        </Suspense>
      </main>
    </div>
  );
}
