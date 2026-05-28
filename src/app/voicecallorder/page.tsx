"use client";

import { useState } from "react";
import type { Venue } from "@/app/main/data";
import { venues } from "@/app/main/data";
import SpecificVenueBookingModal from "@/app/main/specific/[id]/SpecificVenueBookingModal";
import VideoModal from "@/components/modals/VideoModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock3, MapPin, Phone, Play, Plus, SearchIcon } from "lucide-react";

const fallbackVideoUrl = "https://youtu.be/sRWcJrMTtMI?si=hbh0v0HYOocQsXrE";

// Service Drawer Component (for the More button)
function ServiceDrawer({
  services,
  venueName,
  onBookNow,
}: {
  services: { name: string; price: string; image: string }[];
  venueName: string;
  onBookNow: () => void;
}) {
  return (
    <div 
      className="cursor-pointer transition-all duration-200 active:scale-90"
      onClick={onBookNow}
    >
      <div className="flex flex-col items-center justify-center gap-1.5 px-3 py-4 min-w-[6rem] mt-[-0.4rem]">
        <Plus className="h-5 w-5 text-blue-600 transition-colors group-hover:text-blue-700" />
        <p className="text-sm font-semibold text-blue-600 transition-colors">
          More
        </p>
      </div>
    </div>
  );
}

function VenueCard({
  venue,
  onOpenBooking,
  onPlayVideo,
}: {
  venue: Venue;
  onOpenBooking: (venue: Venue) => void;
  onPlayVideo: (venue: Venue) => void;
}) {
  const handlePlayClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onPlayVideo(venue);
  };

  return (
    <Card className="overflow-hidden rounded-[28px] border-slate-200 shadow-[0_22px_60px_-36px_rgba(15,23,42,0.35)]">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_96px]">
        <div
          className={`relative min-h-[250px] overflow-hidden bg-gradient-to-br ${venue.accent} p-6 text-white`}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop')",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.18),transparent_24%)]" />
          <div
            className={`absolute bottom-0 right-0 h-40 w-40 rounded-full bg-gradient-to-br ${venue.glow} blur-2xl`}
          />
          <div className="absolute bottom-6 right-6 z-10 flex h-28 w-28 items-center justify-center rounded-full border border-white/35 bg-white/10 shadow-lg backdrop-blur-sm">
            <button
              type="button"
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-black/30 cursor-pointer"
              onClick={handlePlayClick}
              aria-label={`Play video for ${venue.name}`}
            >
              <Play className="ml-1 h-6 w-6 fill-white text-white" />
            </button>
          </div>

          <div className="relative flex h-full flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[1.8rem] font-bold leading-none">{venue.name}</h2>
                <p className="mt-2 text-lg italic text-white/90">Relax & Rejuvenate</p>
              </div>
              <Badge variant="default" className="bg-blue-600 text-white shadow-lg">
                <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                {venue.hours}
              </Badge>
            </div>

            <p className="mt-6 max-w-xs text-sm leading-6 text-white/88">
              Experience the healing touch of our professional therapists.
            </p>

            <div className="mt-auto flex flex-col gap-4 pt-8">
              <div className="flex items-start gap-2 text-sm text-white/95">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{venue.address}</span>
              </div>
              <Button
                variant="secondary"
                className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-md hover:bg-blue-50"
              >
                <MapPin className="mr-1.5 h-4 w-4" />
                Direction
              </Button>
            </div>
          </div>
        </div>

        {/* Left side options (View, Staff Select, Message Now) */}
        <div className="flex items-stretch border-t border-slate-200 bg-white lg:flex-col lg:border-l lg:border-t-0 p-[0.5rem] ml-[-0.5rem]">
          {venue.services.slice(2, 6).map((service) => (
              <div
                key={service.name}
                className=" border-slate-100 w-[6rem] flex flex-col items-center justify-center gap-2 h-[6rem] mt-[-0.5rem]"
              >
                <img
                  src={service.image}
                  alt={service.name}
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <div className="flex flex-col items-center text-center w-full">
                  <p className="text-[11px] font-semibold text-slate-700 text-center line-clamp-2">
                    {service.name}
                  </p>
                  <p className="text-xs font-bold text-blue-600">{service.price}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Bottom services section */}
      <div className="flex justify-between items-center bg-white">
        <CardContent className="grid gap-2 border-t border-slate-200 p-4 md:grid-cols-[minmax(0,1fr)_1px]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {venue.services.slice(0, 3).map((service) => (
              <div
                key={service.name}
                className="border-r border-slate-100 w-[6rem] flex flex-col items-center justify-center gap-2 h-[6rem] mt-[-0.5rem]"
              >
                <img
                  src={service.image}
                  alt={service.name}
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <div className="flex flex-col items-center text-center w-full">
                  <p className="text-[11px] font-semibold text-slate-700 text-center line-clamp-2">
                    {service.name}
                  </p>
                  <p className="text-xs font-bold text-blue-600">{service.price}</p>
                </div>
              </div>
            ))}
            
            <ServiceDrawer 
              services={venue.services} 
              venueName={venue.name} 
              onBookNow={() => onOpenBooking(venue)} 
            />
          </div>
        </CardContent>
        
        <div
          className="h-full rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 mr-1 text-[12px] py-3 cursor-pointer flex flex-col items-center justify-center transition-colors p-2"
        >
          <Phone className="mr-1.5 h-4 w-4" />
          Book On Call
        </div>
      </div>
    </Card>
  );
}

const VoiceCall = () => {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  const handleOpenBooking = (venue: Venue) => {
    setSelectedVenue(venue);
    setIsBookingOpen(true);
  };

  const handlePlayVideo = (_venue: Venue) => {
    setActiveVideoUrl(fallbackVideoUrl);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900 md:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex justify-between items-center">

          <div className="relative mb-5 mt-2 w-full">
            <input
              type="text"
              name="search"
              placeholder="Search..."
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {venues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onOpenBooking={handleOpenBooking}
                onPlayVideo={handlePlayVideo}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedVenue ? (
        <SpecificVenueBookingModal
          open={isBookingOpen}
          onOpenChange={setIsBookingOpen}
          venue={selectedVenue}
        />
      ) : null}

      {activeVideoUrl ? (
        <VideoModal
          videoUrl={activeVideoUrl}
          onClose={() => setActiveVideoUrl(null)}
        />
      ) : null}
    </>
  );
};

export default VoiceCall;
