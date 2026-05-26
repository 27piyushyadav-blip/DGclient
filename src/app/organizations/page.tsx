// FILE: src/app/organizations/page.tsx

import { Suspense } from "react";
import { Building2, AlertTriangle } from "lucide-react";
import OrganizationCard from "@/components/OrganizationCard";
import { getOrganizationsListApi } from "@/lib/directoryApi";
import OrganizationsClient from "./OrganizationsClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: "Organizations | Mind Namo",
  description: "Browse companies and institutions offering wellness programs through Mind Namo's network of experts.",
  openGraph: {
    title: "Corporate & Institutional Wellness Partners | Mind Namo",
    description: "Explore organizations prioritizing mental health. Find programs supported by your company or university.",
    url: "/organizations",
    siteName: "Mind Namo",
    images: [
      {
        url: "/og-organizations.jpg",
        width: 1200,
        height: 630,
        alt: "Mind Namo Wellness Partners",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mind Namo Partner Organizations",
    description: "See the companies leading the way in employee mental wellness.",
    images: ["/og-organizations.jpg"],
  },
};

interface Organization {
  _id: string;
  name: string;
  slug: string;
  mission?: string;
  country?: string;
  sessionPriceInfo?: string;
  focusTags?: string[];
  [key: string]: any;
}

interface ApiResponse {
  success: boolean;
  organizations: Organization[];
  message?: string;
}

type OrganizationsApiResponse = {
  data?: {
    organizations?: Organization[];
  };
};

async function getAllOrganizations(): Promise<ApiResponse> {
  try {
    const response = await getOrganizationsListApi() as {
      data?: {
        organizations?: Organization[];
      };
    };
    console.log("Response Organization:-", response);
    return {
      success: true,
      organizations: response.data?.organizations || []
    };
  } catch (error) {
    return {
      success: false,
      organizations: [],
      message: "Failed to load organizations. Please try again later."
    };
  }
}

function OrganizationLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-6 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-zinc-300 dark:bg-zinc-700" />
            <div className="h-6 w-3/4 bg-zinc-300 dark:bg-zinc-700 rounded" />
          </div>
          <div className="h-4 w-11/12 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
          <div className="h-3 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  );
}

export default async function OrganizationsPage() {
  const data = await getAllOrganizations();

  return (
    <div className="flex flex-col w-full bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <main className="container mx-auto max-w-7xl px-4 py-8 md:py-12 flex-1">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Our Partner Organizations
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Find expert support provided by your company, university, or affiliated group.
          </p>
        </div>

        <Suspense fallback={<OrganizationLoading />}>
          <OrganizationsClient
            initialOrganizations={data.organizations}
            error={data.success ? null : data.message || null}
          />
        </Suspense>
      </main>
    </div>
  );
}