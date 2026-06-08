"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Menu,
  ShieldCheck,
  Star,
  UserRoundCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SpecificVenueCarousel from "./SpecificVenueCarousel";
import SpecificVenueBookingModal from "./SpecificVenueBookingModal";
import type { Venue } from "@/app/main/data";
import MessageDialog from "./MessageDialog";

const infoIcons = [ShieldCheck, UserRoundCheck, CalendarDays, Star];

type SpecificVenueClientWrapperProps = {
  venue: Venue;
  currentOrgId: string;
  horizontalBanners?: { imageUrl: string; title?: string; description?: string; clickThroughUrl?: string }[];
  verticalBanners?: { imageUrl: string; title?: string; description?: string; clickThroughUrl?: string }[];
};

export default function SpecificVenueClientWrapper({
  venue,
  currentOrgId,
  horizontalBanners = [],
  verticalBanners = [],
}: SpecificVenueClientWrapperProps) {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] =
    useState<any>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedStaffForMessage, setSelectedStaffForMessage] =
    useState<any>(null);
  const [selectedStaffForBooking, setSelectedStaffForBooking] =
    useState<any>(null);

  // Suggestions are loaded lazily after the page renders to avoid blocking
  // the critical path — the user sees the main content immediately.
  const [suggestions, setSuggestions] = useState<Venue[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadSuggestions() {
      try {
        const res = await fetch('/api/organizations');
        if (cancelled) return;
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.organizations) {
            const { mapOrgToVenue } = await import('@/app/main/data');
            const mapped = json.data.organizations
              .filter((org: any) => org._id !== currentOrgId)
              .slice(0, 4)
              .map((org: any, idx: number) => mapOrgToVenue(org, idx + 1));
            if (!cancelled) setSuggestions(mapped);
          }
        }
      } catch {
        // silently ignore — suggestions are non-critical
      } finally {
        if (!cancelled) setSuggestionsLoading(false);
      }
    }
    loadSuggestions();
    return () => { cancelled = true; };
  }, [currentOrgId]);

  const sliderVenues = [venue, ...suggestions];

  const handleServiceBooking = (service: any) => {
    setSelectedServiceForBooking(service);
    setSelectedStaffForBooking(null);
    setBookingModalOpen(true);
  };

  const handleBookingWithStaff = (staff: any) => {
    setSelectedStaffForBooking(staff);
    setBookingModalOpen(true);
  };

  const handleMessageStaff = (staff: any) => {
    setSelectedStaffForMessage(staff);
    setMessageDialogOpen(true);
  };

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ffffff_0%,#f4f8ff_45%,#eef3fb_100%)] px-4 py-6 md:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px] rounded-[34px] border border-white/70 bg-white/90 p-4 shadow-[0_32px_120px_-54px_rgba(37,99,235,0.28)] backdrop-blur xl:p-6">
          <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_250px]">
            <aside className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  Suggestions
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-blue-600"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>

              {suggestionsLoading ? (
                // Skeleton placeholders while suggestions load lazily
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm animate-pulse"
                  >
                    <div className="min-h-[160px] bg-slate-200" />
                  </div>
                ))
              ) : suggestions.length > 0 ? (
                suggestions.map((item) => (
                  <Link
                    key={item.id}
                    href={`/main/specific/${item.id}`}
                    className="group block overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div
                      className={`relative min-h-[185px] bg-gradient-to-br ${item.accent} p-4 pb-14 text-white flex flex-col justify-between`}
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen"
                        style={{ backgroundImage: item.bgImage }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                      <Badge className="absolute right-3 top-3 bg-blue-600 text-white hover:bg-blue-600">
                        {item.hours}
                      </Badge>

                      <div className="relative mt-4">
                        <h3 className="text-xl font-semibold leading-tight">{item.name}</h3>
                        <p className="text-sm italic text-white/85 line-clamp-1 mt-0.5">
                          {item.tagline}
                        </p>
                      </div>

                      <div className="relative flex items-end justify-between gap-3 mt-4">
                        <p className="max-w-[140px] text-sm text-white/90 line-clamp-2">
                          {item.address}
                        </p>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm transition-transform duration-200 group-hover:translate-x-1">
                          <ChevronRight className="h-5 w-5" />
                        </span>
                      </div>

                      <button
                        className="absolute bottom-3 right-3 bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setBookingModalOpen(true);
                          setSelectedServiceForBooking(null);
                          setSelectedStaffForBooking(null);
                        }}
                      >
                        Book Now
                      </button>
                    </div>
                  </Link>
                ))
              ) : null}

              <Button variant="outline" className="w-full rounded-2xl border-slate-200 text-blue-600 bg-white text-black">
                View More
              </Button>
            </aside>


            <section className="space-y-6">
              <SpecificVenueCarousel sliderVenues={sliderVenues} horizontalBanners={horizontalBanners} verticalBanners={verticalBanners} />


              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-slate-900">
                    Our Services
                  </h2>
                  <Button variant="link" asChild className="px-0 text-blue-600">
                    <span onClick={() => {
                      setBookingModalOpen(true); setSelectedServiceForBooking(null);
                      setSelectedStaffForBooking(null);
                    }} className="cursor-pointer">View All</span>
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  {venue.services.map((service) => (
                    <Card
                      key={service.name}
                      className="overflow-hidden rounded-[22px] border-slate-200 shadow-sm cursor-pointer transition hover:shadow-lg bg-white"
                      onClick={() => handleServiceBooking(service)}
                    >
                      <div
                        className="h-32 bg-cover bg-center"
                        style={{ backgroundImage: `url('${service.image}')` }}
                      />
                      <CardContent className="space-y-1 p-4 text-center ">
                        <h3 className="text-sm font-semibold text-slate-800">{service.name}</h3>
                        <p className="text-xl font-bold text-blue-600">{service.price}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-slate-900">
                    Our Staffs
                  </h2>
                  <Button
                    variant="link"
                    asChild
                    className="px-0 text-blue-600 cursor-pointer"
                    onClick={() => handleBookingWithStaff(venue.staff[0])}
                  >
                    <span>View All</span>
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 ">
                  {venue.staff.map((member) => (
                    <Card
                      key={member.name}
                      className="overflow-hidden rounded-[24px] border-slate-200 shadow-sm"
                    >
                      <div
                        className="h-40 bg-cover bg-center "
                        style={{ backgroundImage: `url('${member.image}')` }}
                      />
                      <CardContent className="space-y-4 p-4 text-center bg-white">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {member.name}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {member.role}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1 rounded-xl border-slate-200 text-blue-600 bg-white text-black"
                            onClick={() => handleBookingWithStaff(member)}>
                            Book Service
                          </Button>
                          <Button
                            className="flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => handleMessageStaff(member)}
                          >
                            Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-slate-900">What Our Clients Say</h2>
                  {/* <Button variant="link" asChild className="px-0 text-blue-600">
                    <Link href="/main">View All</Link>
                  </Button> */}
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {venue.reviews.map((review) => (
                    <Card key={review.name} className="rounded-[24px] border-slate-200 shadow-sm bg-white">
                      <CardContent className="space-y-4 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {review.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {review.time}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-amber-400">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className="h-4 w-4 fill-current"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm leading-6 text-slate-600">
                          {review.comment}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <Card className="rounded-[28px] border-slate-200 shadow-sm bg-white">
                <CardContent className="space-y-5 p-5">
                  <h2 className="text-3xl font-bold text-slate-900">Menu</h2>
                  <div className="space-y-4">
                    {venue.services.slice(0, 5).map((service) => (
                      <div key={service.name} className="flex items-center gap-3 cursor-pointer" onClick={() => handleServiceBooking(service)}>
                        <div
                          className="h-12 w-12 shrink-0 rounded-xl bg-cover bg-center"
                          style={{
                            backgroundImage: `url('${service.image}')`,
                          }}
                        />
                        <div className="flex flex-1 min-w-0 items-center justify-between gap-2">
                          <span className="text-sm font-medium text-slate-700 line-clamp-2 leading-snug">
                            {service.name}
                          </span>
                          <span className="shrink-0 text-sm font-bold text-blue-600 whitespace-nowrap">
                            {service.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full rounded-2xl bg-blue-600 py-6 text-base font-semibold text-white hover:bg-blue-700"
                    onClick={() => {
                      setBookingModalOpen(true);
                      setSelectedServiceForBooking(null);
                      setSelectedStaffForBooking(null);
                    }}
                  >
                    Select Service
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-slate-200 shadow-sm bg-white">
                <CardContent className="space-y-5 p-5">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Key Features</h3>
                  <div className="space-y-4">
                    {venue.features?.map((feature, index) => {
                      const Icon = infoIcons[index % infoIcons.length];

                      return (
                        <div
                          key={feature.title}
                          className="flex items-start gap-3"
                        >
                          <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 text-sm">
                              {feature.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-slate-200 shadow-sm bg-white">
                <CardContent className="space-y-5 p-5">
                  <h2 className="text-3xl font-bold text-slate-900">Products</h2>
                  <div className="space-y-4">
                    {venue.products.slice(0, 5).map((product) => (
                      <div key={product.name} className="flex items-center gap-3">
                        <div
                          className="h-12 w-12 shrink-0 rounded-xl bg-cover bg-center"
                          style={{ backgroundImage: `url('${product.image}')` }}
                        />
                        <div className="flex flex-1 min-w-0 items-center justify-between gap-2">
                          <span className="text-sm font-medium text-slate-700 line-clamp-2 leading-snug">{product.name}</span>
                          <span className="shrink-0 text-sm font-bold text-blue-600 whitespace-nowrap">{product.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full rounded-2xl bg-blue-600 py-6 text-base font-semibold text-white hover:bg-blue-700"
                  >
                    Contact To Buy
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </main>

      <SpecificVenueBookingModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        venue={venue}
        preselectedService={selectedServiceForBooking}
        preselectedStaff={selectedStaffForBooking}
        initialStep={
          selectedServiceForBooking ? 2 : selectedStaffForBooking ? 2 : 1
        }
        bookingFlow={selectedStaffForBooking ? "staff-first" : "service-first"}
        verticalBannerUrl={verticalBanners[0]?.imageUrl}
      />

      {selectedStaffForMessage && (
        <MessageDialog
          open={messageDialogOpen}
          onOpenChange={setMessageDialogOpen}
          staff={selectedStaffForMessage}
          venueName={venue.name}
          allStaff={venue.staff}
          services={venue.services}
        />
      )}
    </>
  );
}
