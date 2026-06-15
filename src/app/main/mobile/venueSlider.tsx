"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, PlayCircle, Heart, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Venue } from "@/app/main/data";
import VideoModal from "@/components/modals/VideoModal";

interface SmallVenueCardProps {
  venue: Venue;
  onBookNow: (venue: Venue) => void;
}

function SmallVenueCard({ venue, onBookNow }: SmallVenueCardProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  return (
    <Card className="overflow-hidden rounded-sm border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow flex-shrink-0 w-[calc(50%-4.5rem)]">
      <div className="relative">
        {/* Small thumbnail image */}
        <div 
          className="h-18 w-full bg-cover bg-center"
          style={{ 
            backgroundImage: venue.bgImage 
              ? `url(${venue.bgImage.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "")})`
              : "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')"
          }}
        />
        
        {/* Status badge */}
        <div className="absolute top-0.5 left-1">
          {/* <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5"> */}
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            {/* <span className="text-[6px] font-medium text-white">Open</span> */}
          {/* </div> */}
        </div>


        <div className="absolute top-0.5 right-1 flex gap-1">
          
            <Play onClick={()=>setIsVideoModalOpen(true)} className="h-4 w-4 text-white bg-black/70 backdrop-blur-sm rounded-full   p-1"/> 
       
        </div>
      </div>

      <div className="p-1">
        {/* Venue Name */}
        <h3 className="text-[11px] font-bold text-slate-900 leading-tight h-7">
          {venue.name}
        </h3>
      
      <h3 className="text-[7px] font-semibold text-slate-500 leading-tight">
          {venue?.industry || '--'}
        </h3>

        {/* Hours */}
        <div className="flex items-center gap-1 mt-1.5">
          <Clock className="h-2.5 w-2.5 text-slate-400" />
          <span className="text-[6px] text-slate-500 truncate">
            {venue.hours || "RAM - 7PM"}
          </span>
        </div>

        {/* Book Now Button */}
        <button
          onClick={() => onBookNow(venue)}
          className="w-full mt-1 h-5 rounded-sm border border-blue-600 text-blue-600 text-[10px] justify-center flex items-center gap-1"
        >
          {/* <CalendarDays className="h-3 w-3 text-white"/> */}
          Book Now
        </button>
      </div>
      {isVideoModalOpen && venue?.videoUrl && (
                  <VideoModal
                    videoUrl={venue.videoUrl}
                    onClose={() => setIsVideoModalOpen(false)}
                  />
                )}
    </Card>
  );
}

function SmallVenueCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white flex-shrink-0 w-[calc(50%-0.5rem)] animate-pulse">
      <div className="h-15 w-full bg-slate-200" />

      <div className="p-2">
        <div className="h-1 w-3/4 rounded bg-slate-200" />
        <div className="mt-2 h-2.5 w-1/2 rounded bg-slate-100" />

        {/* <div className="mt-3 flex items-center gap-1"> */}
          {/* <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <div className="h-2.5 w-2/3 rounded bg-slate-100" /> */}
        {/* </div> */}

        <div className="mt-2 h-3 w-full rounded-lg bg-slate-200" />
      </div>
    </Card>
  );
}

interface VenueSliderProps {
  venues: Venue[];
  onBookNow: (venue: Venue) => void;
  isLoading?: boolean;
}

export default function VenueSlider({ venues, onBookNow, isLoading = false }: VenueSliderProps) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(2);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardWidthRef = useRef<number>(0);

  console.log(venues)
  // Calculate how many cards fit based on container width
  useEffect(() => {
    const calculateCardsPerView = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Each card takes 50% minus gap, so 2 cards per view by default
        // On larger screens, could show more, but we stick to 2 as requested
        setCardsPerView(2);
      }
    };

    calculateCardsPerView();
    window.addEventListener('resize', calculateCardsPerView);
    return () => window.removeEventListener('resize', calculateCardsPerView);
  }, []);

  const totalCards = venues?.length;
  const maxIndex = Math.max(0, totalCards - cardsPerView);

  const handlePrev = () => {
    setScrollIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setScrollIndex((prev) => Math.min(maxIndex, prev + 1));
  };
  const showSkeleton = isLoading;

  return (
    <div className="w-full  py- overflow-x-hidden">

      {/* Slider Container */}
      <div className="relative overflow-x-scroll scroll-smooth scrollbar-hidden" ref={containerRef}>
        {showSkeleton ? (
          <div className="flex gap-4">
            <SmallVenueCardSkeleton />
            <SmallVenueCardSkeleton />
          </div>
        ) : venues.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white text-center text-sm text-slate-500">
            <Card className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow flex-shrink-0 w-[calc(50%-3.2rem)]">
      <div className="relative">
        {/* Small thumbnail image */}
        <div 
          className="h-18 w-full bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')"
          }}
        />
        
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[6px] font-medium text-white">Open</span>
          </div>
        </div>
      </div>

      <div className="p-2">
        {/* Venue Name */}
        <h3 className="text-[10px] font-bold text-slate-900 leading-tight">
          { "No venues available"}
        </h3>
      

        {/* Hours */}
        <div className="flex items-center gap-1 mt-1.5">
          <Clock className="h-2.5 w-2.5 text-slate-400" />
          <span className="text-[6px] text-slate-500 truncate">
            { "RAM - 7PM"}
          </span>
        </div>

        {/* Book Now Button */}
        <button
          // onClick={() => onBookNow(venue)}
          className="w-full mt-2 h-5 rounded-sm  border border-blue-600 hover:bg-blue-700 text-blue-600 text-[10px] justify-center flex items-center gap-1"
        >
          Book Now
        </button>
      </div>
    </Card>
          </div>
        ) : (
          <div
            className="flex gap-2 transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(-${scrollIndex * (100 / cardsPerView)}%)`,
            }}
          >
            {venues.map((venue, idx) => (
              <SmallVenueCard key={venue.id || idx} venue={venue} onBookNow={onBookNow} />
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}
