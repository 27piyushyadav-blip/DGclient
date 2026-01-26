/*
 * File: src/components/ExpertList.js
 * SR-DEV: Premium Expert List View (With Video Indicator)
 *
 * FEATURES:
 * - Video Ready: Shows a Red Play Button if the expert has an intro video.
 * - Smart Navigation: Clicking the play button opens the video directly.
 * - Clean UI: Preserves the borderless, shadowless premium look.
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ProfileImage from "@/components/ProfileImage";
import { cn } from "@/lib/utils";

// --- Icons ---
const StarIcon = ({ filled, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const MapPinIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>);
const GraduationCapIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>);
const BriefcaseIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>);
const PlayIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0"><path d="M8 5v14l11-7z"/></svg>);

export default function ExpertList({ expert }) {
  const router = useRouter();

  // Price Logic
  let displayPrice = expert.startingPrice || 0;
  if (displayPrice === 0 && expert.services?.length > 0) {
      let min = Infinity;
      expert.services.forEach(s => {
          if (s.videoPrice && s.videoPrice < min) min = s.videoPrice;
          if (s.clinicPrice && s.clinicPrice < min) min = s.clinicPrice;
      });
      if (min !== Infinity) displayPrice = min;
  }

  // Check for Video
  const hasVideo = Boolean(expert.videoUrl);

  // Handle Video Click
  const handleVideoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // In a real app, this might open a modal directly. 
    // For now, we can navigate to the profile with a query param to auto-open video.
    router.push(`/experts/${expert._id}?video=true`);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon 
        key={i} 
        filled={i < Math.round(rating)} 
        className={cn("w-3.5 h-3.5", i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-zinc-200 dark:text-zinc-700")} 
      />
    ));
  };

  return (
    <Link href={`/experts/${expert._id}`} className="block group">
      <div className="flex flex-col md:flex-row items-stretch bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700">
        
        {/* 1. Left: Profile Identity (40%) */}
        <div className="p-6 w-full md:w-[40%] border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800 flex items-center gap-6">
           
           {/* Profile Picture Container */}
           <div className="relative shrink-0">
             <ProfileImage 
                src={expert.profilePicture} 
                name={expert.name} 
                sizeClass="h-24 w-24" 
                textClass="text-3xl font-bold text-white"
             />
             
             {/* SR-DEV: Video Indicator */}
             {hasVideo && (
               <button 
                 onClick={handleVideoClick}
                 className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 p-1 rounded-full z-20 shadow-sm group-hover:scale-110 transition-transform"
                 title="Watch Intro Video"
               >
                 <div className="bg-red-600 text-white rounded-full p-1.5 flex items-center justify-center w-7 h-7 shadow-inner">
                    <PlayIcon className="w-3.5 h-3.5 ml-0.5" />
                 </div>
               </button>
             )}
           </div>
           
           <div className="min-w-0 flex flex-col justify-center gap-1.5">
              <h3 className="font-bold text-xl text-zinc-900 dark:text-zinc-50 leading-tight group-hover:text-primary transition-colors">
                {expert.name}
              </h3>
              <p className="text-sm font-medium text-primary truncate">{expert.specialization}</p>
              
              {/* Rating Row */}
              <div className="flex items-center gap-2 whitespace-nowrap">
                 <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    {expert.rating?.toFixed(1) || "New"}
                 </span>
                 <div className="flex gap-0.5">{renderStars(expert.rating || 0)}</div>
                 <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">
                   ({expert.reviewCount} Reviews)
                 </span>
              </div>
           </div>
        </div>

        {/* 2. Middle: Professional Details */}
        <div className="flex-1 p-6 flex flex-col justify-center gap-5 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
           <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                 <BriefcaseIcon className="text-zinc-400 shrink-0 mt-0.5" />
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Experience</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{expert.experienceYears}+ Years</span>
                 </div>
              </div>

              <div className="flex items-start gap-3">
                 <GraduationCapIcon className="text-zinc-400 shrink-0 mt-0.5" />
                 <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Education</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 break-words leading-snug">
                      {expert.education}
                    </span>
                 </div>
              </div>

              <div className="flex items-start gap-3">
                 <MapPinIcon className="text-zinc-400 shrink-0 mt-0.5" />
                 <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Location</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 break-words leading-snug">
                      {expert.location}
                    </span>
                 </div>
              </div>
           </div>
        </div>

        {/* 3. Right: Pricing & Action */}
        <div className="p-6 w-full md:w-auto min-w-[200px] flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 bg-white dark:bg-zinc-900">
           <div className="text-left md:text-center">
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Starts From</p>
              <div className="flex items-baseline md:justify-center gap-1">
                 <span className="text-2xl font-bold text-zinc-900 dark:text-white">₹{displayPrice}</span>
                 <span className="text-xs text-zinc-500 font-medium">/ session</span>
              </div>
           </div>
           
           {/* Visual Button */}
           <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm h-11 px-8 rounded-lg font-semibold text-sm flex items-center justify-center transition-all w-auto md:w-full transform group-hover:scale-105">
             View Profile
           </div>
        </div>

      </div>
    </Link>
  );
}