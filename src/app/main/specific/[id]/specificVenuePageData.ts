import { notFound } from "next/navigation";
import { mapOrgToVenue, type Venue } from "@/app/main/data";
import {
  getOrganizationProfileByIdApi,
  getOrganizationsListApi,
} from "@/lib/directoryApi";

export type VenueBanner = {
  imageUrl: string;
  title?: string;
  description?: string;
  clickThroughUrl?: string;
};

export type SpecificVenuePageData = {
  venue: Venue;
  suggestions: Venue[];
  sliderVenues: Venue[];
  horizontalBanners: VenueBanner[];
  verticalBanners: VenueBanner[];
};

export async function loadSpecificVenuePageData(id: string): Promise<SpecificVenuePageData> {
  const orgRes = await getOrganizationProfileByIdApi(id);

  if (!orgRes || (orgRes as any).status !== "success" || !(orgRes as any).data) {
    notFound();
  }

  const orgData = (orgRes as any).data;
  const venue = mapOrgToVenue(orgData, 0);

  const horizontalBanners: VenueBanner[] =
    (orgData.banners?.horizontal || []).filter((b: any) => b.imageUrl);

  const verticalBanners: VenueBanner[] =
    (orgData.banners?.vertical || []).filter((b: any) => b.imageUrl);

  let suggestions: Venue[] = [];

  try {
    const listRes = await getOrganizationsListApi();
    if (listRes && (listRes as any).status === "success" && (listRes as any).data?.organizations) {
      suggestions = (listRes as any).data.organizations
        .filter((org: any) => org._id !== id)
        .map((org: any, idx: number) => mapOrgToVenue(org, idx + 1));
    }
  } catch (error) {
    console.error("Error loading suggestions for venue page:", error);
  }

  return {
    venue,
    suggestions,
    sliderVenues: [venue, ...suggestions],
    horizontalBanners,
    verticalBanners,
  };
}
