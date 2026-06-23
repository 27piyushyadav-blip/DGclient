"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  PlayCircle,
  Share2,
  Star,
  UserRound,
  MoreHorizontal,
  SearchIcon,
  Sheet,
  SlidersHorizontal,
} from "lucide-react";

import type { Venue } from "@/app/main/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import VideoModal from "@/components/modals/VideoModal";
import MessageDialog from "@/app/main/specific/[id]/MessageDialog";
import SpecificVenueBookingModal from "@/app/main/specific/[id]/SpecificVenueBookingModal";
import VideoControls from "@/components/video/VideoControls";
import HomeCarousel from "../../homeCarousel";

type VenueBanner = {
  imageUrl: string;
  title?: string;
  description?: string;
  clickThroughUrl?: string;
};

type MobileSpecificVenueClientProps = {
  venue: Venue;
  suggestions: Venue[];
  sliderVenues: Venue[];
  horizontalBanners?: VenueBanner[];
  verticalBanners?: VenueBanner[];
};

const extractCssUrl = (value?: string) =>
  value?.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "") ?? "";

const sectionTitleClass = "text-sm font-bold tracking-tight text-slate-900";

function MobileHorizontalTitle({
  title,
  actionLabel,
}: {
  title: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between px-2">
      <h2 className={sectionTitleClass}>{title}</h2>
      {actionLabel ? (
        <button type="button" className="text-xs font-semibold text-blue-600">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function MobilePillButton({
  icon: Icon,
  onClick,
  text: text,
}: {
  icon: any;
  onClick?: () => void;
  text: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-0.5 text-[10px] font-medium text-black mt-2 z-10 border px-2 py-1.5 rounded-md  w-max cursor-pointer hover:bg-black/50 transition text-white"
    >
      <Icon className="h-3 w-3 text-white/90" />
      {text}
    </button>
  );
}

export default function MobileSpecificVenueClient({
  venue,
  suggestions,
  sliderVenues,
  horizontalBanners = [],
  verticalBanners = [],
}: MobileSpecificVenueClientProps) {
  const venueWithExtras = venue as Venue;
  const [heroIndex, setHeroIndex] = useState(0);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<any>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedStaffForMessage, setSelectedStaffForMessage] = useState<any>(null);
  const [selectedStaffForBooking, setSelectedStaffForBooking] = useState<any>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const heroImages = useMemo(() => {
    const images = [
      ...horizontalBanners.map((banner) => banner.imageUrl),
    ].filter(Boolean);

    if (images.length > 0) return images;
    return [extractCssUrl(venue.bgImage)];
  }, [horizontalBanners, sliderVenues, venue.bgImage]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/main/mobile/specific/${venue.id}`;
    const payload = {
      title: venue.name,
      text: venue.tagline || `Check out ${venue.name}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (error: any) {
        if (error?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      console.error("Failed to copy venue link", error);
    }
  };

  const handleMessageStaff = (staff: any) => {
    setSelectedStaffForMessage(staff);
    setMessageDialogOpen(true);
  };

  const handleBookNow = () => {
    setSelectedServiceForBooking(null);
    setSelectedStaffForBooking(null);
    setBookingModalOpen(true);
  };

  const currentHeroImage = heroImages[heroIndex];

console.log(venue)
  return (
    <>
      <main className="min-h-dvh  mb-[2rem]">
        {/* <div className="relative mb-0.5">
              <div className="relative px-1">
                <input
                  type="text"
                  name="search"
                  placeholder="Search..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 h-7"
                />
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div> */}

<div className="mb-2.5 block md:hidden">
              <div className="flex items-center gap-2 px-2">
                
                {/* Search Input */}
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    name="search"
                    placeholder="Search..."
                    className="h-9 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Filter Button */}
           
        
                    <button className="flex h-9 w-9 items-center justify-center">
                      <SlidersHorizontal className="h-5 w-5 text-blue-700" />
                    </button>
              

              </div>
            </div>
        <div className="mx-auto flex max-w-3xl flex-col gap-1 px-1 pt-1">
          <section className="overflow-hidden rounded-lg bg-slate-900 text-white shadow-[0_28px_80px_-50px_rgba(15,23,42,0.55)]">
            {/* <div
              className="relative min-h-[150px] bg-cover bg-center"
              style={{
                backgroundImage: `url('${currentHeroImage || extractCssUrl(venue.bgImage) || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop"}')`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/55 to-black/10" />
              <div className="relative flex min-h-[150px] flex-col justify-between p-2">
                <div className="flex items-end justify-end">
                  <Badge className="rounded-full bg-blue-600 px-2 mt-[-0.2rem] text-[8px] font-semibold text-white hover:bg-blue-600">
                    {venue.hours}
                  </Badge>
                </div>

                <div className="mt-1">
                  <h2 className="max-w-[10ch] text-[13px] font-bold leading-[1.05]">
                    {venue.name}
                  </h2>
                  <div className="mt-3 flex flex-col items-start gap-2 text-xs text-white/80">
                  <div className="flex">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px]">4.8({venue.reviews.length} reviews)</span>
                    </div>
                    <div className="flex">
                    <MapPin className="h-3 w-3 text-emerald-400" />
                    <span className="truncate text-[10px]">{venue.address}</span>
                    </div>
                  </div>

                  <div className="mt-1 flex justify-between">
                    <MobilePillButton
                      icon={PlayCircle}
                      onClick={() => setIsVideoModalOpen(true)}
                      text="Watch Video"
                    />
                    <MobilePillButton
                      icon={Phone}
                      onClick={() => {
                        if (venue.phone) {
                          window.location.assign(`tel:${venue.phone}`);
                        }
                      }}
                      text="Call Now"
                    />
                    <MobilePillButton
                      icon={MapPin}
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            venue.address,
                          )}`,
                          "_blank",
                        )
                      }
                      text="Get Directions"
                    />
                    <Link
                      href={`/main/mobile/booking/${venue.id}`}
                      className="flex items-center gap-0.5 text-[10px] font-medium text-black mt-2 z-10 px-2 py-1.5 rounded-md  w-max cursor-pointer bg-blue-600 text-white"
                    >
                      <CalendarDays className="h-3 w-3" />
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            </div> */}
            <HomeCarousel sliderVenues={sliderVenues} Isphone={true}/>
          </section>

          <section className="rounded-[28px] px-1  ring-slate-200/70">
            <MobileHorizontalTitle title="Services" actionLabel="View All" />
            <div className="flex gap-1 overflow-x-auto  [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {venue.services.map((service) => (
                <button
                  key={service.name}
                  type="button"
                  // onClick={() => handleServiceBooking(service)}
                  className="w-[6rem] shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    className="h-14 bg-cover bg-center"
                    style={{ backgroundImage: `url('${service.image}')` }}
                  />
                  <div className="space-y-0.5 p-1">
                    <h3 className="line-clamp-1 text-[10px] font-semibold text-slate-900">
                      {service.name}
                    </h3>
                    <p className="line-clamp-2 min-h-[1rem] text-[8px] leading-2 text-slate-500">
                      {service.description || "Premium treatment crafted for comfort."}
                    </p>
                    <p className="text-base text-[10px] font-bold text-[#b23b00]">
                        {service.price}
                      </p>
                    <div className="flex items-center w-full">
                      
                      <Link className="rounded-sm border w-full text-center border-[#1f4dff] px-3 py-[1px] text-[10px] font-semibold text-[#1f4dff]"
                      href={`/main/mobile/booking/${venue.id}`}
                      >
                        Select
                      </Link>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] px-1 ring-slate-200/70">
            <MobileHorizontalTitle title="Staff" actionLabel="View All" />
            <div className="flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {venue.staff.map((member) => (
                <button
                  key={member.name}
                  type="button"
                  // onClick={() => handleBookingWithStaff(member)}
                  className="w-[6rem] shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    className="h-14 bg-cover bg-center"
                    style={{ backgroundImage: `url('${member.image}')` }}
                  />
                  <div className="space-y-0.5 p-1">
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-900">
                        {member.name}
                      </h3>
                      <p className="text-[9px] font-semibold text-slate-500">
                        {member.experienceYears + "+ years Exp." || "Experienced professional"} 
                      </p>
                    </div>
                    <div className="flex">
                    <Link className="rounded-sm border w-full text-center border-[#1f4dff] px-3 py-[1px] text-[10px] font-semibold text-[#1f4dff]"
                      href={`/main/mobile/booking/${venue.id}`}
                      >
                        Select  
                      </Link>
                      </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] bg-white px-1">
            <MobileHorizontalTitle title="Reviews" actionLabel="View All" />
            <div className="rounded-[24px] bg-slate-50 p-1">
              <div className="flex items-center gap-1">
                <div className="flex min-w-[1rem] flex-col items-center justify-center rounded-sm  px-1 py-1 ">
                  <div className="text-xs font-bold text-slate-900">4.8</div>
                  <div className=" flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className="h-1 w-1 fill-current" />
                    ))}
                  </div>
                  <p className="mt-1 text-[5px] text-slate-500">
                    ({venue.reviews.length} reviews)
                  </p>
                </div>
                <div className="flex-1 space-y">
                  {[5, 4, 3, 2, 1].map((count, index) => (
                    <div key={count} className="flex items-center gap-0.5">
                      <span className="w-1 text-[7px] text-slate-500">{count}</span>
                      <Star className="h-1 w-1 fill-amber-400 text-amber-400" />
                      <div className="h-1 flex-1 rounded-full bg-white">
                        <div
                          className="h-1 rounded-full bg-amber-400"
                          style={{ width: `${Math.max(15, 100 - index * 18)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className=" space-y-1">
              {venue.reviews.map((review) => (
                <div
                  key={`${review.name}-${review.time}`}
                  className="rounded-sm border border-slate-100 bg-white p-0.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex  gap-1 justify-center items-center ">
                      <div className="flex h-3 w-3 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <UserRound className="h-2 w-2" />
                      </div>
                      <div>
                        <h3 className="text-[10px] font-semibold text-slate-900">
                          {review.name}
                        </h3>
                        <div className=" flex items-center gap-1 text-amber-400">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} className="h-1 w-1 fill-current" />
                          ))}
                          <span className="ml-2 text-[7px] text-slate-400">{review.time}</span>
                        </div>
                      </div>
                    </div>
                    <button type="button" className="text-slate-400">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mt- text-[10px] leading-2.5 text-slate-600">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/96 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl gap-3">
          {venue.staff.length ? (
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1 rounded-2xl border-slate-200 bg-white text-sm font-semibold text-slate-700"
              onClick={() => handleMessageStaff(venue.staff[0])}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Message
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={handleBookNow}
            className="h-12 flex-[1.4] rounded-2xl bg-[#1f4dff] text-sm font-semibold text-white shadow-lg shadow-blue-700/30 hover:bg-blue-700"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Book Now
          </Button>
        </div>
      </div> */}

      {isVideoModalOpen ? (
        <VideoModal
          videoUrl={venueWithExtras.videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
          onClose={() => setIsVideoModalOpen(false)}
        />
      ) : null}

      <SpecificVenueBookingModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        venue={venue}
        preselectedService={selectedServiceForBooking}
        preselectedStaff={selectedStaffForBooking}
        initialStep={selectedServiceForBooking ? 2 : selectedStaffForBooking ? 2 : 1}
        bookingFlow={selectedStaffForBooking ? "staff-first" : "service-first"}
        verticalBannerUrl={verticalBanners[0]?.imageUrl}
      />

      {selectedStaffForMessage ? (
        <MessageDialog
          open={messageDialogOpen}
          onOpenChange={setMessageDialogOpen}
          staff={selectedStaffForMessage}
          venueName={venue.name}
          allStaff={venue.staff}
          services={venue.services}
        />
      ) : null}
    </>
  );
}
