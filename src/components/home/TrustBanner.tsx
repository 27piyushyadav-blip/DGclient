/*
 * File: src/components/home/TrustBanner.js
 * SR-DEV: Premium Static Trust Grid
 *
 * FEATURES:
 * - Implemented a responsive Grid layout (2 cols mobile, 4 cols desktop).
 * - Improved card styling for better static presentation.
 */

"use client";

import { ShieldCheck, Lock, Award, Globe2, Activity, FileHeart, Stethoscope, UserCheck } from "lucide-react";

const TRUST_SIGNALS = [
  { icon: ShieldCheck, label: "HIPAA Compliant" },
  { icon: Lock, label: "256-bit Encryption" },
  { icon: Award, label: "Board Certified" },
  { icon: Globe2, label: "ISO 27001" },
  { icon: Activity, label: "Clinical Standards" },
  { icon: FileHeart, label: "Confidential" },
  { icon: Stethoscope, label: "Licensed Experts" },
  { icon: UserCheck, label: "Verified Profiles" },
];

export default function TrustBanner() {
  return (
    <section className="w-full bg-white dark:bg-zinc-950 border-y border-zinc-100 dark:border-zinc-800 py-16 overflow-hidden relative">
      
      {/* Background Doodle: Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="container mx-auto px-4 relative z-10">
         
         {/* Header */}
         <div className="text-center mb-12">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] inline-block relative">
               Trusted by 10,000+ Users
               {/* Doodle: Hand-drawn underline */}
               <svg className="absolute -bottom-2 left-0 w-full h-2 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
               </svg>
            </h3>
         </div>

         {/* Static Grid Layout */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {TRUST_SIGNALS.map((item, idx) => (
              <div 
                key={idx} 
                className="flex flex-col items-center text-center gap-3 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors group cursor-default"
              >
                 <div className="p-3 rounded-full bg-white dark:bg-zinc-900 shadow-sm text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <item.icon className="w-6 h-6" />
                 </div>
                 <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                   {item.label}
                 </span>
              </div>
            ))}
         </div>

      </div>
    </section>
  );
}