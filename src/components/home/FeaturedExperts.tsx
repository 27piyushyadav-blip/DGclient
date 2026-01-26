/*
 * File: src/components/home/FeaturedExperts.js
 * NOTE: Backend removed; now renders a static empty state.
 */

import ExpertCard from "@/components/ExpertCard";
import { AlertCircle } from "lucide-react";

export default async function FeaturedExperts() {
  return (
    <div className="mt-12 flex flex-col items-center justify-center p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
      <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-3">
        <AlertCircle className="w-6 h-6 text-zinc-400" />
      </div>
      <p className="text-zinc-500 dark:text-zinc-400 font-medium">
        No experts available at the moment.
      </p>
      <p className="text-sm text-zinc-400 mt-1">
        Check back later or browse our full directory.
      </p>
    </div>
  );
}