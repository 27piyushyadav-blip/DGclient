"use client"

import { useState, type ReactNode } from "react";
import {
  CalendarDays,
  ChevronDown,
  Circle,
  Clock3,
  Mail,
  MapPin,
  Menu,
  Play,
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
import Link from "next/link";
import { venues } from "./data";
import SpecificVenueBookingModal from "./specific/[id]/SpecificVenueBookingModal";
import MessageDialog from "./specific/[id]/MessageDialog";

const filters = {
  suburbs: ["Ascotvale", "Brunswick", "Docklands"],
  countries: ["Chinese", "Vietnam", "India"],
  staff: ["Male Therapist", "Female Therapist"],
};

// const venues = [
//   {
//     name: "Lomi Massage",
//     hours: "12AM - 7PM",
//     address: "318 Ascotvale Rd, Ascotvale",
//     accent: "from-amber-950 via-amber-800 to-stone-900",
//     glow: "from-amber-300/80 via-orange-200/30 to-transparent",
//     bgImage: "url('/images/massage-1.jpg')",
//     services: [
//       { name: "Hair Cutting", price: "$10" },
//       { name: "Shaving", price: "$20" },
//       { name: "Timing", price: "$30" },
//       { name: "Cleansing", price: "$40" },
//     ],
//   },
//   {
//     name: "Tranquil Touch",
//     hours: "9AM - 5PM",
//     address: "215 Brunswick Road, Ascotvale 3032",
//     accent: "from-stone-950 via-amber-900 to-orange-950",
//     glow: "from-orange-300/70 via-yellow-200/20 to-transparent",
//     bgImage: "url('/images/massage-1.jpg')",
//     services: [
//       { name: "Hair Cutting", price: "$10" },
//       { name: "Shaving", price: "$20" },
//       { name: "Timing", price: "$30" },
//       { name: "Cleansing", price: "$40" },
//     ],
//   },
//   {
//     name: "Blissful Escape",
//     hours: "10AM - 11PM",
//     address: "109 Melrose Drive, Ascotvale 3032",
//     accent: "from-zinc-950 via-amber-900 to-stone-900",
//     glow: "from-orange-200/70 via-amber-100/30 to-transparent",
//     bgImage: "url('/images/massage-1.jpg')",
//     services: [
//       { name: "Hair Cutting", price: "$10" },
//       { name: "Shaving", price: "$20" },
//       { name: "Timing", price: "$30" },
//       { name: "Cleansing", price: "$40" },
//     ],
//   },
//   {
//     name: "Pure Relaxation",
//     hours: "12AM - 7PM",
//     address: "88 Baker Street, Ascotvale 3032",
//     accent: "from-neutral-950 via-amber-900 to-black",
//     glow: "from-orange-300/70 via-amber-100/30 to-transparent",
//     bgImage: "url('/images/massage-1.jpg')",
//     services: [
//       { name: "Hair Cutting", price: "$10" },
//       { name: "Shaving", price: "$20" },
//       { name: "Timing", price: "$30" },
//       { name: "Cleansing", price: "$40" },
//     ],
//   },
//   {
//     name: "Serenity Spa",
//     hours: "9AM - 5PM",
//     address: "420 High Street, Ascotvale 3032",
//     accent: "from-zinc-950 via-amber-800 to-stone-900",
//     glow: "from-amber-300/70 via-orange-200/30 to-transparent",
//     bgImage: "url('/images/massage-1.jpg')",
//     services: [
//       { name: "Hair Cutting", price: "$10" },
//       { name: "Shaving", price: "$20" },
//       { name: "Timing", price: "$30" },
//       { name: "Cleansing", price: "$40" },
//     ],
//   },
//   {
//     name: "Ocean Breeze",
//     hours: "10AM - 1PM",
//     address: "12 Ocean View Parade, Ascotvale 3032",
//     accent: "from-slate-900 via-cyan-900 to-blue-950",
//     glow: "from-cyan-200/70 via-slate-100/30 to-transparent",
//     bgImage: "url('/images/massage-1.jpg')",
//     services: [
//       { name: "Hair Cutting", price: "$10" },
//       { name: "Shaving", price: "$20" },
//       { name: "Timing", price: "$30" },
//       { name: "Cleansing", price: "$40" },
//     ],
//   },
// ];

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
  services: { name: string; price: string }[]; 
  venueName: string;
  onBookNow: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    // <Drawer open={open} onOpenChange={setOpen}>
    //   <DrawerTrigger asChild>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-3 py-2 hover:bg-slate-100 cursor-pointer transition hover:text-blue-700"
        onClick={onBookNow}
        >
          <div className="flex items-center gap-2">
            <div className="min-w-full justify-center align-middle items-center h-full">
              <p className="truncate text-sm font-bold text-blue-600 hover:text-blue-700 text-center mt-2">
                More
              </p>
            </div>
          </div>
        </div>
    //   {/* </DrawerTrigger>
    //   <DrawerContent>
    //     <div className="mx-auto w-full max-w-3xl">
    //       <DrawerHeader>
    //         <DrawerTitle className="text-2xl font-bold text-slate-900">
    //           All Services - {venueName}
    //         </DrawerTitle>
    //         <DrawerDescription>
    //           Browse through all available services and prices
    //         </DrawerDescription>
    //       </DrawerHeader>
    //       <div className="p-6">
    //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //           {services.map((service) => (
    //             <div
    //               key={service.name}
    //               className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
    //             >
    //               <div className="flex items-center justify-between">
    //                 <div className="flex items-center gap-3">
    //                   <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-200 via-orange-100 to-rose-100" />
    //                   <div>
    //                     <p className="font-semibold text-slate-800">
    //                       {service.name}
    //                     </p>
    //                     <p className="text-sm text-slate-500">Service</p>
    //                   </div>
    //                 </div>
    //                 <p className="text-xl font-bold text-blue-600">{service.price}</p>
    //               </div>
    //             </div>
    //           ))}
    //         </div>
    //       </div>
    //       <DrawerFooter>
    //         <DrawerClose asChild>
    //           <Button variant="outline" className="rounded-xl">
    //             Close
    //           </Button>
    //         </DrawerClose>
    //       </DrawerFooter>
    //     </div>
    //   </DrawerContent>
    // </Drawer> */}
  );
}

