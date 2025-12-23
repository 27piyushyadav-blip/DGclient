/*
 * File: src/app/experts/loading.js
 * SR-DEV: Experts Grid Loading Skeleton
 * Updated: Matches the new simplified showcase grid (no filters/sidebar).
 */

export default function Loading() {
   return (
     <div className="flex flex-col w-full bg-zinc-50 dark:bg-zinc-950 min-h-screen">
       <main className="container mx-auto max-w-7xl px-4 py-8 md:py-12 flex-1">
         
         {/* Header Skeleton */}
         <div className="mb-8 space-y-3 animate-pulse">
           <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
           <div className="h-4 w-96 max-w-full bg-zinc-100 dark:bg-zinc-900 rounded" />
         </div>
 
         {/* Available Professionals Count Skeleton */}
         <div className="flex items-center gap-2 mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-800 animate-pulse">
           <div className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800" />
           <div className="h-4 w-40 bg-zinc-100 dark:bg-zinc-900 rounded" />
         </div>
 
         {/* Expert Cards Grid Skeleton (3 cols desktop, 2 tablet, 1 mobile) */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1, 2, 3, 4, 5, 6].map((i) => (
             <div 
               key={i} 
               className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden animate-pulse flex flex-col h-[420px]"
             >
               {/* Top Section: Avatar + Identity */}
               <div className="p-5 flex items-start gap-4">
                 <div className="h-20 w-20 rounded-2xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                 <div className="flex-1 space-y-3 pt-1">
                   <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                   <div className="h-4 w-1/2 bg-zinc-100 dark:bg-zinc-900 rounded" />
                   <div className="flex gap-1.5 mt-2">
                     <div className="h-4 w-8 bg-zinc-100 dark:bg-zinc-900 rounded" />
                     <div className="h-4 w-16 bg-zinc-100 dark:bg-zinc-900 rounded" />
                   </div>
                 </div>
               </div>
 
               {/* Mid Section: Stats Grid */}
               <div className="px-5 py-4 grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                 <div className="space-y-2">
                   <div className="h-2 w-12 bg-zinc-100 dark:bg-zinc-900 rounded" />
                   <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                 </div>
                 <div className="space-y-2">
                   <div className="h-2 w-12 bg-zinc-100 dark:bg-zinc-900 rounded" />
                   <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                 </div>
               </div>
 
               {/* Action Buttons Section */}
               <div className="px-4 py-4 flex gap-2">
                 <div className="flex-1 h-9 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                 <div className="flex-1 h-9 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
               </div>
 
               {/* Footer Section */}
               <div className="p-4 mt-auto border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                 <div className="space-y-1">
                   <div className="h-2 w-16 bg-zinc-100 dark:bg-zinc-900 rounded" />
                   <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                 </div>
                 <div className="h-9 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
               </div>
             </div>
           ))}
         </div>
       </main>
     </div>
   );
 }