/*
 * File: src/components/home/FeaturesSection.js
 * SR-DEV: Features Section (Redesigned for Responsiveness)
 *
 * FEATURES:
 * - Symmetric 2x2 Grid layout.
 * - Hover Gradient Blobs for "alive" feel.
 * - Clear iconography and value props.
 */

import { Shield, Users, Video, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    title: "Private & Confidential",
    desc: "Zero digital footprint. Your sessions are encrypted and never recorded.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    blob: "bg-blue-100/50"
  },
  {
    icon: Users,
    title: "Top 1% Experts",
    desc: "We vet thousands of applicants to bring you only the most qualified, empathetic professionals.",
    color: "text-purple-600",
    bg: "bg-purple-50",
    blob: "bg-purple-100/50"
  },
  {
    icon: Video,
    title: "Instant Video",
    desc: "No downloads. No waiting. One-click secure connection from your browser.",
    color: "text-orange-600",
    bg: "bg-orange-50",
    blob: "bg-orange-100/50"
  },
  {
    icon: Sparkles,
    title: "Personalized Match",
    desc: "Our algorithm matches you with experts who specialize in your specific needs.",
    color: "text-pink-600",
    bg: "bg-pink-50",
    blob: "bg-pink-100/50"
  },
];

export default function FeaturesSection() {
  return (
    <section className="pt-24 pb-8 md:pt-32 md:pb-12 bg-[#FAFAFA] dark:bg-zinc-950 relative overflow-hidden">
      
      {/* Floating Background Doodles */}
      <div className="absolute top-20 left-0 w-64 h-64 bg-rose-100/50 dark:bg-rose-900/10 rounded-full blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-normal" />
      <div className="absolute bottom-20 right-0 w-80 h-80 bg-cyan-100/50 dark:bg-cyan-900/10 rounded-full blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-normal" />

      <div className="container px-4 mx-auto max-w-6xl relative z-10">
        
        <div className="max-w-2xl mb-16 mx-auto md:mx-0 text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-6">
            Everything you need to <br/>
            <span className="text-primary relative inline-block">
              heal and grow.
              <svg className="absolute w-full h-3 -bottom-2 left-0 text-yellow-400 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h2>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed">
            We’ve reimagined therapy for the modern world. Seamless, secure, and centered around you.
          </p>
        </div>

        {/* SR-DEV: Symmetric 2-column grid for stable layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {FEATURES.map((f, idx) => (
            <div 
              key={idx} 
              className="group relative p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-start"
            >
              {/* Hover Gradient Blob - Positioned in corner */}
              <div className={`absolute top-0 right-0 w-32 h-32 ${f.blob} rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out`} />
              
              <div className={`relative h-14 w-14 rounded-2xl ${f.bg} ${f.color} flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:scale-110 duration-300`}>
                <f.icon className="w-7 h-7" />
              </div>
              
              <h3 className="relative text-2xl font-bold text-zinc-900 dark:text-white mb-3 group-hover:text-primary transition-colors">
                {f.title}
              </h3>
              
              <p className="relative text-zinc-500 dark:text-zinc-400 leading-relaxed text-base flex-1">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}