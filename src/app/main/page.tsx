"use client";

import { useState, type ReactNode, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowBigRight,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Circle,
  Clock3,
  Filter,
  LayoutGrid,
  LayoutGridIcon,
  Mail,
  MapPin,
  Menu,
  Play,
  Plus,
  SearchIcon,
  Share2,
  SlidersHorizontal,
  Star,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Image from "next/image";
import Link from "next/link";
import { venues, type Venue, type VenueService, mapOrgToVenue } from "./data";
import { getOrganizationsListApi } from "@/lib/directoryApi";
import { buildMobileBookingHref } from "./mobile/bookingRoute";
import SpecificVenueBookingModal from "./specific/[id]/SpecificVenueBookingModal";
import MessageDialog from "./specific/[id]/MessageDialog";
import ExpertSelectionDialog from "./specific/[id]/ExpertSelectionDialog";
import VideoModal from "@/components/modals/VideoModal";
import HomeCarousel from "./mobile/homeCarousel";
import VenueSlider from "./mobile/venueSlider";
import BottomVenueSlider from "./mobile/bottomVenuesSlider";

const filters = {
  suburbs: ["Ascotvale", "Brunswick", "Docklands"],
  countries: ["Chinese", "Vietnam", "India"],
  staff: ["Male Therapist", "Female Therapist"],
};

type MainVenue = Venue & {
  detailHref: string;
  videoUrl?: string;
};

const fallbackVideoUrl = "https://youtu.be/sRWcJrMTtMI?si=hbh0v0HYOocQsXrE";

const stripCssUrl = (value: string) =>
  value.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "");

const defaultVenueCards: MainVenue[] = venues.map((venue) => ({
  ...venue,
  detailHref: `/main/specific/${venue.id}`,
  videoUrl: fallbackVideoUrl,
}));

function FilterBlock({
  title,
  children,
  collapsible = false,
}: {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
}) {
  return (
    <section className="space-y-3 border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          {title}
        </h3>
        {collapsible ? <ChevronDown className="h-4 w-4 text-blue-600" /> : null}
      </div>
      {children}
    </section>
  );
}

