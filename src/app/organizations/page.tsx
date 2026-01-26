/*
 * File: src/app/organizations/page.js
 */

import { Suspense } from "react";
import Link from "next/link";
import { Loader2Icon } from "@/components/Icons";
import { Building2, AlertTriangle } from "lucide-react";
import OrganizationCard from "@/components/OrganizationCard"; 

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// --- UPDATED METADATA ---
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
        url: "/og-organizations.jpg", // Make sure this image exists in /public
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

// ... (Rest of the file remains exactly the same: getAllOrganizations, OrganizationListClient, OrganizationLoading, OrganizationsPage)

async function getAllOrganizations() {
    try {
        // In a real implementation, this would fetch from a database
        // For now, return empty array with success
        return { success: true, organizations: [] };
    } catch (error) {
        return { 
            success: false, 
            organizations: [], 
            message: "Failed to load organizations. Please try again later." 
        };
    }
}

function OrganizationListClient({ data }) {
    if (data.error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-red-600 mb-3" />
                <p className="text-red-700 dark:text-red-300 font-medium">Error: {data.error}</p>
            </div>
        );
    }
    
    if (data.organizations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center opacity-70">
                <Building2 className="w-16 h-16 mb-4 text-zinc-300" />
                <p className="text-lg font-bold text-zinc-900 dark:text-white">No partner organizations found</p>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">Check back soon for new corporate and institutional partners.</p>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {data.organizations.map(org => (
                <OrganizationCard key={org._id} organization={org} />
            ))}
        </div>
    );
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
                    <OrganizationListClient 
                        data={{ 
                            organizations: data.organizations, 
                            error: data.success ? null : data.message 
                        }} 
                    />
                </Suspense>

            </main>
        </div>
    );
}