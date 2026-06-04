import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mapOrgToVenue } from "@/app/main/data";
import { getOrganizationProfileByIdApi, getOrganizationsListApi } from "@/lib/directoryApi";
import SpecificVenueClientWrapper from "./SpecificVenueClientWrapper";

// Always fetch fresh data so newly uploaded banners appear immediately
export const dynamic = "force-dynamic";

type SpecificPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: SpecificPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const orgRes = await getOrganizationProfileByIdApi(id);
    if (orgRes && (orgRes as any).status === 'success' && (orgRes as any).data) {
      const orgData = (orgRes as any).data;
      const venue = mapOrgToVenue(orgData, 0);

      const coverImage = orgData.coverImageUrl || "";
      const logoImage = orgData.logo || "";
      const shareImage = logoImage || coverImage || "";

      const siteUrl = process.env.NEXTAUTH_URL || 'https://digitaloffices.com.au';
      return {
        metadataBase: new URL(siteUrl),
        title: venue.name,
        description: venue.tagline || venue.description || `Check out ${venue.name} on Mind Namo!`,
        openGraph: {
          title: venue.name,
          description: venue.tagline || venue.description || `Check out ${venue.name} on Mind Namo!`,
          url: `/main/specific/${id}`,
          siteName: 'Mind Namo',
          images: shareImage ? [
            {
              url: shareImage,
              width: 800,
              height: 600,
              alt: venue.name,
            },
          ] : [],
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: venue.name,
          description: venue.tagline || venue.description || `Check out ${venue.name} on Mind Namo!`,
          images: shareImage ? [shareImage] : [],
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata for venue page:", error);
  }

  return {
    title: 'Organization Detail | Mind Namo',
    description: 'View organization details and book services on Mind Namo.',
  };
}

export default async function SpecificVenuePage({ params }: SpecificPageProps) {
  const { id } = await params;

  // Fetch organization profile from backend API (no-store to always get fresh banners)
  const orgRes = await getOrganizationProfileByIdApi(id);

  if (!orgRes || (orgRes as any).status !== 'success' || !(orgRes as any).data) {
    notFound();
  }

  const orgData = (orgRes as any).data;
  const venue = mapOrgToVenue(orgData, 0);

  // Extract horizontal banners from the API response
  const horizontalBanners: { imageUrl: string; title?: string; description?: string; clickThroughUrl?: string }[] =
    (orgData.banners?.horizontal || []).filter((b: any) => b.imageUrl);

  // Extract vertical banners from the API response
  const verticalBanners: { imageUrl: string; title?: string; description?: string; clickThroughUrl?: string }[] =
    (orgData.banners?.vertical || []).filter((b: any) => b.imageUrl);

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
      horizontalBanners={horizontalBanners}
      verticalBanners={verticalBanners}
    />
  );
}
