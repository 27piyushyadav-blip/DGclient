/*
 * File: src/components/ExpertSearchClient.js
 * Simplified Showcase View: Removed filters/sorting, uses Grid Card View.
 */

"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { Loader2, Users } from "lucide-react";

// --- Dynamic Imports ---
const ExpertCard = dynamic(() => import("@/components/ExpertCard"));

export default function ExpertSearchClient({ initialExperts, initialTotal, initialHasMore }) {
  // 1. State for Data (Filters/Search/Sort removed)
  const [experts, setExperts] = useState(initialExperts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Infinite Scroll Handler (Kept to support growth later, but UI is simplified)
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    setIsLoading(false);
  }, [isLoading, hasMore, currentPage]);

  // 3. Setup Observer
  const sentinelRef = useInfiniteScroll({ loadMore, hasMore, isLoading });

  return (
    <div className="w-full">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">
            Available Professionals ({initialTotal})
          </span>
        </div>
      </div>

      {/* Results Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
      {experts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((expert) => (
            <ExpertCard key={expert._id} expert={expert} />
          ))}
          
          {/* Infinite Scroll Sentinel */}
          <div ref={sentinelRef} className="col-span-full text-center py-10">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading more experts...</span>
              </div>
            )}
            {!isLoading && !hasMore && experts.length > 6 && (
              <p className="text-zinc-400 text-sm italic">
                You've viewed all our verified experts.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Users className="w-16 h-16 mb-4 text-zinc-200 dark:text-zinc-800" />
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No experts available right now.
          </p>
          <p className="text-zinc-500 text-sm mt-1">
            Please check back later as we verify more professionals.
          </p>
        </div>
      )}
    </div>
  );
}