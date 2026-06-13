import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { mapOrgToVenue } from "@/app/main/data";
import { getOrganizationProfileByIdApi } from "@/lib/directoryApi";
import SpecificVenueClientWrapper from "./SpecificVenueClientWrapper";

// Always fetch fresh data so newly uploaded banners appear immediately.
export const dynamic = "force-dynamic";

// React.cache() deduplicates this call within a single request:
// generateMetadata and the page component share the same result, so the
// backend is only hit once instead of twice.
const getCachedOrgProfile = cache(async (id: string) => {
  return getOrganizationProfileByIdApi(id);
});

type SpecificPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: SpecificPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const orgRes = await getCachedOrgProfile(id);
    if (orgRes && (orgRes as any).status === "success" && (orgRes as any).data) {
      const orgData = (orgRes as any).data;
      const venue = mapOrgToVenue(orgData, 0);

      const coverImage = orgData.coverImageUrl || "";
      const logoImage = orgData.logo || "";
      // Prioritize Cover Image (landscape) over Logo (square) to trigger the large image card on WhatsApp/Slack.
      const shareImage = coverImage || logoImage || "";

      const siteUrl = process.env.NEXTAUTH_URL || "https://digitaloffices.com.au";
      return {
        metadataBase: new URL(siteUrl),
        title: venue.name,
        description:
          venue.tagline || venue.description || `Check out ${venue.name} on Mind Namo!`,
        openGraph: {
          title: venue.name,
          description:
            venue.tagline || venue.description || `Check out ${venue.name} on Mind Namo!`,
          url: `/main/specific/${id}`,
          siteName: "Mind Namo",
          images: shareImage
            ? [
                {
                  url: shareImage,
                  width: 1200,
                  height: 630,
                  alt: venue.name,
                },
              ]
            : [],
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: venue.name,
          description:
            venue.tagline || venue.description || `Check out ${venue.name} on Mind Namo!`,
          images: shareImage ? [shareImage] : [],
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata for venue page:", error);
  }

  return {
    metadataBase: new URL(process.env.NEXTAUTH_URL || "https://digitaloffices.com.au"),
    title: "Organization Detail | Mind Namo",
    description: "View organization details and book services on Mind Namo.",
  };
}

export default async function SpecificVenuePage({ params }: SpecificPageProps) {
  const { id } = await params;

  // Uses the same cached result as generateMetadata, so there is no duplicate
  // network request for the organization profile.
  const orgRes = await getCachedOrgProfile(id);

  if (!orgRes || (orgRes as any).status !== "success" || !(orgRes as any).data) {
    notFound();
  }

  const orgData = (orgRes as any).data;
  const venue = mapOrgToVenue(orgData, 0);

  // Extract horizontal banners from the API response.
  const horizontalBanners: {
    imageUrl: string;
    title?: string;
    description?: string;
    clickThroughUrl?: string;
  }[] = (orgData.banners?.horizontal || []).filter((b: any) => b.imageUrl);

  // Extract vertical banners from the API response.
  const verticalBanners: {
    imageUrl: string;
    title?: string;
    description?: string;
    clickThroughUrl?: string;
  }[] = (orgData.banners?.vertical || []).filter((b: any) => b.imageUrl);

  // Suggestions are loaded lazily on the client side so they never block the
  // critical render of the page.
  return (
    <SpecificVenueClientWrapper
      venue={venue}
      currentOrgId={id}
      horizontalBanners={horizontalBanners}
      verticalBanners={verticalBanners}
    />
  );
}
