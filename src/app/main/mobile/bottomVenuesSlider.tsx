"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, PlayCircle, Share2, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Venue } from "@/app/main/data";
import VideoModal from "@/components/modals/VideoModal";
import { Bad_Script } from "next/font/google";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { toast } from "sonner";

interface SmallVenueCardProps {
  venue: Venue;
  onBookNow: (venue: Venue) => void;
}

function SmallVenueCard({ venue, onBookNow }: SmallVenueCardProps) {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const router = useRouter();
    const venueCard = venue as Venue & { category?: string; videoUrl?: string };

    // Fallback images used only when organization has no uploaded banners
    const FALLBACK_IMAGES = [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
    ];

    const handleShare = async (venue: Venue, e: any) => {
    // e.preventDefault();
    // e.stopPropagation();
    const shareUrl = `${window.location.origin}/main/specific/${venue?.id}`;
    const shareData = {
      title: venue?.name,
      text: venue?.tagline || `Check out ${venue?.name} on Mind Namo`,
      url: shareUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link.");
      }
    }
  };

  return (
    <>
    <Card className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow flex-shrink-0 w-[calc(50%-0.5rem)]">
      <div className="relative">
        {/* Small thumbnail image */}
        <div 
          className="h-15 w-full bg-cover bg-center bg-black"
          style={{ 
            backgroundImage: venue.bgImage 
              ? `url(${venue.bgImage.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "")})`
              : "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')"
          }}
        >
           <div className="absolute inset-0 bg-black/40" /> 
         {/* <div className="relative z-10"> */}
        {/* Status badge */}
        <div className="absolute top-2 left-2 flex">
          <div className="flex items-center gap-1  backdrop-blur-sm rounded-full px-2 py-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            {/* <span className="text-[10px] font-medium text-white">Open</span> */}
          </div>
        </div>
        <div className="absolute top-0.5 right-2 flex gap-2 justify-center items-center">
          <div className="absolute right-10 bg-blue-600 text-white hover:bg-blue-600 z-20 text-[7px] min-w-[63px] flex items-center justify-center rounded-full py-[1px] px-[1px]">
            {venue?.hours}
          </div>
          <PlayCircle className="h-4 w-4 text-white" onClick={()=>setIsVideoModalOpen(true)} />
          <Share2 className="h-3 w-3 text-white" onClick={(e)=>handleShare(venue, e)}/>
        </div>
      

      

      {/* </div> */}

      </div>
      </div>


      <div className="px-2 py-1">
        {/* Venue Name */}
        <div className="flex">
          <Image
                            src={venue?.logo ?? FALLBACK_IMAGES[0]}
                            alt="Venue"
                            width={40}
                            height={40}
                            className="rounded-sm object-cover"
                          />
                          <div>
        <h3 className="text-[8px] font-bold text-black leading-tight ml-1">
          {venue.name}
        </h3>

        <h3 className="text-[5px] text-black truncate leading-tight flex items-center gap-1 ml-1">
          <MapPin className="h-2 w-2 text-blue-400" />
          {venue.address}
        </h3>
        </div>
        </div>

        {/* Book Now Button */}
        <div className=" flex justify-between gap-1">
        <button
          onClick={() => onBookNow(venue)}
          className="w-full mt-2 h-4 rounded-sm bg-blue-600 hover:bg-blue-700 text-white text-[7px] font-medium px-0 flex items-center justify-center align-middle"
        >
          <CalendarDays className="h-2 w-2 mr-1" />
          <p className="mt-[1px]">Book Now</p>
        </button>

        <Button
          onClick={() => router.push(`/main/mobile/specific/${venue.id}`)}
          className="w-full mt-2 h-4 rounded-sm bg-white hover:bg-blue-700 text-black text-[7px] font-medium px-0"
        >
          View
        </Button>
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
      <div className="h-15 w-full bg-slate-200" />

      <div className="p-2">
        <div className="h-3 w-3/4 rounded bg-slate-200" />
        <div className="mt-2 h-2.5 w-1/2 rounded bg-slate-100" />

        {/* <div className="mt-3 flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <div className="h-2.5 w-2/3 rounded bg-slate-100" />
        </div> */}
{/* 
        <div className="mt-2 h-2 w-full rounded-lg bg-slate-200" /> */}
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
          <div className="rounded-xl border border-dashed border-slate-200 bg-white text-center text-sm text-slate-500">
          <Card className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow flex-shrink-0 w-[calc(50%-0.5rem)]">
      <div className="relative">
        {/* Small thumbnail image */}
        <div 
          className="h-15 w-full bg-cover bg-center bg-black"
          style={{ 
            backgroundImage:"url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')"
          }}
        >
           <div className="absolute inset-0 bg-black/40" /> 
         {/* <div className="relative z-10"> */}
        {/* Status badge */}
        <div className="absolute top-2 left-2 flex">
          <div className="flex items-center gap-1  backdrop-blur-sm rounded-full px-2 py-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            {/* <span className="text-[10px] font-medium text-white">Open</span> */}
          </div>
        </div>
        <div className="absolute top-0.5 right-2 flex gap-2 justify-center items-center">
          <div className="absolute right-10 bg-blue-600 text-white hover:bg-blue-600 z-20 text-[5px] min-w-[47px] flex items-center justify-center rounded-full py-0.5 px-0.5">
            {"9:00AM-10:00PM"}
          </div>
          <PlayCircle className="h-4 w-4 text-white" />
          <Share2 className="h-3 w-3 text-white" />
        </div>
      

      

      {/* </div> */}

      </div>
      </div>


      <div className="px-2 py-1">
        {/* Venue Name */}
        <h3 className="text-[10px] font-bold text-black leading-tight">
          {"No venues found nearby"}
        </h3>

        <h3 className="text-[5px] text-black truncate leading-tight flex items-center gap-1">
          <MapPin className="h-2 w-2 text-blue-400" />
          {"No venues found nearby"}
        </h3>

        {/* Book Now Button */}
        <div className=" flex justify-between gap-1">
        <button
          // onClick={() => onBookNow(venue)}
          className="w-full mt-2 h-4 rounded-sm bg-blue-600 hover:bg-blue-700 text-white text-[7px] font-medium px-0 flex items-center justify-center align-middle"
        >
          <CalendarDays className="h-2 w-2 mr-1" />
          <p className="mt-[1px]">Book Now</p>
        </button>

        <Button
          // onClick={() => router.push(`/main/mobile/specific/${venue.id}`)}
          className="w-full mt-2 h-4 rounded-sm bg-white hover:bg-blue-700 text-black text-[7px] font-medium px-0"
        >
          View
        </Button>
        </div>
      </div>
    </Card>
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
