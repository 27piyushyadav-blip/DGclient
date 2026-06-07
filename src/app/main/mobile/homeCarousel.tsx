// "use client";
// import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Share2, PlayCircle, ShoppingBag } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { useState, useEffect } from "react";
// import type { Venue } from "@/app/main/data";
// import SpecificVenueBookingModal from "../specific/[id]/SpecificVenueBookingModal";

// interface HorizontalBanner {
//   imageUrl: string;
//   title?: string;
//   description?: string;
//   clickThroughUrl?: string;
// }

// interface homeCarouselProps {
//   sliderVenues: Venue[];
//   horizontalBanners?: HorizontalBanner[];
//   verticalBanners?: HorizontalBanner[];
// }

// // Fallback images used only when organization has no uploaded banners
// const FALLBACK_IMAGES = [
//   "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
//   "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=2070&auto=format&fit=crop",
//   "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=2075&auto=format&fit=crop",
//   "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
// ];


// export default function homeCarousel({
//   sliderVenues,
//   horizontalBanners = [],
//   verticalBanners = [],
// }: homeCarouselProps) {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
//   const [isAnimating, setIsAnimating] = useState(false);

//   // Use the first venue for static content (name, tagline, address, etc.)
//   const staticVenue = sliderVenues[0];

//   // Build the list of banner images to cycle through:
//   // Priority: org horizontal banners → venue cover image → fallback Unsplash images
//   const bannerImages: string[] = horizontalBanners.length > 0
//     ? horizontalBanners.map((b) => b.imageUrl)
//     : (() => {
//         const coverUrl = staticVenue?.bgImage?.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "");
//         if (coverUrl && !coverUrl.includes("unsplash")) {
//           return [coverUrl, ...FALLBACK_IMAGES.slice(0, 3)];
//         }
//         return FALLBACK_IMAGES;
//       })();

//   const totalSlides = bannerImages.length;

//   // Auto-advance every 4 seconds when there are multiple banners
//   useEffect(() => {
//     if (totalSlides <= 1) return;
//     const timer = setInterval(() => {
//       goNext();
//     }, 4000);
//     return () => clearInterval(timer);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentIndex, totalSlides]);

//   const goTo = (index: number) => {
//     if (isAnimating) return;
//     setIsAnimating(true);
//     setCurrentIndex(index);
//     setTimeout(() => setIsAnimating(false), 600);
//   };

//   const goPrev = () => {
//     goTo(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
//   };

//   const goNext = () => {
//     goTo(currentIndex === totalSlides - 1 ? 0 : currentIndex + 1);
//   };

//   const activeBgImage = bannerImages[currentIndex];
//   const currentBanner = horizontalBanners[currentIndex];

//   return (
//     <Card className="overflow-hidden rounded-none border-0 shadow-none rounded-2xl">
//       <div className="relative flex flex-col min-h-[200px] bg-slate-900 text-white">
//         {/* Dynamic Background — real org banner image */}
//         <div
//           key={currentIndex}
//           className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
//           style={{ backgroundImage: `url('${activeBgImage}')` }}
//         />

//         {/* Gradient overlays for text readability */}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
//         <div className="absolute inset-0 bg-black/20" />

//         {/* Share icon */}
//         <div className="absolute right-27 top-5 cursor-pointer z-20">
//           <Share2 className="h-4 w-4 text-white" />
//         </div>

//         {/* Hours badge */}
//         <Badge className="absolute right-4 top-4 bg-blue-600 text-white hover:bg-blue-600 z-20 text-xs px-2 py-0.5">
//           {staticVenue.hours}
//         </Badge>

//         {/* Navigation — only show when multiple slides, positioned for mobile */}
//         {totalSlides > 1 && (
//           <>
//             <button
//               onClick={goPrev}
//               className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40 z-20"
//               aria-label="Previous banner"
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </button>
//             <button
//               onClick={goNext}
//               className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40 z-20"
//               aria-label="Next banner"
//             >
//               <ChevronRight className="h-4 w-4" />
//             </button>
//           </>
//         )}

