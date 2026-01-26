/*
 * File: src/components/home/FAQSection.js
 * SR-DEV: Premium FAQ Accordion
 *
 * FEATURES:
 * - Smooth Reveal Animation (CSS Transition).
 * - Active State Highlighting (Blue border + Shadow).
 * - Focus on Trust & Process questions.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";

const FAQS = [
  {
    q: "Is my therapy session really private?",
    a: "Absolutely. We use end-to-end encryption for all video calls. Your sessions are never recorded, and your personal notes are stored securely with AES-256 encryption. Only you and your expert have access."
  },
  {
    q: "How do I choose the right expert?",
    a: "You can browse profiles based on specialty (e.g., Anxiety, Career, Relationships), experience, and language. We also recommend watching their intro video to see who you resonate with."
  },
  {
    q: "What if I need to cancel or reschedule?",
    a: "Life happens. You can cancel or reschedule up to 24 hours before your session for a full refund. Manage everything directly from your 'My Appointments' dashboard."
  },
  {
    q: "Do I need to download an app?",
    a: "No downloads needed! Our secure video platform works directly in your browser (Chrome, Safari, Edge) on both laptop and mobile devices."
  },
  {
    q: "Are the experts verified?",
    a: "Yes. Every expert on Mind Namo undergoes a strict verification process, including credential checks and interviews, before they can list their services."
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white dark:bg-zinc-950 relative overflow-hidden">
      
      {/* Doodle Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#999 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="container px-4 mx-auto max-w-4xl relative z-10">
        
        <div className="text-center mb-16 space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              <MessageCircleQuestion className="w-4 h-4" /> FAQ
           </div>
           <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white">
             Got questions? We’re here.
           </h2>
           <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
             Everything you need to know about booking your first session.
           </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div 
              key={i} 
              className={cn(
                "border rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden transition-all duration-300",
                openIndex === i 
                  ? "border-blue-200 dark:border-blue-900 bg-white dark:bg-zinc-900 shadow-md" 
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
              )}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex justify-between items-center p-6 text-left"
                aria-expanded={openIndex === i}
              >
                <span className={cn(
                  "text-lg font-semibold transition-colors", 
                  openIndex === i ? "text-blue-600 dark:text-blue-400" : "text-zinc-900 dark:text-zinc-100"
                )}>
                  {faq.q}
                </span>
                <ChevronDown 
                  className={cn(
                    "w-5 h-5 text-zinc-400 transition-transform duration-300", 
                    openIndex === i && "rotate-180 text-blue-600"
                  )} 
                />
              </button>
              
              <div 
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  openIndex === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                 <p className="px-6 pb-6 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                   {faq.a}
                 </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
           <p className="text-zinc-500">Still have questions?</p>
           <Link href="/support" className="text-blue-600 font-semibold hover:underline">
             Chat with our support team
           </Link>
        </div>

      </div>
    </section>
  );
}