/*
 * File: src/components/home/CTASection.js
 * SR-DEV: Premium Footer Call-to-Action
 * ACTION: REMOVED "Create Account" button (File 112). Now features a single, clear CTA.
 *
 * FEATURES:
 * - High-Contrast Design (Dark Theme).
 * - "Stardust" Texture Background.
 * - Clear, singular conversion goal.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden bg-zinc-900 dark:bg-zinc-950 text-white">
      
      {/* --- BACKGROUND EFFECTS --- */}
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="container px-4 mx-auto max-w-4xl relative z-10 text-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-blue-100 mb-8 backdrop-blur-sm">
           <Sparkles className="w-4 h-4 text-yellow-300" />
           <span>Your journey begins here</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Ready to write your <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            next chapter?
          </span>
        </h2>
        
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Join 10,000+ users who have found clarity and peace with Mind Namo. 
          No subscriptions. No hidden fees. Just healing.
        </p>

        {/* --- ACTIONS: Single CTA --- */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <Link href="/experts">
             <Button size="lg" className="h-16 px-10 text-xl rounded-full bg-white text-zinc-900 hover:bg-zinc-100 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
               Find My Expert
             </Button>
           </Link>
           {/* Removed: Create Account Button */}
        </div>

        <p className="mt-8 text-sm text-zinc-500">
          Free to join. Secure & Confidential.
        </p>

      </div>
    </section>
  );
}