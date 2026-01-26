/*
 * File: src/components/home/FeaturedExpertsSkeleton.js
 * SR-DEV: Loading Skeleton for the Experts Grid
 * Matches the layout of ExpertCard to prevent layout shift.
 */

export default function FeaturedExpertsSkeleton() {
    return (
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="h-full w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 animate-pulse shadow-sm"
          >
             {/* Header: Avatar & Identity */}
             <div className="flex items-start gap-4">
                {/* Avatar Circle */}
                <div className="h-20 w-20 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                
                {/* Name & Role Lines */}
                <div className="flex-1 space-y-2 pt-1">
                   <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                   <div className="h-4 w-1/2 bg-zinc-100 dark:bg-zinc-900 rounded" />
                   <div className="h-4 w-16 bg-zinc-100 dark:bg-zinc-900 rounded mt-1" />
                </div>
             </div>
             
             {/* Middle: Stats Grid Placeholder */}
             <div className="grid grid-cols-2 gap-3 pt-2 opacity-70">
                <div className="space-y-1">
                   <div className="h-3 w-12 bg-zinc-100 dark:bg-zinc-900 rounded" />
                   <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
                <div className="space-y-1">
                   <div className="h-3 w-12 bg-zinc-100 dark:bg-zinc-900 rounded" />
                   <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
             </div>
  
             {/* Footer: Price & Button */}
             <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="space-y-1">
                   <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-900 rounded" />
                   <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
                <div className="h-10 w-28 bg-zinc-100 dark:bg-zinc-900 rounded-lg" />
             </div>
          </div>
        ))}
      </div>
    );
  }