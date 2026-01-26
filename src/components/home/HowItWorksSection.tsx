/*
 * File: src/components/home/HowItWorksSection.js
 * SR-DEV: 'How It Works' Visual Journey
 *
 * FEATURES:
 * - Connected Timeline: Dashed SVG line connects steps on Desktop.
 * - Large Illustrative Icons.
 * - Clear, step-by-step narrative.
 */

import { Search, CalendarCheck, Video } from "lucide-react";

export default function HowItWorksSection() {
  const STEPS = [
    { 
      icon: Search, 
      title: "Browse Experts", 
      desc: "Explore profiles of verified therapists. Filter by specialty, price, and language to find your match." 
    },
    { 
      icon: CalendarCheck, 
      title: "Book a Slot", 
      desc: "Choose a time that works for you. Our secure booking system confirms your appointment instantly." 
    },
    { 
      icon: Video, 
      title: "Start Healing", 
      desc: "Join the 1-on-1 video session directly from your dashboard. No downloads required." 
    },
  ];

  return (
    <section id="how-it-works" className="py-32 bg-white dark:bg-zinc-950 relative overflow-hidden">
      <div className="container px-4 mx-auto max-w-6xl">
        
        <div className="text-center max-w-3xl mx-auto mb-24">
           <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-6">
             Healing, simplified.
           </h2>
           <p className="text-xl text-zinc-500 dark:text-zinc-400">
             We removed the friction from finding help. Here is how you get started.
           </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
           
           {/* Desktop Connector Line Doodle */}
           <svg className="hidden md:block absolute top-12 left-0 w-full h-24 text-zinc-200 dark:text-zinc-800 pointer-events-none z-0" viewBox="0 0 1000 100" preserveAspectRatio="none">
              <path d="M100,50 Q 300,100 500,50 T 900,50" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="12 12" />
           </svg>
           
           {STEPS.map((step, i) => (
             <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                <div className="h-24 w-24 rounded-[2rem] bg-white dark:bg-zinc-900 border-4 border-zinc-50 dark:border-zinc-800 shadow-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 relative">
                   <div className="absolute inset-0 bg-primary/5 rounded-[2rem] transform rotate-6 group-hover:rotate-12 transition-transform" />
                   <step.icon className="w-10 h-10 text-zinc-900 dark:text-white relative z-10" />
                   
                   {/* Step Number Badge */}
                   <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm shadow-lg border-4 border-white dark:border-zinc-950">
                     {i + 1}
                   </div>
                </div>
                
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
                  {step.desc}
                </p>
             </div>
           ))}
        </div>

      </div>
    </section>
  );
}