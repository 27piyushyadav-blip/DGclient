// FILE: src/app/organizations/OrganizationsClient.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, X, SlidersHorizontal, Loader2, AlertTriangle, Building2 } from "lucide-react";
import OrganizationCard from "@/components/OrganizationCard";

interface Organization {
  _id: string;
  slug: string;
  name: string;
  mission?: string;
  country?: string;
  sessionPriceInfo?: string;
  focusTags?: string[];
  [key: string]: any;
}

interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

interface LocationOption {
  id: string;
  label: string;
  value?: string;
}

interface OrganizationsClientProps {
  initialOrganizations: Organization[];
  error: string | null;
}

const priceRanges: PriceRange[] = [
  { id: "all", label: "All Prices", min: 0, max: Infinity },
  { id: "free", label: "Free", min: 0, max: 0 },
  { id: "under50", label: "Under $50", min: 0, max: 50 },
  { id: "50to100", label: "$50 - $100", min: 50, max: 100 },
  { id: "100to200", label: "$100 - $200", min: 100, max: 200 },
  { id: "above200", label: "Above $200", min: 200, max: Infinity },
];

const getUniqueLocations = (organizations: Organization[]): LocationOption[] => {
  if (!organizations || !Array.isArray(organizations)) {
    return [];
  }
  const locationsSet = new Set<string>();
  organizations.forEach(org => {
    if (org && org.country) {
      locationsSet.add(org.country);
    }
  });
  return Array.from(locationsSet).map(country => ({
    id: country.toLowerCase().replace(/\s+/g, '-'),
    label: country,
    value: country
  }));
};

export default function OrganizationsClient({ initialOrganizations, error: initialError }: OrganizationsClientProps) {
  const [organizations] = useState<Organization[]>(initialOrganizations);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>(initialOrganizations);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);

  // Get unique locations from organizations
  const availableLocations: LocationOption[] = useMemo(() => {
    const locations = getUniqueLocations(organizations);
    return [
      { id: "all", label: "All Locations" },
      ...locations
    ];
  }, [organizations]);

  // Filter organizations based on search, price, and location
  useEffect(() => {
    if (!organizations.length) {
      setFilteredOrganizations([]);
      return;
    }

    setIsFiltering(true);
    
    const timeout = setTimeout(() => {
      let filtered = [...organizations];

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(org =>
          org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          org.mission?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          org.focusTags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Price filter
      if (selectedPrice !== "all") {
        const priceRange = priceRanges.find(range => range.id === selectedPrice);
        if (priceRange) {
          filtered = filtered.filter(org => {
            const priceText = org.sessionPriceInfo || "";
            
            if (selectedPrice === "free") {
              return priceText.toLowerCase().includes("free");
            }
            
            const priceMatch = priceText.match(/\$?(\d+(?:\.\d+)?)/);
            const price = priceMatch ? parseFloat(priceMatch[1]) : null;
            
            if (price) {
              return price >= priceRange.min && price <= priceRange.max;
            }
            return false;
          });
        }
      }

      // Location filter
      if (selectedLocation !== "all") {
        const locationData = availableLocations.find(loc => loc.id === selectedLocation);
        if (locationData && locationData.value) {
          filtered = filtered.filter(org =>
            org.country?.toLowerCase() === locationData.value?.toLowerCase()
          );
        }
      }

      setFilteredOrganizations(filtered);
      setIsFiltering(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, selectedPrice, selectedLocation, organizations, availableLocations]);

  const resetFilters = (): void => {
    setSearchTerm("");
    setSelectedPrice("all");
    setSelectedLocation("all");
  };

  const hasActiveFilters: boolean = searchTerm !== "" || selectedPrice !== "all" || selectedLocation !== "all";

  // Show error state
  if (initialError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
        <AlertTriangle className="w-8 h-8 text-red-600 mb-3" />
        <p className="text-red-700 dark:text-red-300 font-medium">Error: {initialError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-medium text-zinc-700 dark:text-zinc-300"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs rounded-full">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Filter Sidebar */}
      <aside className={`
        fixed inset-0 z-50 lg:relative lg:z-auto lg:block lg:w-80
        transform transition-transform duration-300 ease-in-out
        ${isFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div 
          className={`absolute inset-0 bg-black/50 lg:hidden transition-opacity ${isFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsFilterOpen(false)}
        />
        
        <div className="relative bg-white dark:bg-zinc-900 w-80 h-full lg:h-auto lg:sticky lg:top-24 overflow-y-auto border-r border-zinc-200 dark:border-zinc-800 shadow-xl lg:shadow-none rounded-r-2xl lg:rounded-2xl">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Filters</h2>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                >
                  Reset all
                </button>
              )}
              <button
                onClick={() => setIsFilterOpen(false)}
                className="lg:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search by name, mission, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                Price Range
              </label>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <label key={range.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="price"
                      value={range.id}
                      checked={selectedPrice === range.id}
                      onChange={(e) => setSelectedPrice(e.target.value)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600">
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            {availableLocations.length > 1 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Location
                </label>
                <div className="space-y-2">
                  {availableLocations.map((location) => (
                    <label key={location.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="location"
                        value={location.id}
                        checked={selectedLocation === location.id}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600">
                        {location.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Active filters:</p>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs rounded-full">
                      Search: {searchTerm}
                      <button onClick={() => setSearchTerm("")} className="hover:text-indigo-800">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedPrice !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs rounded-full">
                      Price: {priceRanges.find(p => p.id === selectedPrice)?.label}
                      <button onClick={() => setSelectedPrice("all")} className="hover:text-indigo-800">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedLocation !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs rounded-full">
                      Location: {availableLocations.find(l => l.id === selectedLocation)?.label}
                      <button onClick={() => setSelectedLocation("all")} className="hover:text-indigo-800">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Organizations Grid */}
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Showing {filteredOrganizations.length} of {organizations.length} organizations
          </p>
          {isFiltering && (
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
          )}
        </div>

        {filteredOrganizations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Building2 className="w-16 h-16 mb-4 text-zinc-300" />
            <p className="text-lg font-bold text-zinc-900 dark:text-white">No organizations found</p>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Try adjusting your filters</p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrganizations.map(org => (
              <OrganizationCard key={org._id} organization={org} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}