function VenueCard({
  id,
  name,
  hours,
  address,
  accent,
  glow,
  services,
  onBookNow,
  onStaffSelect,
}: (typeof venues)[number] & {
  onBookNow: () => void;
  onStaffSelect: () => void;
}) {
  return (
    <Card className="overflow-hidden rounded-[28px] border-slate-200 shadow-[0_22px_60px_-36px_rgba(15,23,42,0.35)] lg:max-h-[23.5rem]">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_96px]">
        <div
          className={`relative min-h-[250px] overflow-hidden bg-gradient-to-br ${accent} p-6 text-white`}
        >
            {/* Background Image with Light Overlay */}
  <div 
    className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
    style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop')",
    }}
  />
  
  {/* Dark Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.18),transparent_24%)]" />
          <div
            className={`absolute bottom-0 right-0 h-40 w-40 rounded-full bg-gradient-to-br ${glow} blur-2xl`}
          />
          <div className="absolute bottom-6 right-6 flex h-28 w-28 items-center justify-center rounded-full border border-white/35 bg-white/10 shadow-lg backdrop-blur-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-black/30">
              <Play className="ml-1 h-6 w-6 fill-white text-white" />
            </div>
          </div>
          <div className="absolute bottom-5 right-3 h-14 w-14 rounded-full bg-white/90 blur-[2px]" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[1.8rem] font-bold leading-none">{name}</h2>
                <p className="mt-2 text-lg italic text-white/90">Relax & Rejuvenate</p>
              </div>
              <Badge variant="default" className="bg-blue-600 text-white shadow-lg">
                <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                {hours}
              </Badge>
            </div>

            <p className="mt-6 max-w-xs text-sm leading-6 text-white/88">
              Experience the healing touch of our professional therapists.
            </p>

            <div className="mt-auto flex flex-col gap-4 pt-8">
              <div className="flex items-start gap-2 text-sm text-white/95">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{address}</span>
              </div>
              <Button variant="secondary" className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-md hover:bg-blue-50">
                <MapPin className="mr-1.5 h-4 w-4" />
                Direction
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-stretch border-t border-slate-200 bg-white lg:flex-col lg:border-l lg:border-t-0 p-[0.5rem]">
          {[
  { icon: Star, label: "View", action: "view" },
  { icon: Users, label: "Staff Select", action: "staff" },
  { icon: Mail, label: "Message Now", action: "message" },
].map(({ icon: Icon, label, action }) => {
  // if (action === "view") {
  //   return (
  //     <Link key={label} href={`/main/specific/${id}`} className="flex-1">
  //       <Button
  //         variant="ghost"
  //         className="flex w-full flex-col items-center justify-center gap-2 rounded-none border-r border-slate-200 px-3 py-4 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 last:border-r-0 lg:border-b lg:border-r-0 last:lg:border-b-0"
  //       >
  //         <Icon className="h-4 w-4 text-blue-600" />
  //         <span>{label}</span>
  //       </Button>
  //     </Link>
  //   );
  // }
  
  return (
    <Button
      key={label}
      variant="ghost"
      type="button"
      onClick={action === "staff" ? onStaffSelect : undefined}
      className="flex flex-1 flex-col items-center justify-center gap-2 rounded-none border-r border-slate-200 px-3 py-4 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 last:border-r-0 lg:border-b lg:border-r-0 last:lg:border-b-0"
    >
      {/* <Icon className="h-4 w-4 text-blue-600" />
      <span>{label}</span> */}
      {label === "View" ? (
                <Link href={`/main/specific/${id}`} className="flex flex-col items-center justify-center gap-2 text-center text-xs font-semibold text-slate-700 hover:text-blue-600">
                  <Icon className="h-4 w-4 text-blue-600" />
                  <span>{label}</span>
                </Link>
              ) : (
                <>
                  <Icon className="h-4 w-4 text-blue-600" />
                  <span>{label}</span>
                </>
              )}
      
    </Button>
  );
})}
        </div>
      </div>

