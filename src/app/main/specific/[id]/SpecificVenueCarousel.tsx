"use client";
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Venue } from "@/app/main/data";
import SpecificVenueBookingModal from "./SpecificVenueBookingModal";

interface HorizontalBanner {
  imageUrl: string;
  title?: string;
  description?: string;
  clickThroughUrl?: string;
}

interface SpecificVenueCarouselProps {
  sliderVenues: Venue[];
  horizontalBanners?: HorizontalBanner[];
  verticalBanners?: HorizontalBanner[];
}

// Fallback images used only when organization has no uploaded banners
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=2075&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
];

export default function SpecificVenueCarousel({
  sliderVenues,
  horizontalBanners = [],
  verticalBanners = [],
}: SpecificVenueCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Use the first venue for static content (name, tagline, address, etc.)
  const staticVenue = sliderVenues?.[0];

  if (!staticVenue) {
    return null;
  }

  const handleShare = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: staticVenue.name,
      text: staticVenue.tagline || `Check out ${staticVenue.name} on Mind Namo`,
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

  // Build the list of banner images to cycle through:
  // Priority: org horizontal banners → venue cover image → fallback Unsplash images
  const bannerImages: string[] = horizontalBanners.length > 0
    ? horizontalBanners.map((b) => b.imageUrl)
    : (() => {
        const coverUrl = staticVenue?.bgImage?.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "");
        if (coverUrl && !coverUrl.includes("unsplash")) {
          return [coverUrl, ...FALLBACK_IMAGES.slice(0, 3)];
        }
        return FALLBACK_IMAGES;
      })();

  const totalSlides = bannerImages.length;

  // Auto-advance every 4 seconds when there are multiple banners
  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      goNext();
    }, 4000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, totalSlides]);

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

  const activeBgImage = bannerImages[currentIndex];
  const currentBanner = horizontalBanners[currentIndex];

  return (
    <Card className="overflow-hidden rounded-[30px] border-slate-200 shadow-sm">
      <div className="relative flex flex-col min-h-[350px] bg-slate-900 p-6 text-white md:p-8">
        {/* Dynamic Background — real org banner image */}
        <div
          key={currentIndex}
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
          style={{ backgroundImage: `url('${activeBgImage}')` }}
        />

        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-black/10" />

        {/* Share icon */}
        <button
          type="button"
          onClick={handleShare}
          className="absolute right-36 top-6 cursor-pointer z-20 flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          aria-label="Share page"
        >
          <Share2 className="h-5 w-5 text-white" />
        </button>

        {/* Hours badge */}
        <Badge className="absolute right-6 top-6 bg-blue-600 text-white hover:bg-blue-600 z-20">
          {staticVenue.hours}
        </Badge>

        {/* Navigation — only show when multiple slides */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40 z-20"
              aria-label="Previous banner"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40 z-20"
              aria-label="Next banner"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Content */}
        <div className="relative flex flex-1 flex-col justify-between z-10">
          <div className="pl-8 pr-8">
            <h1 className="text-4xl font-bold tracking-tight">
              {staticVenue.name}
            </h1>
            <p className="mt-2 text-xl italic text-blue-200">
              {currentBanner?.title || staticVenue.tagline}
            </p>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/80 line-clamp-3">
              {currentBanner?.description || staticVenue.description}
            </p>
          </div>

          <div className="mt-8 relative flex items-center justify-between gap-4 pl-8 pr-8">
            <button
              onClick={() => {
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(staticVenue.address)}`, "_blank");
              }}
              className="flex items-center gap-2 text-sm font-medium text-white/90 z-10 hover:text-blue-200 transition-colors cursor-pointer"
            >
              <MapPin className="h-4 w-4 text-blue-400" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{staticVenue.address}</span>
            </button>

            {/* Pagination dots — centered horizontally */}
            {totalSlides > 1 && (
              <div className="absolute left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {bannerImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goTo(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? "w-6 bg-blue-500"
                        : "w-2 bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}

            <Button
              onClick={() => setIsBookingModalOpen(true)}
              className="rounded-full bg-blue-600 px-6 font-semibold text-white shadow-xl hover:bg-blue-700 z-10 shrink-0"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Book Now
            </Button>
          </div>
        </div>
      </div>

      <SpecificVenueBookingModal
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        venue={staticVenue}
        verticalBannerUrl={verticalBanners[0]?.imageUrl}
      />
    </Card>
  );
}
