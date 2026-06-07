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
} from "lucide-react";

import type { Venue } from "@/app/main/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import VideoModal from "@/components/modals/VideoModal";
import MessageDialog from "@/app/main/specific/[id]/MessageDialog";
import SpecificVenueBookingModal from "@/app/main/specific/[id]/SpecificVenueBookingModal";
import VideoControls from "@/components/video/VideoControls";

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

const sectionTitleClass = "text-[1.15rem] font-bold tracking-tight text-slate-900";

function MobileHorizontalTitle({
  title,
  actionLabel,
}: {
  title: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className={sectionTitleClass}>{title}</h2>
      {actionLabel ? (
        <button type="button" className="text-sm font-semibold text-blue-600">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function MobilePillButton({
  icon: Icon,
  onClick,
}: {
  icon: any;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-2xl border border-white/20 bg-black/30 px-3 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-black/45"
    >
      <Icon className="h-4 w-4" />
      <ChevronRight className="h-4 w-4" />
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

  // const handleServiceBooking = (service: any) => {
  //   setSelectedServiceForBooking(service);
  //   setSelectedStaffForBooking(null);
  //   setBookingModalOpen(true);
  // };

  // const handleBookingWithStaff = (staff: any) => {
  //   setSelectedStaffForBooking(staff);
  //   setSelectedServiceForBooking(null);
  //   setBookingModalOpen(true);
  // };

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

  return (
    <>
      <main className="min-h-dvh bg-[#f7f8fc] pb-24">
        <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-[#f7f8fc]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
            <Link
              href="/main"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600">
                Venue details
              </p>
              <h1 className="truncate text-[1.05rem] font-bold text-slate-900">
                {venue.name}
              </h1>
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
              aria-label="Share venue"
            >
              <Share2 className="h-5 w-5" />
            </button>
            {/* <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button> */}
          </div>
        </header>

        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-4">
          <section className="overflow-hidden rounded-[28px] bg-slate-900 text-white shadow-[0_28px_80px_-50px_rgba(15,23,42,0.55)]">
            <div
              className="relative min-h-[320px] bg-cover bg-center"
              style={{
                backgroundImage: `url('${currentHeroImage || extractCssUrl(venue.bgImage) || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop"}')`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/55 to-black/10" />
              <div className="relative flex min-h-[320px] flex-col justify-between p-4">
                <div className="flex items-start justify-between gap-3">
                  <Badge className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-600">
                    {venue.hours}
                  </Badge>
                  <button
                    type="button"
                    onClick={() =>{setIsVideoModalOpen(true)}}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25"
                    aria-label="Watch video"
                  >
                    <PlayCircle className="h-5 w-5" />
                  </button>
                </div>

                <div>
                  <h2 className="max-w-[14ch] text-[2rem] font-bold leading-[1.05]">
                    {venue.name}
                  </h2>
                  <p className="mt-2 max-w-[26rem] text-sm leading-6 text-white/80">
                    {venue.tagline}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-white/80">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{venue.reviews.length} reviews</span>
                    <span className="h-1 w-1 rounded-full bg-white/40" />
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="truncate">{venue.address}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-1">
                    <MobilePillButton
                      icon={PlayCircle}
                      onClick={() => setIsVideoModalOpen(true)}
                    />
                    <MobilePillButton
                      icon={Phone}
                      onClick={() => {
                        if (venue.phone) {
                          window.location.assign(`tel:${venue.phone}`);
                        }
                      }}
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
                    />
                    <button
                      type="button"
                      onClick={handleBookNow}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-[#1f4dff] px-3 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/30 transition hover:bg-blue-700"
                    >
                      <CalendarDays className="h-4 w-4" />
                      
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {heroImages.length > 1 ? (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {heroImages.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setHeroIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === heroIndex ? "w-6 bg-white" : "w-2 bg-white/35"
                        }`}
                        aria-label={`Go to banner ${index + 1}`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
            <MobileHorizontalTitle title="Services" actionLabel="View All" />
            <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {venue.services.map((service) => (
                <button
                  key={service.name}
                  type="button"
                  // onClick={() => handleServiceBooking(service)}
                  className="w-[9.5rem] shrink-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    className="h-24 bg-cover bg-center"
                    style={{ backgroundImage: `url('${service.image}')` }}
                  />
                  <div className="space-y-1 p-3">
                    <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
                      {service.name}
                    </h3>
                    <p className="line-clamp-2 min-h-[2.4rem] text-xs leading-5 text-slate-500">
                      {service.description || "Premium treatment crafted for comfort."}
                    </p>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-base font-bold text-[#b23b00]">
                        {service.price}
                      </span>
                      <Link className="rounded-full border border-[#1f4dff] px-3 py-1 text-xs font-semibold text-[#1f4dff]"
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

          <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
            <MobileHorizontalTitle title="Staff" actionLabel="View All" />
            <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {venue.staff.map((member) => (
                <button
                  key={member.name}
                  type="button"
                  // onClick={() => handleBookingWithStaff(member)}
                  className="w-[9.5rem] shrink-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    className="h-28 bg-cover bg-center"
                    style={{ backgroundImage: `url('${member.image}')` }}
                  />
                  <div className="space-y-2 p-3">
                    <div>
                      <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
                        {member.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {member.role || "Experienced professional"}
                      </p>
                    </div>
                    <Link className="rounded-full border border-[#1f4dff] px-3 py-1 text-xs font-semibold text-[#1f4dff]"
                      href={`/main/mobile/booking/${venue.id}`}
                      >
                        Select  
                      </Link>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
            <MobileHorizontalTitle title="Amenities" />
            <div className="flex flex-wrap gap-2">
              {venue.features?.length ? (
                venue.features.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    {feature.title}
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">No amenities listed.</div>
              )}
            </div>
          </section> */}

          {/* <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
            <MobileHorizontalTitle title="Availability" />
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Clock3 className="h-4 w-4 text-blue-600" />
                  Opening hours
                </div>
                <p className="mt-2 text-sm text-slate-600">{venue.hours}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Location
                </div>
                <p className="mt-2 text-sm text-slate-600">{venue.address}</p>
              </div>
            </div>
          </section> */}

          <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
            <MobileHorizontalTitle title="Reviews" actionLabel="View All" />
            <div className="rounded-[24px] bg-slate-50 p-4">
              <div className="flex items-center gap-4">
                <div className="flex min-w-[5.5rem] flex-col items-center justify-center rounded-2xl bg-white px-4 py-4 shadow-sm">
                  <div className="text-4xl font-bold text-slate-900">4.8</div>
                  <div className="mt-1 flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    ({venue.reviews.length} reviews)
                  </p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((count, index) => (
                    <div key={count} className="flex items-center gap-2">
                      <span className="w-4 text-xs text-slate-500">{count}</span>
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <div className="h-2 flex-1 rounded-full bg-white">
                        <div
                          className="h-2 rounded-full bg-amber-400"
                          style={{ width: `${Math.max(15, 100 - index * 18)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {venue.reviews.map((review) => (
                <div
                  key={`${review.name}-${review.time}`}
                  className="rounded-[22px] border border-slate-100 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {review.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-1 text-amber-400">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                          ))}
                          <span className="ml-2 text-xs text-slate-400">{review.time}</span>
                        </div>
                      </div>
                    </div>
                    <button type="button" className="text-slate-400">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {suggestions.length ? (
            <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
              <MobileHorizontalTitle title="Nearby venues" actionLabel="View More" />
              <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {suggestions.map((item) => (
                  <Link
                    key={item.id}
                    href={`/main/mobile/specific/${item.id}`}
                    className="w-[10rem] shrink-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm"
                  >
                    <div
                      className="h-24 bg-cover bg-center"
                      style={{ backgroundImage: item.bgImage }}
                    />
                    <div className="space-y-1 p-3">
                      <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
                        {item.name}
                      </h3>
                      <p className="line-clamp-2 text-xs text-slate-500">
                        {item.address}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
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
          videoUrl={venueWithExtras.introVideo || "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
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
