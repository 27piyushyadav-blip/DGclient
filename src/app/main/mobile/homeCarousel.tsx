"use client";
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Share2, PlayCircle, ShoppingBag, CornerUpRightIcon, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Venue } from "@/app/main/data";
import VideoModal from "@/components/modals/VideoModal";
import DirectionsIcon from '@mui/icons-material/Directions';
import { buildMobileBookingHref } from "./bookingRoute";
import Image from "next/image";
import { toast } from "sonner";

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
  Isphone?: boolean;
}


// Fallback images used only when organization has no uploaded banners
const FALLBACK_VIDEO_URL = "https://youtu.be/sRWcJrMTtMI?si=hbh0v0HYOocQsXrE";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1  571902943202-507ec2618e8f?q=80&w=2075&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
];

const stripCssUrl = (value?: string) => value
  ?.replace(/^url\(['"]?/, "")
  .replace(/['"]?\)$/, "") ?? "";

// Skeleton Component
function HomeCarouselSkeleton() {

  return (
    <Card className="overflow-hidden rounded-none border-0 shadow-none rounded-2xl">
      <div className="relative flex flex-col min-h-[200px] bg-white text-white">
        {/* Animated background skeleton */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-100 to-slate-300 animate-pulse" />

        {/* Share icon skeleton */}
        <div className="absolute right-27 top-5 z-20">
          <div className="h-4 w-4 bg-slate-300 rounded-full animate-pulse" />
        </div>

        {/* Hours badge skeleton */}
        <div className="absolute right-4 top-4 z-20">
          <div className="h-6 w-16 bg-slate300 rounded-full animate-pulse" />
        </div>

        {/* Content */}
        <div className="relative flex flex-1 flex-col justify-between z-10 pb-6">
          <div className="px-4 pt-12 ml-[3rem] space-y-3">
            {/* Title skeleton */}
            <div className="h-8 w-48 bg-slate-300 rounded-lg animate-pulse" />
            
            {/* View Store button skeleton */}
            {/* <div className="h-9 w-32 bg-slate-700 rounded-md animate-pulse" /> */}
          </div>

          <div className="px-4 mt-4 ml-[3rem] space-y-3">
            {/* Address skeleton */}
            {/* <div className="h-4 w-56 bg-slate-700 rounded animate-pulse" /> */}
            
            {/* Watch Now button skeleton */}
            {/* <div className="h-9 w-32 bg-slate-700 rounded-md animate-pulse" /> */}
          </div>

          {/* Bottom section with button and pagination */}
          <div className="px-4 mt-6 space-y-4">
            {/* Pagination dots skeleton */}
            {/* <div className="flex justify-center gap-1.5 z-20">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`rounded-full bg-slate-700 animate-pulse ${
                    idx === 1 ? "h-1.5 w-5" : "h-1.5 w-1.5"
                  }`}
                />
              ))}
            </div> */}

            {/* Book button skeleton */}
            <div className="h-12 w-full bg-slate-300 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function homeCarousel({
  sliderVenues,
  horizontalBanners = [],
  verticalBanners = [],
  isLoading = false,
  Isphone = false,
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

    const handleShare = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/main/specific/${activeVenue?.id}`;
    const shareData = {
      title: activeVenue?.name,
      text: activeVenue?.tagline || `Check out ${activeVenue?.name} on Mind Namo`,
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
      <Card className="overflow-hidden rounded-none border-1 shadow-none rounded-lg bg-white">
      <div className="bg-white rounded-md">
        <div className="rounded-md relative flex flex-col min-h-[120px] bg-slate-900 text-white">
          <div
            key={currentIndex}
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
            style={{ backgroundImage: `url(${activeSlide?.bgImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-black/20" />

          <Badge className="absolute right-6 top-1 bg-blue-600 text-white hover:bg-blue-600 z-20 text-[7px] px-2 py-0.5">
            {activeVenue?.hours}
          </Badge>

          <div className="absolute right-4 top-30 cursor-pointer z-20"
          onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const destination = activeVenue?.address;
                  if (!destination) return;
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`, "_blank");
                }}
          >
            <DirectionsIcon className="h-2 w-2 text-blue-600" />
          </div>

          <div className="absolute right-2 top-2 cursor-pointer z-20" onClick={handleShare}>
            <Share2 className="h-3 w-3 text-white" />
          </div>

          {totalSlides > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-0.5 top-30 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40 z-20"
                aria-label="Previous banner"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-0.5 top-30 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40 z-20"
                aria-label="Next banner"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          ?
        </div>
        <div className="relative flex flex-1 flex-col justify-between z-10 pb-1">  

            <div className="px-2 mt-1">
              <div className="flex items-center gap-2 ml-4">
                <Image
                  src={activeVenue?.logo ?? FALLBACK_IMAGES[currentIndex % FALLBACK_IMAGES.length]}
                  alt="Venue"
                  width={45}
                  height={45}
                  className="rounded-sm object-cover"
                />
              <div className="grid grid-cols-1 gap-1.5  z-10">
                <h1 className="text-[14px] font-bold tracking-tight leading-tight flex  items-left gap-1">
                {activeVenue?.name}
              </h1>
                <div className="flex items-center gap-1.5 text-xs font-medium text-white/90 z-10">
                <MapPin className="h-3 w-3 text-blue-400" />
                <span className="truncate max-w-[200px] text-[11px] text-black ">{activeVenue?.address}</span>
              </div>
              </div>
              </div>
              <div className="flex justify-between gap-1.5 mb-0 z-20 px-3">
              {!Isphone ? 
                <button className="flex items-center gap-1 text-[10px] font-medium text-black mt-2 z-10 border px-2 py-1.5 rounded-md  w-max cursor-pointer hover:bg-black/50 transition"
              onClick={() => router.push(`/main/mobile/specific/${activeVenue?.id}`)}>
                <ShoppingBag className="h-3 w-3 text-black/90" />
                <p>View Store</p>
              </button>
              :
              <button className="flex items-center gap-1 text-[10px] font-medium text-black mt-2 z-10 border px-2 py-1.5 rounded-md  w-max cursor-pointer hover:bg-black/50 transition"
              onClick={() => {
                if (activeVenue?.phone) {
                  window.location.assign(`tel:${activeVenue.phone}`);
                }
              }}>
                <Phone className="h-3 w-3 text-black/90" />
                <p>Call Now</p>
              </button>
              }
                <button
                onClick={() => setIsVideoModalOpen(true)}
                className="flex items-center gap-1 text-[10px] font-medium text-black mt-2 z-10 border px-2 py-1.5 rounded-md  w-max cursor-pointer hover:bg-black/50 transition"
              >
                <PlayCircle className="h-3 w-3 text-black/90" />
                <p >Watch Video</p>
              
              </button>

                <button
                onClick={() => router.push(buildMobileBookingHref(activeVenue?.id || sliderVenues[0].id))}
                className=" flex items-center gap-1 text-[10px] font-medium text-white/90 mt-2 z-10 border px-2 py-1.5 rounded-md bg-blue-600 w-max cursor-pointer hover:bg-black/50 transition"
              >
                <CalendarDays className="text-white/90 h-3 w-3" />
                Book Now
              </button>
              </div>
              {/* {totalSlides > 1 && (
                <div className="flex justify-center gap-1.5 mb-[-1rem] z-20">
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
              )} */}
            </div>
          </div>
          </div>
      </Card>

      {isVideoModalOpen ? (
        <VideoModal
          videoUrl={activeVenue?.videoUrl || FALLBACK_VIDEO_URL}
          onClose={() => setIsVideoModalOpen(false)}
        />
      ) : null}
    </>
  );
}
