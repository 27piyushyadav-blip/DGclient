"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, PlayCircle, Share2 } from "lucide-react";
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
    const router = useRouter();
    const venueCard = venue as Venue & { category?: string; videoUrl?: string };
  return (
    <>
    <Card className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow flex-shrink-0 w-[calc(50%-0.5rem)]">
      <div className="relative">
        {/* Small thumbnail image */}
        <div 
          className="h-full w-full bg-cover bg-center bg-black"
          style={{ 
            backgroundImage: venue.bgImage 
              ? `url(${venue.bgImage.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "")})`
              : "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')"
          }}
        >
           
        
        {/* Status badge */}
        <div className="absolute top-2 left-2 flex">
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-medium text-white">Open</span>
          </div>
        </div>
        <div className="absolute top-2 right-2 flex gap-2 justify-center items-center">
          <PlayCircle className="h-4 w-4 text-white" onClick={()=>setIsVideoModalOpen(true)} />
          <Share2 className="h-3 w-3 text-white" />
        </div>
      

      <div className="p-2 ">
        {/* Venue Name */}
        <h3 className="text-xs font-bold text-white truncate leading-tight  mt-5">
          {venue.name}
        </h3>
        
        {/* Venue Type/Category */}
        <p className="text-[10px] text-white mt-0.5 truncate">
          {venueCard.category || "Earbudshop"}
        </p>

        {/* Hours */}
        <div className="flex items-center gap-1 mt-1.5">
          <Clock className="h-2.5 w-2.5 text-white" />
          <span className="text-[9px] text-white truncate">
            {venue.hours || "RAM - 7PM"}
          </span>
        </div>

        {/* Book Now Button */}
        <div className="mt-2 flex justify-between gap-1">
        <Button
          onClick={() => onBookNow(venue)}
          className="w-full mt-2 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium px-0"
        >
          Book Now
        </Button>

        <Button
          onClick={() => router.push(`/main/mobile/specific/${venue.id}`)}
          className="w-full mt-2 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium px-0"
        >
          View
        </Button>
        </div>
      </div>
      </div>
      </div>
    </Card>
    {isVideoModalOpen && venueCard?.videoUrl && (
            <VideoModal
              videoUrl={venueCard.videoUrl}
              onClose={() => setIsVideoModalOpen(false)}
            />
          )}
          </>
  );
}

function SmallVenueCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white flex-shrink-0 w-[calc(50%-0.5rem)] animate-pulse">
      <div className="h-24 w-full bg-slate-200" />

      <div className="p-2">
        <div className="h-3 w-3/4 rounded bg-slate-200" />
        <div className="mt-2 h-2.5 w-1/2 rounded bg-slate-100" />

        <div className="mt-3 flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <div className="h-2.5 w-2/3 rounded bg-slate-100" />
        </div>

        <div className="mt-2 h-7 w-full rounded-lg bg-slate-200" />
      </div>
    </Card>
  );
}

interface VenueSliderProps {
  venues: Venue[];
  onBookNow: (venue: Venue) => void;
  isLoading?: boolean;
}

export default function BottomVenueSlider({ venues, onBookNow, isLoading = false }: VenueSliderProps) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(2);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardWidthRef = useRef<number>(0);

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

  const canScrollPrev = scrollIndex > 0;
  const canScrollNext = scrollIndex < maxIndex;
  const showSkeleton = isLoading;

  return (
    <div className="w-full  py-1 overflow-x-hidden">

      {/* Slider Container */}
      <div className="relative overflow-x-scroll scroll-smooth scrollbar-hidden" ref={containerRef}>
        {showSkeleton ? (
          <div className="flex gap-4">
            <SmallVenueCardSkeleton />
            <SmallVenueCardSkeleton />
          </div>
        ) : venues.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
            No venues found.
          </div>
        ) : (
          <div
            className="flex gap-4 transition-transform duration-300 ease-out"
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
