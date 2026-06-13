"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import MobileVenueBookingScreen from "../../MobileVenueBookingModal";
import { venues as fallbackVenues, mapOrgToVenue, type Venue } from "@/app/main/data";
import { getOrganizationsListApi } from "@/lib/directoryApi";
import { Button } from "@/components/ui/button";

function MobileBookingPageSkeleton() {
  return (
    <div className="min-h-dvh bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <div className="h-12 w-32 rounded-full bg-slate-200 animate-pulse" />
        <div className="mt-4 h-[220px] rounded-[28px] bg-slate-200 animate-pulse" />
        <div className="mt-4 h-28 rounded-[28px] bg-slate-200 animate-pulse" />
        <div className="mt-4 h-52 rounded-[28px] bg-slate-200 animate-pulse" />
      </div>
    </div>
  );
}

export default function MobileVenueBookingPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const venueId = Array.isArray(params.id) ? params.id[0] : params.id;
  const flowParam = searchParams.get("flow");
  const stepParam = searchParams.get("step");
  const serviceParam = searchParams.get("service");
  const staffParam = searchParams.get("staff");

  const bookingFlow = flowParam === "staff-first" ? "staff-first" : "service-first";
  const initialStep = Number(stepParam) > 0 ? Number(stepParam) : 1;

  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadVenue() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const response = await getOrganizationsListApi();
        const organizations = response && (response as any).status === "success"
          ? (response as any).data?.organizations || []
          : [];

        const mappedVenues = organizations.map((org: any, index: number) => ({
          ...mapOrgToVenue(org, index),
          id: org._id,
          userId: org.userId || org._id,
        }));

        const foundVenue = mappedVenues.find(
          (item: Venue) => item.id === venueId || item.userId === venueId,
        ) || fallbackVenues.find((item) => item.id === venueId) || null;

        if (!mounted) return;
        setVenue(foundVenue);
      } catch (error) {
        if (!mounted) return;
        const foundFallback = fallbackVenues.find((item) => item.id === venueId) || null;
        setVenue(foundFallback);
        setLoadError(foundFallback ? null : "Could not load this booking page.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    if (venueId) {
      void loadVenue();
    } else {
      setLoadError("Invalid booking link.");
      setIsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [venueId]);

  const backHref = "/main";

  if (isLoading) {
    return <MobileBookingPageSkeleton />;
  }

  if (loadError || !venue) {
    return (
      <div className="min-h-dvh bg-slate-50 px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            className="h-10 rounded-full border-slate-200 bg-white text-blue-600"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Booking unavailable</h1>
            <p className="mt-2 text-sm text-slate-500">
              {loadError || "We could not find the selected venue."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MobileVenueBookingScreen
      venue={venue}
      venueId={venueId}
      venueBannerUrl={venue.bgImage}
      bookingFlow={bookingFlow}
      initialStep={initialStep}
      preselectedService={
        serviceParam ? venue.services.find((service) => service.name === serviceParam) ?? null : null
      }
      preselectedStaff={
        staffParam ? venue.staff.find((staff) => staff.name === staffParam) ?? null : null
      }
      backHref={backHref}
    />
  );
}
