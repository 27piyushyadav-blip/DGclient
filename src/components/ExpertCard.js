/*
 * File: src/components/ExpertCard.js
 * SR-DEV: Premium Expert Card (Grid View)
 * UPDATED for ExpertProfile architecture (education array fix)
 */

"use client";

import Link from "next/link";
import ProfileImage from "@/components/ProfileImage";
import { cn } from "@/lib/utils";
import { MapPin, GraduationCap, Briefcase, Play } from "lucide-react";

// --- Helper Components ---
const StarIcon = ({ filled, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill={filled ? "currentColor" : "none"} 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function ExpertCard({ expert }) {
  // -------------------------
  // 1. PRICE CALCULATION
  // -------------------------
  let displayPrice = expert.startingPrice || 0;

  if (displayPrice === 0 && expert.services?.length > 0) {
    let min = Infinity;
    expert.services.forEach(s => {
      if (s.videoPrice && s.videoPrice < min) min = s.videoPrice;
      if (s.clinicPrice && s.clinicPrice < min) min = s.clinicPrice;
    });
    if (min !== Infinity) displayPrice = min;
  }

  // -------------------------
  // 2. VIDEO BADGE
  // -------------------------
  const hasVideo = Boolean(expert.videoUrl);

  // -------------------------
  // 3. EDUCATION FIX
  // -------------------------
  const educationDisplay =
    expert.latestEducation ||
    (expert.education?.[0]?.degree
      ? expert.education[0].degree
      : "N/A");

  // -------------------------
  // 4. RATING STARS
  // -------------------------
  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        filled={i < Math.round(rating)}
        className={cn(
          "w-3.5 h-3.5",
          i < Math.round(rating)
            ? "text-amber-400 fill-amber-400"
            : "text-zinc-200 dark:text-zinc-700"
        )}
      />
    ));

  return (
    <Link href={`/experts/${expert._id}`} className="block h-full">
      <div className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden h-full cursor-pointer hover:-translate-y-1">
        
        {/* -----------------------------------
            HEADER: Avatar + Name + Rating
        ----------------------------------- */}
        <div className="p-5 flex items-start gap-4">
          
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <ProfileImage 
              src={expert.profilePicture}
              name={expert.name}
              sizeClass="h-20 w-20 md:h-24 md:w-24"
              textClass="text-2xl md:text-3xl font-bold text-white"
            />

            {/* Video Badge */}
            {hasVideo && (
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-zinc-900 p-1 rounded-full shadow-sm">
                <div className="bg-red-500 text-white rounded-full p-1.5 shadow-lg w-8 h-8 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                </div>
              </div>
            )}
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 leading-snug group-hover:text-primary transition-colors truncate">
              {expert.name}
            </h3>

            <p className="text-sm font-medium text-primary truncate mb-2">
              {expert.specialization}
            </p>

            {/* Rating */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-1.5 py-0.5 rounded">
                {expert.rating?.toFixed(1) || "New"}
              </span>

              <div className="flex gap-0.5">{renderStars(expert.rating || 0)}</div>

              <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-0.5">
                ({expert.reviewCount})
              </span>
            </div>
          </div>
        </div>

        {/* -----------------------------------
            MIDDLE: Experience / Location / Education
        ----------------------------------- */}
        <div className="px-5 py-3 grid grid-cols-2 gap-y-3 gap-x-4 text-xs border-t border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
          
          {/* Experience */}
          <div>
            <span className="text-zinc-400 uppercase text-[10px] font-bold mb-0.5 block">Experience</span>
            <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
              <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
              {expert.experienceYears}+ Years
            </div>
          </div>

          {/* Location */}
          <div>
            <span className="text-zinc-400 uppercase text-[10px] font-bold mb-0.5 block">Location</span>
            <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span className="truncate">{expert.location}</span>
            </div>
          </div>

          {/* Education */}
          <div className="col-span-2">
            <span className="text-zinc-400 uppercase text-[10px] font-bold mb-0.5 block">Education</span>
            <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
              <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
              <span className="truncate">{educationDisplay}</span>
            </div>
          </div>
        </div>

        {/* -----------------------------------
            FOOTER: Pricing + CTA
        ----------------------------------- */}
        <div className="p-4 mt-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-400">Starts From</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-zinc-900 dark:text-white">₹{displayPrice}</span>
              <span className="text-xs text-zinc-500">/ session</span>
            </div>
          </div>

          <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm h-10 px-6 rounded-lg font-semibold text-sm flex items-center justify-center transition-colors">
            View Profile
          </div>
        </div>

      </div>
    </Link>
  );
}