//         {/* Content */}
//         <div className="relative flex flex-1 flex-col justify-between z-10 pb-6">
//           <div className="px-4 pt-12 ml-[3rem]">
//             <h1 className="text-2xl font-bold tracking-tight leading-tight">
//               {staticVenue.name}
//             </h1>
//             <div className="flex items-center gap-2 text-xs font-medium text-white/90 mt-2 z-10 border px-3 py-1.5 rounded-md bg-black/30 w-max">
//               <ShoppingBag className="h-4 w-4 text-white/90 cursor-pointer z-10" />
//               <p>View Store</p>
//             </div>
//           </div>

//           <div className="px-4 mt-4 ml-[3rem]">
//             <div className="flex items-center gap-1.5 text-xs font-medium text-white/90 z-10">
//               <MapPin className="h-3 w-3 text-blue-400" />
//               <span className="truncate max-w-[200px]">{staticVenue.address}</span>
//             </div>
//             <div className="flex items-center gap-2 text-xs font-medium text-white/90 mt-2 z-10 border px-3 py-1.5 rounded-md bg-black/30 w-max">
//               <PlayCircle className="h-4 w-4 text-white/90 cursor-pointer z-10" />
//               <p>Watch Now</p>
//             </div>
//           </div>

//           {/* Bottom section with button and pagination */}
//           <div className="px-4 mt-6">
//             {/* Pagination dots */}
//             {totalSlides > 1 && (
//               <div className="flex justify-center gap-1.5 mb-4 z-20">
//                 {bannerImages.map((_, idx) => (
//                   <button
//                     key={idx}
//                     onClick={() => goTo(idx)}
//                     aria-label={`Go to slide ${idx + 1}`}
//                     className={`h-1.5 rounded-full transition-all ${
//                       idx === currentIndex
//                         ? "w-5 bg-blue-500"
//                         : "w-1.5 bg-white/30 hover:bg-white/60"
//                     }`}
//                   />
//                 ))}
//               </div>
//             )}

//             <Button
//               onClick={() => setIsBookingModalOpen(true)}
//               className="w-full rounded-full bg-blue-600 py-5 font-semibold text-white shadow-xl hover:bg-blue-700 z-10 text-sm"
//             >
//               <CalendarDays className="mr-2 h-4 w-4" />
//               Book Now
//             </Button>
//           </div>
//         </div>
//       </div>

//       <SpecificVenueBookingModal
//         open={isBookingModalOpen}
//         onOpenChange={setIsBookingModalOpen}
//         venue={staticVenue}
//         verticalBannerUrl={verticalBanners[0]?.imageUrl}
//       />
//     </Card>
//   );
// }



"use client";
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Share2, PlayCircle, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Venue } from "@/app/main/data";
import VideoModal from "@/components/modals/VideoModal";
import { buildMobileBookingHref } from "./bookingRoute";

interface HorizontalBanner {
  imageUrl: string;
  title?: string;
  description?: string;
  clickThroughUrl?: string;
}

interface homeCarouselProps {
  sliderVenues: Venue[];
  horizontalBanners?: HorizontalBanner[];
  verticalBanners?: HorizontalBanner[];
  isLoading?: boolean;
}

// Fallback images used only when organization has no uploaded banners
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=2075&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
];

