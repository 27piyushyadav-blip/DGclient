/*
 * File: src/app/chat/loading.js
 * SR-DEV: Chat Interface Loading Skeleton
 * Prevents layout shift by rendering the sidebar and chat area immediately.
 */

export default function Loading() {
    return (
      <div className="flex h-[100dvh] flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
        {/* <Header /> */}
        <main className="flex-1 flex overflow-hidden">
          
          {/* Left Sidebar Skeleton */}
          <div className="w-full max-w-sm border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hidden md:flex flex-col">
             <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
             </div>
             <div className="flex-1 p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                   <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                      <div className="flex-1 space-y-2">
                         <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                         <div className="h-3 w-1/2 bg-zinc-100 dark:bg-zinc-900 rounded" />
                      </div>
                   </div>
                ))}
             </div>
          </div>
  
          {/* Right Chat Area Skeleton */}
          <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950">
             {/* Chat Header */}
             <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center px-6">
                <div className="flex items-center gap-4 animate-pulse w-full">
                   <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                   <div className="h-5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
             </div>
  
             {/* Messages Area */}
             <div className="flex-1 p-6 space-y-6">
                <div className="flex flex-col items-start gap-2 animate-pulse">
                   <div className="h-12 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl rounded-tl-none" />
                </div>
                <div className="flex flex-col items-end gap-2 animate-pulse">
                   <div className="h-16 w-72 bg-zinc-300 dark:bg-zinc-700 rounded-2xl rounded-tr-none" />
                </div>
                <div className="flex flex-col items-start gap-2 animate-pulse">
                   <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-2xl rounded-tl-none" />
                </div>
             </div>
  
             {/* Input Area */}
             <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                <div className="h-12 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" />
             </div>
          </div>
        </main>
      </div>
    );
  }