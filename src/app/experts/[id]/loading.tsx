/*
 * File: src/app/experts/[id]/loading.js
 * SR-DEV: Expert Profile Loading Skeleton
 * Mimics the Hero area and the Sticky sidebar of the profile page.
 */

export default function Loading() {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-32 animate-pulse">
        
        {/* 1. Hero Area Skeleton */}
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 pt-8 pb-12">
          <div className="container max-w-6xl mx-auto px-4 md:px-6">
            {/* Breadcrumbs */}
            <div className="h-4 w-48 bg-zinc-100 dark:bg-zinc-800 rounded mb-8" />
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-4 pt-4">
                <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                <div className="h-6 w-3/4 bg-zinc-100 dark:bg-zinc-900 rounded" />
                <div className="flex gap-2">
                   <div className="h-6 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                   <div className="h-6 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                </div>
                <div className="flex gap-3 pt-2">
                   <div className="h-10 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                   <div className="h-10 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* 2. Content Grid Skeleton */}
        <div className="container max-w-6xl mx-auto px-4 md:px-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800" />
                ))}
              </div>
  
              {/* Tabs & Content */}
              <div className="space-y-4">
                 <div className="h-12 w-full bg-zinc-100 dark:bg-zinc-900 rounded-lg" />
                 <div className="h-[400px] w-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl" />
              </div>
            </div>
  
            {/* Right: Sticky Card Skeleton */}
            <div className="hidden lg:block lg:col-span-1">
               <div className="h-[350px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
                  <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
                  <div className="h-10 w-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  <div className="space-y-3 pt-4">
                     <div className="h-12 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                     <div className="h-12 w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
                  </div>
               </div>
            </div>
  
          </div>
        </div>
      </div>
    );
  }