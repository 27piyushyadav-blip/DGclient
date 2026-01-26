/*
 * File: src/components/ExpertCard.js
 * SR-DEV: Premium Expert Card (Updated for latest ExpertProfile Schema)
 * FEATURES: 
 * - Seamless "Watch Intro" and "Message Expert" secondary buttons.
 * - Integrated VideoModal and Chat Action.
 * - Removed legacy play badge from avatar.
 */

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProfileImage from "@/components/ProfileImage";
import { cn } from "@/lib/utils";
import { MapPin, GraduationCap, Briefcase, Play, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoModal from "@/components/modals/VideoModal";

// --- Helper Icon ---
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
  const router = useRouter();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isChatPending, startChatTransition] = useTransition();

  // 1. Data Mapping (Using latest ExpertProfile fields)
  const hasVideo = Boolean(expert.videoUrl || expert.introVideo);
  const videoUrl = expert.videoUrl || expert.introVideo;
  
  const educationDisplay = expert.latestEducation || 
    (expert.education?.[0] ? `${expert.education[0].degree} in ${expert.education[0].fieldOfStudy}` : "N/A");

  // 2. Chat Logic
  const handleChatClick = (e) => {
    e.preventDefault(); // Prevent navigating to profile page
    startChatTransition(async () => {
      router.push("/chat");
    });
  };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        filled={i < Math.round(rating)}
        className={cn(
          "w-3.5 h-3.5",
          i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-zinc-200 dark:text-zinc-700"
        )}
      />
    ));

  return (
    <div className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden h-full">
      
      {/* 1. Clickable Top Area (Avatar & Identity) */}
      <Link href={`/experts/${expert._id}`} className="p-5 flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <ProfileImage 
            src={expert.profilePicture}
            name={expert.name}
            sizeClass="h-20 w-20"
            textClass="text-2xl font-bold text-white"
          />
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 leading-snug group-hover:text-primary transition-colors truncate">
            {expert.name}
          </h3>
          <p className="text-sm font-medium text-primary truncate mb-2">
            {expert.specialization}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-1.5 py-0.5 rounded">
              {expert.rating?.toFixed(1) || "New"}
            </span>
            <div className="flex gap-0.5">{renderStars(expert.rating || 0)}</div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-0.5">({expert.reviewCount})</span>
          </div>
        </div>
      </Link>

      {/* 2. Professional Details (Mid Section) */}
      <Link href={`/experts/${expert._id}`} className="px-5 py-3 grid grid-cols-2 gap-y-3 gap-x-4 text-xs border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
        <div>
          <span className="text-zinc-400 uppercase text-[10px] font-bold mb-0.5 block">Experience</span>
          <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
            <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
            {expert.experienceYears}+ Years
          </div>
        </div>
        <div>
          <span className="text-zinc-400 uppercase text-[10px] font-bold mb-0.5 block">Location</span>
          <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <span className="truncate">{expert.location}</span>
          </div>
        </div>
        <div className="col-span-2">
          <span className="text-zinc-400 uppercase text-[10px] font-bold mb-0.5 block">Education</span>
          <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
            <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
            <span className="truncate">{educationDisplay}</span>
          </div>
        </div>
      </Link>

      {/* 3. NEW: Action Buttons (Secondary) */}
      <div className="px-4 pt-4 pb-2 flex gap-2">
        {hasVideo && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-9 rounded-lg gap-2 text-xs font-semibold border-zinc-200 dark:border-zinc-700"
            onClick={(e) => { e.preventDefault(); setShowVideoModal(true); }}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Watch Intro
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 h-9 rounded-lg gap-2 text-xs font-semibold border-zinc-200 dark:border-zinc-700"
          onClick={handleChatClick}
          disabled={isChatPending}
        >
          {isChatPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
          Message
        </Button>
      </div>

      {/* 4. Footer: Pricing + CTA */}
      <div className="p-4 mt-auto flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase text-zinc-400">Starts From</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-zinc-900 dark:text-white">₹{expert.startingPrice || 0}</span>
            <span className="text-[10px] text-zinc-500">/ session</span>
          </div>
        </div>

        <Link href={`/experts/${expert._id}`}>
          <Button size="sm" className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 h-9 rounded-lg font-bold text-xs hover:scale-[1.02] transition-transform">
            View Profile
          </Button>
        </Link>
      </div>

      {/* Video Modal Integration */}
      {showVideoModal && videoUrl && (
        <VideoModal videoUrl={videoUrl} onClose={() => setShowVideoModal(false)} />
      )}
    </div>
  );
}