/*
 * File: src/app/page.tsx
 * SR-DEV: Home Page (Final Assembly)
 * ACTION: Re-styled "Browse Experts" callout to match premium design system.
 */

import { Suspense } from "react";
import HeroSection from "@/components/home/HeroSection";
import TrustBanner from "@/components/home/TrustBanner";
import FeaturesSection from "@/components/home/FeaturesSection";
import StatsSection from "@/components/home/StatsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FAQSection from "@/components/home/FAQSection";
import CTASection from "@/components/home/CTASection";
import { Button } from "@/components/ui/button";
import { Search, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-white dark:bg-zinc-950">
      <main className="flex-1">
        {/* 1. Hero: First Impression */}
        <HeroSection />
        
        {/* 2. Trust: Credibility Bar */}
        <TrustBanner />

        {/* 3. Features: Why Us */}
        <FeaturesSection />
        
        {/* 4. New: Callout to Full Experts List (Premium Re-style) */}
        <section className="relative py-24 bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden border-y border-zinc-100 dark:border-zinc-800">
            
            {/* --- Background Decor --- */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
            
            {/* Decorative Doodle: Abstract Waves */}
            <svg className="absolute top-12 right-12 w-40 h-40 text-zinc-200 dark:text-zinc-800 opacity-60 animate-pulse-slow pointer-events-none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
               <path d="M10 30 Q 50 10 90 30" />
               <path d="M10 50 Q 50 30 90 50" />
               <path d="M10 70 Q 50 50 90 70" />
            </svg>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                   
                   {/* Micro-Badge */}
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm mb-8 backdrop-blur-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">Curated Directory</span>
                   </div>

                   <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-6 leading-[1.2]">
                     Find the Expert who <br className="hidden sm:block" />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                       truly gets you.
                     </span>
                   </h2>
                   
                   <p className="text-xl text-zinc-500 dark:text-zinc-400 mb-10 leading-relaxed max-w-2xl mx-auto">
                     We believe in choice, not bias. Explore our complete, unranked directory to find the perfect professional based on your specific needs.
                   </p>
                   
                   <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <a href="/experts">
                          <Button size="lg" className="h-14 px-8 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 hover:shadow-xl transition-all duration-300 text-base font-semibold group">
                             <Search className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                             Browse All Experts
                          </Button>
                      </a>
                   </div>
                </div>
            </div>
        </section>

        {/* 5. Process: How to Book */}
        <HowItWorksSection />

        {/* 6. Stats: Scale & Trust */}
        <StatsSection />

        {/* 7. Social Proof: Reviews */}
        <TestimonialsSection />

        {/* 8. FAQ: Objection Handling */}
        <FAQSection />

        {/* 9. Bottom CTA: Conversion */}
        <CTASection />
      </main>
    </div>
  );
}
