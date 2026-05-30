import { notFound } from "next/navigation";
import { mapOrgToVenue } from "@/app/main/data";
import { getOrganizationProfileByIdApi, getOrganizationsListApi } from "@/lib/directoryApi";
import SpecificVenueClientWrapper from "./SpecificVenueClientWrapper";

type SpecificPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SpecificVenuePage({ params }: SpecificPageProps) {
  const { id } = await params;

  // Fetch organization profile from backend API
  const orgRes = await getOrganizationProfileByIdApi(id);
  if (!orgRes || (orgRes as any).status !== 'success' || !(orgRes as any).data) {
    notFound();
  }

  const venue = mapOrgToVenue((orgRes as any).data, 0);

  // Fetch suggestions list from backend API
  let suggestions: any[] = [];
  try {
    const listRes = await getOrganizationsListApi();
    if (listRes && (listRes as any).status === 'success' && (listRes as any).data?.organizations) {
      suggestions = (listRes as any).data.organizations
        .filter((org: any) => org._id !== id)
        .slice(0, 4)
        .map((org: any, idx: number) => mapOrgToVenue(org, idx + 1));
    }
  } catch (error) {
    console.error("Error loading suggestions for venue page:", error);
  }

  const sliderVenues = [venue, ...suggestions];

  return (
    <SpecificVenueClientWrapper
      venue={venue}
      suggestions={suggestions}
      sliderVenues={sliderVenues}
    />
  );
}