<div className="flex justify-between items-center">
      <CardContent className="grid gap-2 border-t border-slate-200 p-4 md:grid-cols-[minmax(0,1fr)_1px]">
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {services.slice(0, 3).map((service) => (
      <div
  key={service.name}
  className="rounded-2xl border border-slate-100 bg-slate-50/60 px-1 py-2"
>
  <div className="flex items-center gap-2">
    <img
      src={service.image} // or service.avatar, service.icon, etc.
      alt={service.name}
      className="h-8 w-8 rounded-full object-cover" // object-cover prevents squeezing
    />
    <div className="min-w-0">
      <p className="truncate text-[11px] font-semibold text-slate-700">
        {service.name.length > 5 ? service.name.slice(0, 5) + "..." : service.name}
      </p>
      <p className="text-xs font-bold text-blue-600">{service.price}</p>
    </div>
  </div>
</div>
    ))}
    
    <ServiceDrawer services={services} venueName={name} onBookNow={onBookNow} />
  </div>
  
</CardContent>
<Button
    type="button"
    onClick={onBookNow}
    className="h-full rounded-xl bg-blue-600  text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 mr-1 text-[12px] py-3"
  >
    {/* <CalendarDays className="mr-2 h-4 w-4" /> */}
    Book Now
  </Button>
  </div>
    </Card>
  );
}

export default function MainPage() {
  const [selectedVenue, setSelectedVenue] = useState<(typeof venues)[number] | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingFlow, setBookingFlow] = useState<"service-first" | "staff-first">("service-first");

  const handleBookNow = (venue: (typeof venues)[number]) => {
    setSelectedVenue(venue);
    setBookingFlow("service-first");
    setIsBookingModalOpen(true);
  };

  const handleStaffSelect = (venue: (typeof venues)[number]) => {
    setSelectedVenue(venue);
    setBookingFlow("staff-first");
    setIsBookingModalOpen(true);
  };

  return (
    <>
      <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f6f8fc_100%)] px-4 py-6 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 xl:hidden mb-5">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="border-slate-200 bg-white shadow-sm">
                <Menu className="m-1 h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] p-0 sm:w-[380px]">
              <div className="h-full overflow-y-auto p-6">
                <FilterSidebarContent />
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-bold text-slate-900">Venues</h1>
          <div className="w-20" />
        </div>

        <div className="mx-auto grid max-w-[1600px] gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="hidden h-fit rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.45)] xl:block">
            <FilterSidebarContent />
          </aside>

          <section className="grid gap-6 2xl:grid-cols-2">
            {venues.map((venue) => (
              <VenueCard
                key={venue.name}
                {...venue}
                onBookNow={() => handleBookNow(venue)}
                onStaffSelect={() => handleStaffSelect(venue)}
              />
            ))}
          </section>
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
    </>
  );
}

function FilterSidebarContent() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Filter</h1>
        <Button variant="link" className="text-sm font-semibold text-blue-600 transition hover:text-blue-700">
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
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    index === 0 ? "border-blue-600" : "border-slate-300"
                  }`}
                >
                  {index === 0 ? <Circle className="h-2.5 w-2.5 fill-blue-600 text-blue-600" /> : null}
                </span>
                {option}
              </label>
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Country" collapsible>
          <div className="space-y-3">
            {filters.countries.map((option) => (
              <label key={option} className="flex items-center gap-3 text-sm text-slate-700">
                <Checkbox id={`country-${option}`} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                {option}
              </label>
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Staff" collapsible>
          <div className="space-y-3">
            {filters.staff.map((option) => (
              <label key={option} className="flex items-center gap-3 text-sm text-slate-700">
                <Checkbox id={`staff-${option}`} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
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
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    index === 0 ? "border-blue-600" : "border-slate-300"
                  }`}
                >
                  {index === 0 ? <Circle className="h-2.5 w-2.5 fill-blue-600 text-blue-600" /> : null}
                </span>
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
