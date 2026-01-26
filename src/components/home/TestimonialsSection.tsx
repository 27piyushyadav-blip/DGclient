/*
 * File: src/components/home/TestimonialsSection.js
 * SR-DEV: Premium Testimonials (Social Proof)
 * ACTION: Limited visible reviews to 3 on mobile devices for better UX.
 */

"use client";

import ProfileImage from "@/components/ProfileImage";
import { Star, Quote, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const REVIEWS = [
  {
    name: "Sarah Jenkins",
    role: "Student",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    text: "I was hesitant at first, but my therapist made me feel so comfortable. The video quality is amazing, and I love that I can do this from my dorm room.",
    rating: 5
  },
  {
    name: "David Chen",
    role: "Software Engineer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    text: "The convenience of booking appointments around my work schedule is a game changer. Mind Namo helps me stay balanced during crunch time.",
    rating: 5
  },
  {
    name: "Priya Rao",
    role: "Artist",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop",
    text: "Finally, a platform that prioritizes privacy. I feel safe speaking my mind here. The experts are genuinely empathetic and qualified.",
    rating: 5
  },
  {
    name: "Marcus Johnson",
    role: "Entrepreneur",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
    text: "I've tried other apps, but the quality of experts on Mind Namo is superior. My life coach has helped me scale my business while keeping my sanity.",
    rating: 5
  },
  {
    name: "Emily Wilson",
    role: "Teacher",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
    text: "The interface is so easy to use. I found a counselor within minutes and had my first session the same day. Highly recommended!",
    rating: 4
  },
  {
    name: "Arjun Patel",
    role: "Marketing Director",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop",
    text: "It feels like having a support system in your pocket. The platform is reliable, secure, and the support team is very responsive.",
    rating: 5
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
      
      {/* Background Doodle */}
      <svg className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" className="text-blue-500" />
      </svg>

      <div className="container px-4 mx-auto max-w-6xl relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
           <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <Star className="w-3.5 h-3.5 fill-current" />
              4.9/5 Average Rating
           </div>
           <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
             Stories of <span className="text-primary">Hope & Healing</span>
           </h2>
           <p className="text-lg text-zinc-500 dark:text-zinc-400">
             Join thousands of others who have found their path to wellness with Mind Namo.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {REVIEWS.map((review, i) => (
             <TestimonialCard 
                key={i} 
                review={review}
                // FIX: Hide the 4th, 5th, and 6th reviews (index 3+) on mobile screens, 
                // but show them as flex items on medium screens and up.
                className={i >= 3 ? "hidden md:flex" : ""} 
             />
           ))}
        </div>

      </div>
    </section>
  );
}

function TestimonialCard({ review, className }) {
  return (
    <div className={cn("flex flex-col p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow h-full", className)}>
       
       {/* Quote Icon */}
       <div className="mb-4 text-blue-100 dark:text-blue-900/30">
          <Quote className="w-8 h-8 fill-current transform rotate-180" />
       </div>

       {/* Text */}
       <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6 flex-1">
         "{review.text}"
       </p>

       {/* Footer */}
       <div className="flex items-center gap-4 mt-auto pt-6 border-t border-zinc-50 dark:border-zinc-800">
          <ProfileImage 
             src={review.image} 
             name={review.name} 
             sizeClass="h-10 w-10" 
          />
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{review.name}</h4>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
             </div>
             <p className="text-xs text-zinc-500 truncate">{review.role}</p>
          </div>
          <div className="flex gap-0.5">
             {[...Array(5)].map((_, i) => (
               <Star key={i} className={cn("w-3 h-3", i < review.rating ? "text-yellow-400 fill-current" : "text-zinc-200")} />
             ))}
          </div>
       </div>

    </div>
  );
}