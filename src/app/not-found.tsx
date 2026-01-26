/*
 * File: src/app/not-found.tsx
 * SR-DEV: Custom 404 Page (Best-in-Class UI)
 *
 * FEATURES:
 * - Glassmorphism Icon Container.
 * - Clear, friendly typography hierarchy.
 * - 'Return Home' primary action.
 * - Responsive layout.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MindNamoLogo } from "@/components/Icons";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 text-center relative overflow-hidden">
      
      {/* Background Decorations (Optional for polish) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="space-y-8 max-w-md relative z-10">
        {/* Branding Icon */}
        <div className="flex justify-center">
          <div className="bg-white/80 dark:bg-zinc-900/80 p-5 rounded-2xl backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-lg">
            <MindNamoLogo className="h-12 w-12 text-primary" />
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tighter">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200">
            Page not found
          </h2>
          <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or never existed.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2">
          <Link href="/">
            <Button size="lg" className="gap-2 shadow-md hover:shadow-lg transition-all px-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Return Home
            </Button>
          </Link>
        </div>
      </div>
      
    </div>
  );
}
