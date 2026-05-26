import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
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
import { getVenueById, venues } from "@/app/main/data";
import SpecificVenueClientWrapper from "./SpecificVenueClientWrapper";

type SpecificPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const infoIcons = [ShieldCheck, UserRoundCheck, CalendarDays, Star];

export default async function SpecificVenuePage({ params }: SpecificPageProps) {
  const { id } = await params;
  const venue = getVenueById(id);
  if (!venue) {
    notFound();
  }

  const suggestions = venues.filter((item) => item.id !== venue.id).slice(0, 4);
  const sliderVenues = [venue, ...suggestions];

  return (
    <SpecificVenueClientWrapper
      venue={venue}
      suggestions={suggestions}
      sliderVenues={sliderVenues}
    />
  );
}
