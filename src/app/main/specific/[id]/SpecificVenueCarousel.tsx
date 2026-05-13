// "use client";
// import { ChevronLeft, ChevronRight, CalendarDays, MapPin } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { useState } from "react";
// import type { Venue } from "@/app/main/data";
// import SpecificVenueBookingModal from "./SpecificVenueBookingModal";

// interface SpecificVenueCarouselProps {
//   sliderVenues: Venue[];
// }

// export default function SpecificVenueCarousel({ sliderVenues}: SpecificVenueCarouselProps) {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);




//   const handlePrev = () => {
//     setCurrentIndex((prev) => (prev === 0 ? sliderVenues.length - 1 : prev - 1));
//   };

//   const handleNext = () => {
//     setCurrentIndex((prev) => (prev === sliderVenues.length - 1 ? 0 : prev + 1));
//   };

//   const currentVenue = sliderVenues[currentIndex];

//   return (
//     <Card className="overflow-hidden rounded-[30px] border-slate-200 shadow-sm">
//       <div className={`relative min-h-[290px] bg-gradient-to-br ${currentVenue.accent} p-6 text-white md:p-8`}>
//         <div
//           className="absolute inset-0 bg-cover bg-center opacity-45"
//           style={{
//             backgroundImage: "url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop')",
//           }}
//         />
//         <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
//         <Badge className="absolute right-4 top-4 bg-blue-600 text-white hover:bg-blue-600">
//           {currentVenue.hours}
//         </Badge>
//         <button 
//           onClick={handlePrev}
//           className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg hover:bg-slate-100 transition z-10"
//         >
//           <ChevronLeft className="h-5 w-5" />
//         </button>
//         <button 
//           onClick={handleNext}
//           className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg hover:bg-slate-100 transition z-10"
//         >
//           <ChevronRight className="h-5 w-5" />
//         </button>

//         <div className="relative flex h-full flex-col justify-between ml-10">
//           <div>
//             <h1 className="text-4xl font-bold">{currentVenue.name}</h1>
//             <p className="mt-2 text-2xl italic text-white/90">{currentVenue.tagline}</p>
//             <p className="mt-6 max-w-md text-base leading-7 text-white/90">{currentVenue.description}</p>
//           </div>

//           <div className="flex flex-wrap items-end justify-between gap-4">
//             <div className="flex items-center gap-2 text-white/95">
//               <MapPin className="h-4 w-4" />
//               <span>{currentVenue.address}</span>
//             </div>

//             <div className="flex items-center gap-3">
//               <div className="flex gap-2">
//                 {sliderVenues.map((_, idx) => (
//                   <button
//                     key={idx}
//                     onClick={() => setCurrentIndex(idx)}
//                     className={`h-2.5 w-2.5 rounded-full transition ${
//                       idx === currentIndex ? "bg-white" : "bg-white/45 hover:bg-white/70"
//                     }`}
//                   />
//                 ))}
//               </div>
//               <Button
//                 onClick={() => setIsBookingModalOpen(true)}
//                 className="rounded-xl bg-blue-600 px-5 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700"
//               >
//                 <CalendarDays className="h-4 w-4" />
//                 Book Now
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//       <SpecificVenueBookingModal
//         open={isBookingModalOpen}
//         onOpenChange={(open) => {
//           setIsBookingModalOpen(open);
//         }}
//         venue={currentVenue}
//       />
//     </Card>
//   );
// }

"use client";
import { ChevronLeft, ChevronRight, CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import type { Venue } from "@/app/main/data";
import SpecificVenueBookingModal from "./SpecificVenueBookingModal";

interface SpecificVenueCarouselProps {
  sliderVenues: Venue[];
}

// Dummy background images to use as fallbacks
const DUMMY_IMAGES = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=2075&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
];

export default function SpecificVenueCarousel({ sliderVenues }: SpecificVenueCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Use the first venue for static content
  const staticVenue = sliderVenues[0];
  const currentImageVenue = sliderVenues[currentImageIndex];

  // This ensures we always have an image, even if currentImageVenue.bgImage is missing
  const activeBgImage = DUMMY_IMAGES[currentImageIndex % DUMMY_IMAGES.length];

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? sliderVenues.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === sliderVenues.length - 1 ? 0 : prev + 1));
  };

  return (
    <Card className="overflow-hidden rounded-[30px] border-slate-200 shadow-sm">
      <div className={`relative min-h-[350px] bg-slate-900 p-6 text-white md:p-8`}>
        
        {/* Dynamic Background Image */}
        <div
          key={currentImageIndex} // Key helps React identify when to re-run transitions
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
          style={{
            backgroundImage: `url('${activeBgImage}')`,
          }}
        />
        
        {/* Overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-black/20" />
        
        <Badge className="absolute right-6 top-6 bg-blue-600 text-white hover:bg-blue-600 z-20">
          {staticVenue.hours}
        </Badge>
        
        {/* Navigation Buttons */}
        <button 
          onClick={handlePrev}
          className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40 z-20"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <button 
          onClick={handleNext}
          className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40 z-20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Static Content */}
        <div className="relative flex h-full flex-col justify-between z-10">
          <div className="pl-8 pr-8">
            <h1 className="text-4xl font-bold tracking-tight">{staticVenue.name}</h1>
            <p className="mt-2 text-xl italic text-blue-200">{staticVenue.tagline}</p>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/80 line-clamp-3">
              {staticVenue.description}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pl-8">
            <div className="flex items-center gap-2 text-sm font-medium text-white/90">
              <MapPin className="h-4 w-4 text-blue-400" />
              <span>{staticVenue.address}</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Pagination Dots */}
              <div className="flex gap-1.5">
                {sliderVenues.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      idx === currentImageIndex ? "w-6 bg-blue-500" : "bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
              
              <Button
                onClick={() => setIsBookingModalOpen(true)}
                className="rounded-full bg-blue-600 px-6 font-semibold text-white shadow-xl hover:bg-blue-700"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <SpecificVenueBookingModal
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        venue={staticVenue}
      />
    </Card>
  );
}