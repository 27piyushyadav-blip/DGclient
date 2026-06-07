// "use client";
// import { CalendarDays, MapPin, Clock } from "lucide-react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import type { Venue } from "@/app/main/data";

// interface SmallVenueCardProps {
//   venue: Venue;
//   onBookNow: (venue: Venue) => void;
// }

// export default function SmallVenueCard({ venue, onBookNow }: SmallVenueCardProps) {
//   return (
//     <Card className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
//       <div className="relative">
//         {/* Small thumbnail image */}
//         <div 
//           className="h-24 w-full bg-cover bg-center"
//           style={{ 
//             backgroundImage: venue.bgImage 
//               ? `url(${venue.bgImage.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "")})`
//               : "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')"
//           }}
//         />
        
//         {/* Status badge */}
//         <div className="absolute top-2 left-2">
//           <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
//             <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
//             <span className="text-[10px] font-medium text-white">Open</span>
//           </div>
//         </div>
//       </div>

//       <div className="p-2">
//         {/* Venue Name */}
//         <h3 className="text-xs font-bold text-slate-900 truncate leading-tight">
//           {venue.name}
//         </h3>
        
//         {/* Venue Type/Category */}
//         <p className="text-[10px] text-slate-500 mt-0.5 truncate">
//           {venue.category || "Earbudshop"}
//         </p>
        
//         {/* Accessories Tag */}
//         <div className="mt-1">
//           <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
//             Accessories
//           </span>
//         </div>

//         {/* Hours */}
//         <div className="flex items-center gap-1 mt-1.5">
//           <Clock className="h-2.5 w-2.5 text-slate-400" />
//           <span className="text-[9px] text-slate-500 truncate">
//             {venue.hours || "RAM - 7PM"}
//           </span>
//         </div>

//         {/* Book Now Button */}
//         <Button
//           onClick={() => onBookNow(venue)}
//           className="w-full mt-2 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium px-0"
//         >
//           <CalendarDays className="h-3 w-3 mr-1" />
//           Book Now
//         </Button>
//       </div>
//     </Card>
//   );
// }


"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Venue } from "@/app/main/data";

interface SmallVenueCardProps {
  venue: Venue;
  onBookNow: (venue: Venue) => void;
}

function SmallVenueCard({ venue, onBookNow }: SmallVenueCardProps) {
  return (
    <Card className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow flex-shrink-0 w-[calc(50%-0.5rem)]">
      <div className="relative">
        {/* Small thumbnail image */}
        <div 
          className="h-24 w-full bg-cover bg-center"
          style={{ 
            backgroundImage: venue.bgImage 
              ? `url(${venue.bgImage.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "")})`
              : "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')"
          }}
        />
        
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-medium text-white">Open</span>
          </div>
        </div>
      </div>

      <div className="p-2">
        {/* Venue Name */}
        <h3 className="text-xs font-bold text-slate-900 truncate leading-tight">
          {venue.name}
        </h3>
        
        {/* Venue Type/Category */}
        <p className="text-[10px] text-slate-500 mt-0.5 truncate">
          {venue.category || "Earbudshop"}
        </p>

        {/* Hours */}
        <div className="flex items-center gap-1 mt-1.5">
          <Clock className="h-2.5 w-2.5 text-slate-400" />
          <span className="text-[9px] text-slate-500 truncate">
            {venue.hours || "RAM - 7PM"}
          </span>
        </div>

        {/* Book Now Button */}
        <Button
          onClick={() => onBookNow(venue)}
          className="w-full mt-2 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium px-0"
        >
          <CalendarDays className="h-3 w-3 mr-1" />
          Book Now
        </Button>
      </div>
    </Card>
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

export default function VenueSlider({ venues, onBookNow, isLoading = false }: VenueSliderProps) {
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
      {/* Header with navigation buttons */}
      {/* <div className="flex items-center justify-between mb-4">
        <div className="flex justify-end items-end gap-2">
          <Button
            onClick={handlePrev}
            disabled={!canScrollPrev}
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canScrollNext}
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div> */}

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
