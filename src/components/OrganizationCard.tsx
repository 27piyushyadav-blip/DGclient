/*
 * File: src/components/OrganizationCard.js
 * SR-DEV: Preview card for the Organization listing page.
 * Features: Displays organization logo, name, focus, and expert count.
 */

import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { cn } from "@/lib/utils";
import { Users, Video, Building2 } from "lucide-react";

export default function OrganizationCard({ organization }) {
  const expertCount = organization.expertCount || 0;
  
  return (
    <Link href={`/organizations/${organization.slug}`} className="block h-full">
      <div className="group flex flex-col justify-between h-full p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        
        {/* --- Header: Logo & Identity --- */}
        <div className="flex items-start gap-4 mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <SafeImage 
            src={organization.logoUrl} 
            alt={`${organization.name} Logo`} 
            className="w-12 h-12 rounded-lg shrink-0 border border-zinc-100 dark:border-zinc-700 shadow-inner"
            width={48}
            height={48}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white truncate group-hover:text-primary transition-colors">
              {organization.name}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 uppercase tracking-wider">
              Partner Program
            </p>
          </div>
        </div>

        {/* --- Content: Mission/Focus --- */}
        <div className="flex-1 space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
             <Building2 className="w-4 h-4 text-primary" />
             <span className="truncate">{organization.focusTags?.[0] || organization.specialization}</span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
            {organization.mission || "Click to learn more about how this program supports your wellness journey."}
          </p>
        </div>

        {/* --- Footer: Expert Count & Action --- */}
        <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-white">
            <Users className="w-4 h-4 text-green-500" />
            <span>{expertCount} Experts</span>
          </div>
          <div className="text-sm font-semibold text-primary group-hover:underline flex items-center gap-1">
            View Program
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-0.5 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </div>

      </div>
    </Link>
  );
}