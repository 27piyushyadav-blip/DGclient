"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Clock3,
  MapPin,
  Menu,
  Star,
  X,
  Tag,
  Layers,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SpecificVenueCarousel from "./SpecificVenueCarousel";
import SpecificVenueBookingModal from "./SpecificVenueBookingModal";
import { type Venue, normalizeLayout, type LayoutSection } from "@/app/main/data";
import MessageDialog from "./MessageDialog";

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
  const layout = normalizeLayout(venue.defaultLayout);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] =
    useState<any>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedStaffForMessage, setSelectedStaffForMessage] =
    useState<any>(null);
  const [selectedStaffForBooking, setSelectedStaffForBooking] =
    useState<any>(null);
  const [bookingFlow, setBookingFlow] = useState<"service-first" | "staff-first">("service-first");

  // Category services state (when showCategories = true)
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string; imageUrl?: string | null; price?: string | null } | null>(null);

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
    setBookingFlow("service-first");
    setBookingModalOpen(true);
  };

  const handleBookingWithStaff = (staff: any) => {
    setSelectedStaffForBooking(staff);
    setSelectedServiceForBooking(null);
    setBookingFlow("staff-first");
    setBookingModalOpen(true);
  };

  const handleMessageStaff = (staff: any) => {
    setSelectedStaffForMessage(staff);
    setMessageDialogOpen(true);
  };

  const renderHorizontalSection = (section: LayoutSection) => {
    switch (section.type) {
      case 'services': {
        const displayServices = (section.services || [])
          .map(id => venue.services.find(s => s.id === id || s.name === id))
          .filter((s): s is any => !!s);
        const servicesList = (displayServices.length > 0 ? displayServices : venue.services).slice(0, 5);
        if (servicesList.length === 0) return null;
        return (
          <div className="space-y-3 font-sans" key={section.title}>
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">{section.title}</h2>
              <Button variant="link" asChild className="px-0 text-blue-600">
                <span onClick={() => {
                  setSelectedCategory(null);
                  setSelectedServiceForBooking(null);
                  setSelectedStaffForBooking(null);
                  setBookingFlow("service-first");
                  setBookingModalOpen(true);
                }} className="cursor-pointer">View All</span>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {servicesList.map((service) => (
                <Card
                  key={service.id || service.name}
                  className="group overflow-hidden rounded-[22px] border-slate-200 shadow-sm cursor-pointer transition hover:shadow-lg bg-white"
                  onClick={() => handleServiceBooking(service)}
                >
                  {service.image ? (
                    <div
                      className="h-32 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url('${service.image}')` }}
                    />
                  ) : (
                    <div className="h-32 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-100 transition-colors duration-300 group-hover:from-slate-100 group-hover:to-slate-200/50">
                      <Sparkles className="w-10 h-10 text-slate-300 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  )}
                  <CardContent className="space-y-1 p-4 text-center">
                    <h3 className="text-sm font-semibold text-slate-800">{service.name}</h3>
                    <p className="text-xl font-bold text-blue-600">{service.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      }
      case 'categories': {
        if (venue.categories.length === 0) return null;
        const displayCategories = (section.services || [])
          .map(id => venue.categories.find(c => c.id === id))
          .filter((c): c is any => !!c);
        const categoriesList = (displayCategories.length > 0 ? displayCategories : venue.categories).slice(0, 5);
        if (categoriesList.length === 0) return null;
        return (
          <div className="space-y-3 font-sans" key={section.title}>
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">{section.title}</h2>
              <Button variant="link" asChild className="px-0 text-blue-600">
                <span onClick={() => {
                  setSelectedCategory(null);
                  setSelectedServiceForBooking(null);
                  setSelectedStaffForBooking(null);
                  setBookingFlow("service-first");
                  setBookingModalOpen(true);
                }} className="cursor-pointer">View All</span>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {categoriesList.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedServiceForBooking(null);
                    setSelectedStaffForBooking(null);
                    setBookingFlow("service-first");
                    setBookingModalOpen(true);
                  }}
                  className="overflow-hidden rounded-[22px] border border-slate-200 shadow-sm cursor-pointer transition hover:shadow-lg hover:-translate-y-0.5 bg-white group"
                >
                  <div className="h-32 bg-cover bg-center relative overflow-hidden"
                    style={{ backgroundImage: cat.imageUrl ? `url('${cat.imageUrl}')` : undefined }}
                  >
                    {!cat.imageUrl && (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                        <Layers className="w-10 h-10 text-blue-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                  </div>
                  <div className="space-y-1 p-4 text-center">
                    <h3 className="text-sm font-semibold text-slate-800">{cat.name}</h3>
                    {cat.price && (
                      <p className="text-xl font-bold text-blue-600">${cat.price}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case 'staff': {
        if (venue.staff.length === 0) return null;
        const displayStaff = (section.services || [])
          .map(id => venue.staff.find(member => member.id === id || member.name === id))
          .filter((member): member is any => !!member);
        const staffList = (displayStaff.length > 0 ? displayStaff : venue.staff).slice(0, 5);
        if (staffList.length === 0) return null;
        return (
          <div className="space-y-3 font-sans" key={section.title}>
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">{section.title}</h2>
              <Button
                variant="link"
                asChild
                className="px-0 text-blue-600 cursor-pointer"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedServiceForBooking(null);
                  setSelectedStaffForBooking(null);
                  setBookingFlow("staff-first");
                  setBookingModalOpen(true);
                }}
              >
                <span>View All</span>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {staffList.map((member) => (
                <Card
                  key={member.name}
                  className="overflow-hidden rounded-[24px] border-slate-200 shadow-sm bg-white"
                >
                  <Link href={`/organizations/staff/detail?id=${member.id}`}>
                    <div
                      className="h-40 bg-cover bg-center cursor-pointer transition-transform duration-300 hover:scale-105"
                      style={{ backgroundImage: `url('${member.image}')` }}
                    />
                  </Link>
                  <CardContent className="space-y-4 p-4 text-center bg-white">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                        <Link href={`/organizations/staff/detail?id=${member.id}`}>
                          {member.name}
                        </Link>
                      </h3>
                      <p className="text-sm text-slate-500">{member.role}</p>
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
        );
      }
      case 'products': {
        if (venue.products.length === 0) return null;
        const displayProducts = (section.services || [])
          .map(id => venue.products.find(product => product.id === id || product.name === id))
          .filter((product): product is any => !!product);
        const productsList = (displayProducts.length > 0 ? displayProducts : venue.products).slice(0, 5);
        if (productsList.length === 0) return null;
        return (
          <div className="space-y-3 font-sans" key={section.title}>
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">{section.title}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {productsList.map((product) => (
                <Card key={product.id || product.name} className="overflow-hidden rounded-[22px] border-slate-200 shadow-sm bg-white">
                  <div
                    className="h-32 bg-cover bg-center"
                    style={{ backgroundImage: `url('${product.image}')` }}
                  />
                  <CardContent className="space-y-1 p-4 text-center">
                    <h3 className="text-sm font-semibold text-slate-800">{product.name}</h3>
                    <p className="text-xl font-bold text-blue-600">{product.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const renderVerticalSection = (section: LayoutSection) => {
    switch (section.type) {
      case 'services': {
        const displayServices = (section.services || [])
          .map(id => venue.services.find(s => s.id === id || s.name === id))
          .filter((s): s is any => !!s);
        const servicesList = displayServices.length > 0 ? displayServices : venue.services.slice(0, 5);
        if (servicesList.length === 0) return null;
        return (
          <Card className="rounded-[28px] border-slate-200 shadow-sm bg-white" key={section.title}>
            <CardContent className="space-y-5 p-5">
              <h2 className="text-3xl font-bold text-slate-900">{section.title}</h2>
              <div className="space-y-4">
                {servicesList.map((service) => (
                  <div key={service.id || service.name} className="group flex items-center gap-3 cursor-pointer" onClick={() => handleServiceBooking(service)}>
                    {service.image ? (
                      <div
                        className="h-12 w-12 shrink-0 rounded-xl bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundImage: `url('${service.image}')` }}
                      />
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded-xl flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100/60 transition-colors duration-300 group-hover:from-slate-100 group-hover:to-slate-200/50">
                        <Sparkles className="w-5 h-5 text-slate-300 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    )}
                    <div className="flex flex-1 min-w-0 items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-700 line-clamp-2 leading-snug">{service.name}</span>
                      <span className="shrink-0 text-sm font-bold text-blue-600 whitespace-nowrap">{service.price}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                className="w-full rounded-2xl bg-blue-600 py-6 text-base font-semibold text-white hover:bg-blue-700"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedServiceForBooking(null);
                  setSelectedStaffForBooking(null);
                  setBookingFlow("service-first");
                  setBookingModalOpen(true);
                }}
              >
                Select Service
              </Button>
            </CardContent>
          </Card>
        );
      }
      case 'categories': {
        if (venue.categories.length === 0) return null;
        const displayCategories = (section.services || [])
          .map(id => venue.categories.find(c => c.id === id))
          .filter((c): c is any => !!c);
        const categoriesList = (displayCategories.length > 0 ? displayCategories : venue.categories).slice(0, 5);
        if (categoriesList.length === 0) return null;
        return (
          <Card className="rounded-[28px] border-slate-200 shadow-sm bg-white" key={section.title}>
            <CardContent className="space-y-5 p-5">
              <h2 className="text-3xl font-bold text-slate-900">{section.title}</h2>
              <div className="space-y-4">
                {categoriesList.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-3 cursor-pointer" onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedServiceForBooking(null);
                    setSelectedStaffForBooking(null);
                    setBookingFlow("service-first");
                    setBookingModalOpen(true);
                  }}>
                    {cat.imageUrl ? (
                      <div
                        className="h-12 w-12 shrink-0 rounded-xl bg-cover bg-center"
                        style={{ backgroundImage: `url('${cat.imageUrl}')` }}
                      />
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                        <Layers className="w-6 h-6 text-blue-400" />
                      </div>
                    )}
                    <div className="flex flex-1 min-w-0 items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-700 line-clamp-2 leading-snug">{cat.name}</span>
                      {cat.price && (
                        <span className="shrink-0 text-sm font-bold text-blue-600 whitespace-nowrap">${cat.price}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      }
      case 'staff': {
        if (venue.staff.length === 0) return null;
        const displayStaff = (section.services || [])
          .map(id => venue.staff.find(member => member.id === id || member.name === id))
          .filter((member): member is any => !!member);
        const staffList = (displayStaff.length > 0 ? displayStaff : venue.staff).slice(0, 5);
        if (staffList.length === 0) return null;
        return (
          <Card className="rounded-[28px] border-slate-200 shadow-sm bg-white" key={section.title}>
            <CardContent className="space-y-5 p-5">
              <h2 className="text-3xl font-bold text-slate-900">{section.title}</h2>
              <div className="space-y-4">
                {staffList.map((member) => (
                  <div key={member.name} className="flex items-center gap-3 cursor-pointer" onClick={() => handleBookingWithStaff(member)}>
                    <div
                      className="h-12 w-12 shrink-0 rounded-xl bg-cover bg-center"
                      style={{ backgroundImage: `url('${member.image}')` }}
                    />
                    <div className="flex flex-1 min-w-0 items-start flex-col">
                      <span className="text-sm font-medium text-slate-700 leading-tight">{member.name}</span>
                      <span className="text-xs text-slate-500 leading-tight">{member.role}</span>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-lg text-xs border-slate-200 text-blue-600 bg-white">
                      Book
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      }
      case 'products': {
        if (venue.products.length === 0) return null;
        const displayProducts = (section.services || [])
          .map(id => venue.products.find(product => product.id === id || product.name === id))
          .filter((product): product is any => !!product);
        const productsList = (displayProducts.length > 0 ? displayProducts : venue.products).slice(0, 5);
        if (productsList.length === 0) return null;
        return (
          <Card className="rounded-[28px] border-slate-200 shadow-sm bg-white" key={section.title}>
            <CardContent className="space-y-5 p-5">
              <h2 className="text-3xl font-bold text-slate-900">{section.title}</h2>
              <div className="space-y-4">
                {productsList.map((product) => (
                  <div key={product.id || product.name} className="flex items-center gap-3">
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
            </CardContent>
          </Card>
        );
      }
      default:
        return null;
    }
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
                          setSelectedCategory(null);
                          setSelectedServiceForBooking(null);
                          setSelectedStaffForBooking(null);
                          setBookingFlow("service-first");
                          setBookingModalOpen(true);
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


              {renderHorizontalSection(layout.horizontal1)}

              {renderHorizontalSection(layout.horizontal2)}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-slate-900">What Our Clients Say</h2>
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
              {renderVerticalSection(layout.vertical1)}
              {renderVerticalSection(layout.vertical2)}
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
        preselectedCategoryId={selectedCategory?.id}
        initialStep={
          selectedServiceForBooking ? 2 : selectedStaffForBooking ? 2 : 1
        }
        bookingFlow={bookingFlow}
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