// Add this component before the VenueCard component
function ServiceDrawer({
  services,
  venueName,
  onBookNow,
}: {
  services: VenueService[];
  venueName: string;
  onBookNow: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="  cursor-pointer transition-all duration-200  active:scale-90"
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
  id,
  name,
  hours,
  address,
  accent,
  glow,
  bgImage,
  tagline,
  description,
  services,
  detailHref,
  onBookNow,
  onStaffSelect,
  onPlayVideo,
  onMessageNow,
}: MainVenue & {
  onBookNow: () => void;
  onStaffSelect: () => void;
  onPlayVideo: () => void;
  onMessageNow: () => void;
}) {
  const handleShare = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/main/specific/${id}`;
    const shareData = {
      title: name,
      text: tagline || `Check out ${name} on Mind Namo`,
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

  return (
    <Card className="overflow-hidden rounded-[28px] border-slate-200 shadow-[0_22px_60px_-36px_rgba(15,23,42,0.35)] lg:h-[25.5rem] lg:max-h-[25.5rem] bg-white">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_96px] lg:h-[290px]">
        <div
          className={`relative h-[290px] lg:h-full overflow-hidden bg-gradient-to-br ${accent} p-6 text-white`}
        >
          {/* Background Image with Light Overlay */}
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-100 mix-blend-overlay"
            style={{ backgroundImage: bgImage }}
          />

          {/* Dark Gradient Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/30 via-black/40 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.18),transparent_24%)]" />
          <div
            className={`absolute bottom-0 right-0 h-40 w-40 rounded-full bg-gradient-to-br ${glow} blur-2xl`}
          />
          <div className="absolute bottom-6 right-6 z-10 flex h-28 w-28 items-center justify-center rounded-full border border-white/35 bg-white/10 shadow-lg backdrop-blur-sm">
            <button
              type="button"
              className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-black/30"
              onClick={onPlayVideo}
            >
              <Play className="ml-1 h-6 w-6 fill-white text-white" />
            </button>
          </div>
          {/* <div className="absolute bottom-5 right-3 h-14 w-14 rounded-full bg-white/90 blur-[2px]" /> */}
          <div className="relative flex h-full flex-col">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-[1.8rem] font-bold leading-none">
                  <Link href={detailHref} className="hover:underline">
                    {name}
                  </Link>
                </h2>
                <p className="mt-2 text-lg italic text-white/90">
                  {tagline || "Relax & Rejuvenate"}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                  <Share2 className="h-5 w-5 text-white" />
                </button>

                <Badge variant="default" className="bg-blue-600 text-white shadow-lg">
                  <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                  {hours}
                </Badge>
              </div>
            </div>

            <p className="mt-4 max-w-xs text-sm leading-6 text-white/88 line-clamp-2">
              {description || "Experience premium care from our professional team."}
            </p>

            <div className="mt-auto flex flex-col gap-4 pt-4">
              <div className="flex items-start gap-2 text-sm text-white/95">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="line-clamp-1">{address}</span>
              </div>
              <Button
                variant="secondary"
                className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-md hover:bg-blue-50"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, "_blank");
                }}
              >
                <MapPin className="mr-1.5 h-4 w-4" />
                Direction
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-stretch border-t border-slate-200 bg-white lg:flex-col lg:border-l lg:border-t-0 p-[0.5rem] lg:h-full">
          {[
            { icon: Star, label: "View", action: "view" },
            { icon: Users, label: "Staff Select", action: "staff" },
            { icon: Mail, label: "Message Now", action: "message" },
          ].map(({ icon: Icon, label, action }) => {

            return (
              <button
                key={label}
                // variant="ghost"
                type="button"
                onClick={
                  action === "staff"
                    ? onStaffSelect
                    : action === "message"
                      ? onMessageNow
                      : undefined
                }
                className="flex flex-1 flex-col items-center justify-center gap-2 rounded-none border-r border-slate-200 px-3 py-4 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 last:border-r-0 lg:border-b lg:border-r-0 last:lg:border-b-0 hover:bg-accent hover:text-accent-foreground bg-white"
              >
                {/* <Icon className="h-4 w-4 text-blue-600" />
      <span>{label}</span> */}
                {label === "View" ? (
                  <Link href={detailHref} className="flex flex-col items-center justify-center gap-2 text-center text-xs font-semibold text-slate-700 hover:text-blue-600">
                    <Icon className="h-4 w-4 text-blue-600" />
                    <span>{label}</span>
                  </Link>
                ) : (
                  <>
                    <Icon className="h-4 w-4 text-blue-600" />
                    <span className="text-slate-700">{label}</span>
                  </>
                )}

              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center bg-white lg:h-[118px]">
        <CardContent className="grid gap-2 border-t border-slate-200 p-4 md:grid-cols-[minmax(0,1fr)_1px] h-full items-center">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {services.slice(0, 3).map((service) => (
              <div
                key={service.name}
                className="border-r border-slate-100   w-[6rem] flex flex-col items-center justify-center gap-2 h-[6rem] mt-[-0.5rem]"
              >
                <img
                  src={service.image || undefined}
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
            <ServiceDrawer services={services} venueName={name} onBookNow={onBookNow} />
          </div>

        </CardContent>
        <Button
          type="button"
          onClick={onBookNow}
          className="rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 mr-5 text-[12px] py-3 px-6 whitespace-nowrap"
        >
          {/* <CalendarDays className="mr-2 h-4 w-4" /> */}
          Book Now
        </Button>
      </div>
    </Card>
  );
}

export default function MainPage() {
  const router = useRouter();
  const [venueList, setVenueList] = useState<MainVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [messageVenue, setMessageVenue] = useState<Venue | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isExpertSelectionOpen, setIsExpertSelectionOpen] = useState(false);
  const [bookingFlow, setBookingFlow] = useState<"service-first" | "staff-first">("service-first");
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("");
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const carouselVenues = (venueList.length > 0 ? venueList : defaultVenueCards).slice(0, 6);
  const horizontalBanners = carouselVenues.map((venue) => ({
    imageUrl: stripCssUrl(venue.bgImage),
    title: venue.tagline,
    description: venue.description,
    clickThroughUrl: venue.detailHref,
  }));
  const verticalBanners = carouselVenues.slice(0, 1).map((venue) => ({
    imageUrl: stripCssUrl(venue.bgImage),
    title: venue.tagline,
    description: venue.description,
    clickThroughUrl: venue.detailHref,
  }));

  useEffect(() => {
    const updateViewport = () => {
      setIsMobileViewport(window.innerWidth < 1024);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    async function loadOrganizations() {
      try {
        const res = await getOrganizationsListApi();
        if (res && (res as any).status === 'success' && (res as any).data?.organizations) {
          const mapped = (res as any).data.organizations.map((org: any, idx: number) => ({
            ...mapOrgToVenue(org, idx),
            detailHref: `/main/specific/${org._id}`,
            videoUrl: org.introVideo || fallbackVideoUrl,
          }));
          setVenueList(mapped);
        } else {
          setError("Failed to load organizations");
        }
      } catch (err: any) {
        console.error("Error loading organizations:", err);
        setError("Error fetching organizations from backend");
      } finally {
        setLoading(false);
      }
    }
    loadOrganizations();
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      setGreeting("Good Morning 👋");
    } else if (hour < 17) {
      setGreeting("Good Afternoon 👋");
    } else if (hour < 20) {
      setGreeting("Good Evening 👋");
    } else {
      setGreeting("We're Available 24/7 🌙");
    }
  }, []);

  const handleBookNow = (venue: Venue) => {
    if (isMobileViewport) {
      router.push(buildMobileBookingHref(venue.id, {
        flow: "service-first",
      }));
      return;
    }
    setSelectedVenue(venue);
    setBookingFlow("service-first");
    setIsBookingModalOpen(true);
  };

  const handleStaffSelect = (venue: Venue) => {
    if (isMobileViewport) {
      router.push(buildMobileBookingHref(venue.id, {
        flow: "staff-first",
      }));
      return;
    }
    setSelectedVenue(venue);
    setBookingFlow("staff-first");
    setIsBookingModalOpen(true);
  };

  const handlePlayVideo = (venue: Venue) => {
    setActiveVideoUrl((venue as MainVenue).videoUrl || fallbackVideoUrl);
  };

  const handleMessageNow = (venue: Venue) => {
    if (!venue.staff.length) return;

    setMessageVenue(venue);
    setIsExpertSelectionOpen(true);
  };

  const handleSelectExpert = (expert: any) => {
    setSelectedExpert(expert);
    setIsMessageDialogOpen(true);
  };

  return (
    <>
      <main className=" bg-[linear-gradient(180deg,#f8fbff_0%,#f6f8fc_100%)] min-h-screen pb-[3rem] px-1 py-2 md:px-6 lg:px-8">

        <div className="mx-auto grid max-w-[1600px] gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="hidden h-fit rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.45)] xl:block">
            <FilterSidebarContent />
          </aside>

          <div >
            <div className="relative mb-2.5 hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Search..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 h-7"
                />
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Sheet>
                  <SheetTrigger asChild>
                    <button 
                      className="absolute right-2 top-3.5 -translate-y-1/2 p-1.5 h-6 w-8 xl:hidden border-slate-300"
                    >
                      <SlidersHorizontal className="h-4 w-4 text-blue-700" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[320px] p-0 sm:w-[380px]">
                    <div className="h-full overflow-y-auto p-6 bg-white">
                      <FilterSidebarContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

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
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="flex h-9 w-9 items-center justify-center">
                      <SlidersHorizontal className="h-5 w-5 text-blue-700" />
                    </button>
                  </SheetTrigger>

                  <SheetContent side="left" className="w-[320px] p-0 sm:w-[380px]">
                    <div className="h-full overflow-y-auto bg-white p-6">
                      <FilterSidebarContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="mx-auto items-center gap-y-4 lg:hidden mb-2 flex justify-between px-4">
                {[
                { 
                  name: 'Barber', 
                  href: '', 
                  image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop' 
                },
                { 
                  name: 'Salon', 
                  href: '', 
                  image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop' 
                },
                { 
                  name: 'Spa', 
                  href: '', 
                  image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&h=200&fit=crop' 
                },
                { 
                  name: 'Tatoo', 
                  href: '', 
                  image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop' 
                },{ 
                  name: 'Spa', 
                  href: '', 
                  image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&h=200&fit=crop' 
                },
                { 
                  name: 'More', 
                  href: '', 
                  image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=200&h=200&fit=crop"
                  
                }
              ].map((item, index) => (
                  <Link 
                    key={index} 
                    href={item.href}
                    className="flex flex-col items-center gap- group"
                  >
                    <div className="md:w-[5rem] md:h-[5rem] sm:w-[2rem] sm:h-[2rem] w-[3rem] h-[3rem] 
                                  rounded-full bg-blue-700/10 flex items-center justify-center 
                                  overflow-hidden transition-transform duration-200 group-hover:scale-105">
                                    { item.name === 'More' ? (
                                      <div className="w-full h-full flex items-center justify-center text-2xl">
                                      <LayoutGridIcon className="h-6 w-6 text-slate-800" />
                                      </div>
                                    ) : (
                                            <Image
                                              src={item.image}
                                              alt={item.name}
                                              width={80}
                                              height={80}
                                              className="w-full h-full object-cover"
                                            />
                                    )}
                    </div>
                    <p className="text-[10px] text-slate-800 font-semibold">{item.name}</p>
                  </Link>
                ))}
            </div>

                <div className="block lg:hidden">
                  <HomeCarousel
                    sliderVenues={carouselVenues}
                    horizontalBanners={horizontalBanners}
                    verticalBanners={verticalBanners}
                    isLoading={loading} 
                  />
                </div>

                <div className="grid lg:hidden py-1">
                  <div className="flex items-center justify-between px-2">
                  <p className="text-xs font-semibold text-slate-900 mb-1">Trending Nearby</p>
                  <p className="text-[9px] font-semibold text-blue-600 mb- flex items-center">scroll & view more<ArrowRight className="h-3 w-3" /></p>
                  </div>
                  <VenueSlider
                    venues={venueList}
                    isLoading={loading}
                    onBookNow={(venue) => {
                      if (!isExpertSelectionOpen) {
                        handleBookNow(venue);
                      }
                    }}
                  />
                </div>

                <div className="grid lg:hidden">
                  {/* <p className="text-xs font-semibold text-blue-600 flex justify-end px-2 mb-1">scroll & view more<ArrowRight className="h-4 w-4" /></p> */}
                  <BottomVenueSlider
                    venues={venueList}
                    isLoading={loading}
                    onBookNow={(venue) => {
                      if (!isExpertSelectionOpen) {
                        handleBookNow(venue);
                      }
                    }}
                  />
                </div>

                {/* <div className="w-full">
                  <SmallVenueCarousel
                    venues={venueList}
                    onBookNow={(venue) => handleBookNow(venue)}
                    title="Trending Nearby"
                  />
                </div> */}

            <section className="grid gap-6 lg:grid-cols-2 hidden lg:grid">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden rounded-[28px] border-slate-200 shadow-md animate-pulse">
                    <div className="h-[250px] bg-slate-200" />
                    <div className="p-6 space-y-4">
                      <div className="h-6 w-1/3 bg-slate-200 rounded" />
                      <div className="h-4 w-2/3 bg-slate-200 rounded" />
                    </div>
                  </Card>
                ))
              ) : error ? (
                <div className="col-span-2 text-center py-10">
                  <p className="text-red-500 font-semibold">{error}</p>
                </div>
              ) : venueList.length === 0 ? (
                <div className="col-span-2 text-center py-10">
                  <p className="text-slate-500">No partner organizations found.</p>
                </div>
              ) : (
                venueList.map((venue) => (
                  <VenueCard
                    key={`${venue.id}-${venue.name}`}
                    {...venue}
                    onBookNow={() => handleBookNow(venue)}
                    onStaffSelect={() => handleStaffSelect(venue)}
                    onPlayVideo={() => handlePlayVideo(venue)}
                    onMessageNow={() => handleMessageNow(venue)}
                  />
                ))
              )}
            </section>
          </div>
        </div>
      </main>

      {selectedVenue ? (
        <SpecificVenueBookingModal
          open={isBookingModalOpen}
          onOpenChange={setIsBookingModalOpen}
          venue={selectedVenue}
          bookingFlow={bookingFlow}
        />
      ) : null}

      {activeVideoUrl ? (
        <VideoModal
          videoUrl={activeVideoUrl}
          onClose={() => setActiveVideoUrl(null)}
        />
      ) : null}

      {messageVenue ? (
        <ExpertSelectionDialog
          open={isExpertSelectionOpen}
          onOpenChange={setIsExpertSelectionOpen}
          allStaff={messageVenue.staff}
          venueName={messageVenue.name}
          onSelectExpert={handleSelectExpert}
        />
      ) : null}

      {messageVenue && selectedExpert ? (
        <MessageDialog
          open={isMessageDialogOpen}
          onOpenChange={setIsMessageDialogOpen}
          staff={selectedExpert}
          venueName={messageVenue.name}
          allStaff={messageVenue.staff}
          services={messageVenue.services}
        />
      ) : null}
    </>
  );
}

function FilterSidebarContent() {
  return (
    <>
      <div className="flex items-center justify-between ">
        <h1 className="text-2xl font-bold text-slate-900">Filter</h1>
        <Button
          variant="link"
          className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Reset
        </Button>
      </div>

      <div className="mt-6 space-y-5">
        <FilterBlock title="Select Suburb">
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" />
            <select className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-medium text-slate-700 outline-none ring-0 transition focus:border-blue-500">
              {filters.suburbs.map((suburb) => (
                <option key={suburb}>{suburb}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </FilterBlock>

        <FilterBlock title="Price">
          <div className="space-y-3">
            {["High to Low", "Low to High"].map((option, index) => (
              <label key={option} className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="radio"
                  name="price"
                  value={option}
                  className="h-4 w-4 border-slate-300 bg-white text-blue-600 focus:ring-blue-600 [color-scheme:light]"
                  defaultChecked={index === 0} // Makes "Open Now" selected by default
                />
                {option}
              </label>
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Country" collapsible>
          <div className="space-y-3">
            {filters.countries.map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 text-sm text-slate-700"
              >
                <Checkbox
                  id={`country-${option}`}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                {option}
              </label>
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Staff" collapsible>
          <div className="space-y-3">
            {filters.staff.map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 text-sm text-slate-700"
              >
                <Checkbox
                  id={`staff-${option}`}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                {option}
              </label>
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Open Now">
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                Open businesses only
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Show only stores that are currently accepting bookings.
              </p>
            </div>
            <button className="relative mt-1 h-6 w-11 rounded-full bg-emerald-400 shadow-inner">
              <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow" />
            </button>
          </div>
        </FilterBlock>

        <FilterBlock title="Availability" collapsible>
          <div className="space-y-3">
            {["Open Now", "All"].map((option, index) => (
              <label key={option} className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="radio"
                  name="availability"
                  value={option}
                  className="h-4 w-4 border-slate-300 bg-white text-blue-600 focus:ring-blue-600 [color-scheme:light]"
                  defaultChecked={index === 0} // Makes "Open Now" selected by default
                />
                {option}
              </label>
            ))}
          </div>
        </FilterBlock>

        <Button className="w-full rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
          Apply Filters
        </Button>
      </div>
    </>
  );
}
