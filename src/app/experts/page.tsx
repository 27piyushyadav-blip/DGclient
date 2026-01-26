/*
 * File: src/app/experts/page.tsx
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import ExpertSearchClient from "@/components/ExpertSearchClient";
import ExpertsLoading from "./loading"; 
import { AlertTriangle } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// --- UPDATED METADATA ---
export const metadata: Metadata = {
  title: "Experts | Mind Namo",
  description: "Browse certified psychologists, therapists, and life coaches. Filter by specialization, price, and language.",
  openGraph: {
    title: "Find Your Perfect Mental Health Expert | Mind Namo",
    description: "Connect with verified psychologists and coaches. Filter by specialization, language, and price.",
    url: "/experts",
    siteName: "Mind Namo",
    images: [
      {
        url: "/og-experts.jpg", // Make sure this image exists in /public
        width: 1200,
        height: 630,
        alt: "Mind Namo Expert Directory",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Top Mental Health Experts",
    description: "Find the right therapist for you on Mind Namo.",
    images: ["/og-experts.jpg"],
  },
};

export default async function ExpertsPage() {
  const initialData = {
    experts: [],
    total: 0,
    hasMore: false,
    dynamicFilters: {},
    error: null,
  };
  
  return (
    <div className="flex flex-col w-full bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <main className="container mx-auto max-w-7xl px-4 py-8 md:py-12 flex-1">
        
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Find your perfect match
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Connect with verified professionals who specialize in your needs.
          </p>
        </div>

        {initialData.error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
             <AlertTriangle className="w-8 h-8 text-red-600 mb-3" />
             <p className="text-red-700 dark:text-red-300 font-medium">Error: {initialData.error}</p>
          </div>
        ) : (
          <Suspense fallback={<ExpertsLoading />}>
            <ExpertSearchClient 
              initialExperts={initialData.experts} 
              initialTotal={initialData.total}
              initialHasMore={initialData.hasMore}
            />
          </Suspense>
        )}
      </main>
    </div>
  );
}
