/*
 * File: src/components/home/HeroSection.js
 * SR-DEV: World-Class Hero Section
 * ACTION: FIXED Border Radius BUG on hover/animation (139).
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, CheckCircle2 } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#FAFAFA] dark:bg-zinc-950 pt-12 pb-20 lg:pt-24 lg:pb-32">
      
      {/* --- DOODLE BACKGROUNDS (CSS Shapes) --- */}
      {/* Top Right Yellow Blob */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-yellow-200/20 dark:bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      {/* Bottom Left Blue Blob */}
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* SVG Squiggle (Absolute) */}
      <svg className="absolute top-20 left-10 w-24 h-24 text-zinc-200 dark:text-zinc-800 opacity-50 animate-float" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.2,-19.2,95.8,-5.3C93.5,8.6,81.9,21.5,70.6,32.6C59.3,43.7,48.2,53,36.4,61.7C24.6,70.4,12.1,78.6,-0.2,79C-12.5,79.3,-25.3,71.8,-37.5,63.6C-49.7,55.4,-61.3,46.5,-70.6,35.2C-79.9,23.9,-86.9,10.2,-85.4,-2.7C-83.9,-15.6,-73.9,-27.7,-63.4,-38C-52.9,-48.3,-41.9,-56.8,-30.3,-65.4C-18.7,-74,-6.5,-82.7,4.8,-91C16.1,-99.3,28.7,-91.2,44.7,-76.4Z" transform="translate(100 100)" />
      </svg>

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* --- LEFT: CONTENT (Unchanged) --- */}
          <div className="flex flex-col space-y-8 text-center lg:text-left">
            
            {/* Trust Badge */}
            <div className="inline-flex items-center self-center lg:self-start rounded-full border border-zinc-200 bg-white/80 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200 transition-transform hover:scale-105 cursor-default">
              <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-ping" />
              <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 absolute" />
              Available Now: 120+ Experts
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
              Talk to someone <br className="hidden lg:block"/>
              who <span className="relative inline-block text-primary">
                really listens.
                {/* Underline Doodle */}
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-400 dark:text-yellow-500 opacity-80" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C18.5038 3.81345 33.285 2.00003 50.0001 2.00003C77.0513 2.00003 99.3266 6.51814 126.683 6.99997C153.71 7.47608 171.975 3.32612 198.002 2.00003" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Therapy doesn’t have to be scary. Connect with certified experts for stress, anxiety, and relationship advice from your safe space.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Link href="/experts">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 hover:shadow-2xl transition-all w-full sm:w-auto">
                  Find Your Expert
                </Button>
              </Link>
              <Link href="/#how-it-works">
                 <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-zinc-300 hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-800 gap-2 w-full sm:w-auto group">
                   How it works 
                   <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                 </Button>
              </Link>
            </div>

            {/* Mini Social Proof */}
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-200 overflow-hidden relative">
                       <Image 
                         src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                         alt="User" 
                         fill
                         sizes="40px"
                         className="object-cover"
                       />
                    </div>
                  ))}
               </div>
               <div className="text-sm font-medium">
                  <div className="flex text-yellow-400 mb-0.5">
                     <Star className="w-4 h-4 fill-current" />
                     <Star className="w-4 h-4 fill-current" />
                     <Star className="w-4 h-4 fill-current" />
                     <Star className="w-4 h-4 fill-current" />
                     <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-zinc-600 dark:text-zinc-400">Loved by 10k+ people</span>
               </div>
            </div>
          </div>

          {/* --- RIGHT: ILLUSTRATION (FIXED) --- */}
          <div className="relative lg:h-[650px] w-full flex items-center justify-center perspective-1000">
             
             {/* Main Image Card */}
             <div className="relative w-full max-w-md aspect-[4/5] bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-[8px] border-white dark:border-zinc-800 rotate-2 hover:rotate-0 transition-transform duration-700 ease-out">
                 <Image 
                   src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop"
                   alt="Happy patient on video call"
                   fill
                   className="object-cover"
                   priority
                 />
                 
                 {/* Floating "Verified" Card */}
                 <div className="absolute top-8 left-8 bg-white/95 dark:bg-zinc-900/95 backdrop-blur p-3 pr-5 rounded-2xl shadow-lg flex items-center gap-3 animate-bounce-slow">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                       <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="font-bold text-sm text-zinc-900 dark:text-white">Verified Expert</p>
                       <p className="text-xs text-zinc-500">Dr. Sarah is online</p>
                    </div>
                 </div>

                 {/* Floating "Rating" Card */}
                 <div className="absolute bottom-8 right-8 bg-white/95 dark:bg-zinc-900/95 backdrop-blur p-4 rounded-2xl shadow-lg text-center animate-float">
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">4.9</p>
                    <div className="flex text-yellow-400 gap-0.5 text-xs">
                       <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                    </div>
                 </div>
             </div>

             {/* Decorative Backdrops */}
             <div className="absolute -z-10 top-10 right-10 w-full max-w-md h-full rounded-[2.5rem] border-2 border-zinc-200 dark:border-zinc-800 -rotate-3" />
          </div>

        </div>
      </div>
    </section>
  );
}