const stripCssUrl = (value?: string) => value
  ?.replace(/^url\(['"]?/, "")
  .replace(/['"]?\)$/, "") ?? "";

// Skeleton Component
function HomeCarouselSkeleton() {
  return (
    <Card className="overflow-hidden rounded-none border-0 shadow-none rounded-2xl">
      <div className="relative flex flex-col min-h-[200px] bg-slate-900 text-white">
        {/* Animated background skeleton */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 animate-pulse" />

        {/* Share icon skeleton */}
        <div className="absolute right-27 top-5 z-20">
          <div className="h-4 w-4 bg-slate-700 rounded-full animate-pulse" />
        </div>

        {/* Hours badge skeleton */}
        <div className="absolute right-4 top-4 z-20">
          <div className="h-6 w-16 bg-slate-700 rounded-full animate-pulse" />
        </div>

        {/* Content */}
        <div className="relative flex flex-1 flex-col justify-between z-10 pb-6">
          <div className="px-4 pt-12 ml-[3rem] space-y-3">
            {/* Title skeleton */}
            <div className="h-8 w-48 bg-slate-700 rounded-lg animate-pulse" />
            
            {/* View Store button skeleton */}
            <div className="h-9 w-32 bg-slate-700 rounded-md animate-pulse" />
          </div>

          <div className="px-4 mt-4 ml-[3rem] space-y-3">
            {/* Address skeleton */}
            <div className="h-4 w-56 bg-slate-700 rounded animate-pulse" />
            
            {/* Watch Now button skeleton */}
            <div className="h-9 w-32 bg-slate-700 rounded-md animate-pulse" />
          </div>

          {/* Bottom section with button and pagination */}
          <div className="px-4 mt-6 space-y-4">
            {/* Pagination dots skeleton */}
            <div className="flex justify-center gap-1.5 z-20">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`rounded-full bg-slate-700 animate-pulse ${
                    idx === 1 ? "h-1.5 w-5" : "h-1.5 w-1.5"
                  }`}
                />
              ))}
            </div>

            {/* Book button skeleton */}
            <div className="h-12 w-full bg-slate-700 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </Card>
  );
}

// export default function homeCarousel({
//   sliderVenues,
//   horizontalBanners = [],
//   verticalBanners = [],
//   isLoading = false,
// }: homeCarouselProps) {
//  const [currentIndex, setCurrentIndex] = useState(0);
//   const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
//   const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
//   const [isAnimating, setIsAnimating] = useState(false);

//   // Calculate values early so hooks don't depend on early return
//   const staticVenue = sliderVenues?.[0];
//   const bannerImages: string[] = horizontalBanners.length > 0
//     ? horizontalBanners.map((b) => b.imageUrl)
//     : (() => {
//         const coverUrl = staticVenue?.bgImage?.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "");
//         if (coverUrl && !coverUrl.includes("unsplash")) {
//           return [coverUrl, ...FALLBACK_IMAGES.slice(0, 3)];
//         }
//         return FALLBACK_IMAGES;
//       })();

//   const totalSlides = bannerImages.length;


//   // Now the early return is safe
//   if (isLoading || !sliderVenues || sliderVenues.length === 0) {
//     return <HomeCarouselSkeleton />;
//   }

//   const goTo = (index: number) => {
//     if (isAnimating) return;
//     setIsAnimating(true);
//     setCurrentIndex(index);
//     setTimeout(() => setIsAnimating(false), 600);
//   };

//   const goPrev = () => {
//     goTo(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
//   };

//   const goNext = () => {
//     goTo(currentIndex === totalSlides - 1 ? 0 : currentIndex + 1);
//   };

//   const activeBgImage = bannerImages[currentIndex];

//   // Move useEffect BEFORE early return
//   useEffect(() => {
//     if (totalSlides <= 1) return;
//     const timer = setInterval(() => {
//       goNext();
//     }, 4000);
//     return () => clearInterval(timer);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentIndex, totalSlides]);

//   return (
//     <>
//       <Card className="overflow-hidden rounded-none border-0 shadow-none rounded-2xl">
//         <div className="relative flex flex-col min-h-[200px] bg-slate-900 text-white">
//           {/* Dynamic Background — real org banner image */}
//           <div
//             key={currentIndex}
//             className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
//             style={{ backgroundImage: `url('${activeBgImage}')` }}
//           />

//           {/* Gradient overlays for text readability */}
//           <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
//           <div className="absolute inset-0 bg-black/20" />

//           {/* Share icon */}
//           <div className="absolute right-27 top-5 cursor-pointer z-20">
//             <Share2 className="h-4 w-4 text-white" />
//           </div>

//           {/* Hours badge */}
//           <Badge className="absolute right-4 top-4 bg-blue-600 text-white hover:bg-blue-600 z-20 text-xs px-2 py-0.5">
//             {staticVenue.hours}
//           </Badge>

//           {/* Navigation — only show when multiple slides, positioned for mobile */}
//           {totalSlides > 1 && (
//             <>
//               <button
//                 onClick={goPrev}
//                 className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40 z-20"
//                 aria-label="Previous banner"
//               >
//                 <ChevronLeft className="h-4 w-4" />
//               </button>
//               <button
//                 onClick={goNext}
//                 className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40 z-20"
//                 aria-label="Next banner"
//               >
//                 <ChevronRight className="h-4 w-4" />
//               </button>
//             </>
//           )}

//           {/* Content */}
//           <div className="relative flex flex-1 flex-col justify-between z-10 pb-6">
//             <div className="px-4 pt-12 ml-[3rem]">
//               <h1 className="text-2xl font-bold tracking-tight leading-tight">
//                 {staticVenue.name}
//               </h1>
//               <div className="flex items-center gap-2 text-xs font-medium text-white/90 mt-2 z-10 border px-3 py-1.5 rounded-md bg-black/30 w-max cursor-pointer hover:bg-black/50 transition">
//                 <ShoppingBag className="h-4 w-4 text-white/90" />
//                 <p>View Store</p>
//               </div>
//             </div>

//             <div className="px-4 mt-4 ml-[3rem]">
//               <div className="flex items-center gap-1.5 text-xs font-medium text-white/90 z-10">
//                 <MapPin className="h-3 w-3 text-blue-400" />
//                 <span className="truncate max-w-[200px]">{staticVenue.address}</span>
//               </div>
//               <button
//                 onClick={() => setIsVideoModalOpen(true)}
//                 className="flex items-center gap-2 text-xs font-medium text-white/90 mt-2 z-10 border px-3 py-1.5 rounded-md bg-black/30 w-max cursor-pointer hover:bg-black/50 transition"
//               >
//                 <PlayCircle className="h-4 w-4 text-white/90" />
//                 <p>Watch Now</p>
//               </button>
//             </div>

//             {/* Bottom section with button and pagination */}
//             <div className="px-4 mt-6">
//               {/* Pagination dots */}
//               {totalSlides > 1 && (
//                 <div className="flex justify-center gap-1.5 mb-4 z-20">
//                   {bannerImages.map((_, idx) => (
//                     <button
//                       key={idx}
//                       onClick={() => goTo(idx)}
//                       aria-label={`Go to slide ${idx + 1}`}
//                       className={`h-1.5 rounded-full transition-all ${
//                         idx === currentIndex
//                           ? "w-5 bg-blue-500"
//                           : "w-1.5 bg-white/30 hover:bg-white/60"
//                       }`}
//                     />
//                   ))}
//                 </div>
//               )}

//               <Button
//                 onClick={() => setIsBookingModalOpen(true)}
//                 className="w-full rounded-full bg-blue-600 py-5 font-semibold text-white shadow-xl hover:bg-blue-700 z-10 text-sm"
//               >
//                 <CalendarDays className="mr-2 h-4 w-4" />
//                 Book Now
//               </Button>
//             </div>
//           </div>
//         </div>
//       </Card>

//       {/* Video Modal */}
//       {isVideoModalOpen && staticVenue.videoUrl && (
//         <VideoModal
//           videoUrl={staticVenue.videoUrl}
//           onClose={() => setIsVideoModalOpen(false)}
//         />
//       )}

//       {/* Booking Modal */}
//       <SpecificVenueBookingModal
//         open={isBookingModalOpen}
//         onOpenChange={setIsBookingModalOpen}
//         venue={staticVenue}
//         verticalBannerUrl={verticalBanners[0]?.imageUrl}
//       />
//     </>
//   );
// }

export default function homeCarousel({
  sliderVenues,
  horizontalBanners = [],
  verticalBanners = [],
  isLoading = false,
}: homeCarouselProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Keep each slide tied to the matching organization so content and imagery stay in sync.
  const slideItems = (sliderVenues ?? []).map((venue, index) => {
    const normalizedBgImage = stripCssUrl(venue.bgImage);
    const bannerImage = horizontalBanners[index]?.imageUrl;

    return {
      venue,
      bgImage: normalizedBgImage || bannerImage || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
      banner: horizontalBanners[index],
    };
  });

  const totalSlides = slideItems.length;
  const activeSlide = slideItems[currentIndex] ?? slideItems[0] ?? null;
  const activeVenue = (activeSlide?.venue ?? sliderVenues?.[0] ?? null) as (Venue & { videoUrl?: string }) | null;

  // Navigation helpers must be declared before useEffect so hooks order doesn't change
  const goTo = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const goPrev = () => {
    goTo(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
  };

  const goNext = () => {
    goTo(currentIndex === totalSlides - 1 ? 0 : currentIndex + 1);
  };

  // Timer effect declared before any conditional returns
  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      goNext();
    }, 4000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, totalSlides]);

  useEffect(() => {
    if (totalSlides > 0 && currentIndex >= totalSlides) {
      setCurrentIndex(0);
    }
  }, [currentIndex, totalSlides]);

  // Early return for skeleton — safe because all hooks and derived values are declared above
  if (isLoading || !sliderVenues || sliderVenues.length === 0) {
    return <HomeCarouselSkeleton />;
  }

  return (
    <>
      <Card className="overflow-hidden rounded-none border-0 shadow-none rounded-2xl">
        <div className="relative flex flex-col min-h-[200px] bg-slate-900 text-white">
          <div
            key={currentIndex}
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
            style={{ backgroundImage: `url('${activeSlide?.bgImage ?? FALLBACK_IMAGES[0]}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-black/20" />

          <Badge className="absolute right-8 top-4 bg-blue-600 text-white hover:bg-blue-600 z-20 text-xs px-2 py-0.5">
            {activeVenue?.hours}
          </Badge>

          <div className="absolute right-2 top-[18px] cursor-pointer z-20">
            <Share2 className="h-4 w-4 text-white" />
          </div>

          {totalSlides > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40 z-20"
                aria-label="Previous banner"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40 z-20"
                aria-label="Next banner"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          <div className="relative flex flex-1 flex-col justify-between z-10 pb-6">
            <div className="px-4 pt-12 ml-[3rem]">
              <h1 className="text-lg font-bold tracking-tight leading-tight">
                {activeVenue?.name}
              </h1>
              <div className="flex items-center gap-2 text-xs font-medium text-white/90 mt-3 z-10 border px-3 py-1.5 rounded-md bg-black/30 w-max cursor-pointer hover:bg-black/50 transition"
              onClick={() => router.push(`/main/mobile/specific/${activeVenue?.id}`)}>
                <ShoppingBag className="h-4 w-4 text-white/90" />
                <p>View Store</p>
              </div>
            </div>

            <div className="px-4 mt-4 ml-[3rem]">
              <div className="flex items-center gap-1.5 text-xs font-medium text-white/90 z-10">
                <MapPin className="h-3 w-3 text-blue-400" />
                <span className="truncate max-w-[200px]">{activeVenue?.address}</span>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="flex items-center gap-2 text-xs font-medium text-white/90 mt-2 z-10 border px-3 py-1.5 rounded-md bg-black/30 w-max cursor-pointer hover:bg-black/50 transition"
              >
                <PlayCircle className="h-4 w-4 text-white/90" />
                <p>Watch Now</p>
              </button>
            </div>

            <div className="px-4 mt-6">
              {totalSlides > 1 && (
                <div className="flex justify-center gap-1.5 mb-4 z-20">
                  {slideItems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goTo(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentIndex
                          ? "w-5 bg-blue-500"
                          : "w-1.5 bg-white/30 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              )}

              <Button
                onClick={() => router.push(buildMobileBookingHref(activeVenue?.id || sliderVenues[0].id))}
                className="w-full rounded-full bg-blue-600 py-5 font-semibold text-white shadow-xl hover:bg-blue-700 z-10 text-sm"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {isVideoModalOpen && activeVenue?.videoUrl && (
        <VideoModal
          videoUrl={activeVenue.videoUrl}
          onClose={() => setIsVideoModalOpen(false)}
        />
      )}
    </>
  );
}
