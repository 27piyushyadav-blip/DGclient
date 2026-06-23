"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Clock,
  ChevronRight,
  Scissors,
  Wind,
  Droplets,
  Wand2,
  Palette,
  Baby,
  Flame,
  Smile,
  Package,
  Settings,
  LayoutGrid,
} from "lucide-react";

import { buildMobileBookingHref } from "@/app/main/mobile/bookingRoute";
import { getCategoriesApi, getServicesByCategoryApi, type Service } from "@/lib/servicesApi";

const DEFAULT_SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop";
const DEFAULT_DURATION_MINUTES = 30;

const ALL_CATEGORY_ID = "all";

const categories = [
  { id: "hair-cut", label: "Hair Cut", icon: Scissors, image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=200&auto=format&fit=crop" },
  { id: "beard-trim", label: "Beard Trim", icon: Wind, image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=200&auto=format&fit=crop" },
  { id: "shave", label: "Shave", icon: Droplets, image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=200&auto=format&fit=crop" },
  { id: "hair-styling", label: "Hair Styling", icon: Wand2, image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=200&auto=format&fit=crop" },
  { id: "hair-color", label: "Hair Color", icon: Palette, image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=200&auto=format&fit=crop" },
  { id: "kids-cut", label: "Kids Cut", icon: Baby, image: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?q=80&w=200&auto=format&fit=crop" },
  { id: "hot-towel-shave", label: "Hot Towel Shave", icon: Flame, image: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=200&auto=format&fit=crop" },
  { id: "facial", label: "Facial", icon: Smile, image: "https://images.unsplash.com/photo-1570172619644-dfd0fddf5d59?q=80&w=200&auto=format&fit=crop" },
  { id: "packages", label: "Packages", icon: Package, image: "https://images.unsplash.com/photo-1620577691299-9a753f4cd1c1?q=80&w=200&auto=format&fit=crop" },
  { id: "add-ons", label: "Add-ons", icon: Settings, image: "https://images.unsplash.com/photo-1599351431613-18ef1fdd27e1?q=80&w=200&auto=format&fit=crop" },
];

const sidebarCategories = [
  { id: ALL_CATEGORY_ID, label: "All", icon: LayoutGrid, image: DEFAULT_SERVICE_IMAGE },
  ...categories,
];

function formatPrice(price: string | null) {
  if (!price) return "—";
  const parsed = Number.parseFloat(price);
  return Number.isNaN(parsed) ? price : `$${parsed.toFixed(2)}`;
}

export default function MobileMenuPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY_ID);
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const activeCategoryLabel =
    sidebarCategories.find((category) => category.id === activeCategory)?.label ?? "Services";

  useEffect(() => {
    let mounted = true;

    async function loadServices() {
      try {
        setIsLoading(true);
        setLoadError(null);

        if (activeCategory === ALL_CATEGORY_ID) {
          const response = await getCategoriesApi();
          if (!mounted) return;
          setServices(response.data?.categories ?? []);
        } else {
          const response = await getServicesByCategoryApi(activeCategory);
          if (!mounted) return;
          setServices(response.data?.services ?? response.data?.categories ?? []);
        }
      } catch {
        if (!mounted) return;
        setLoadError("Could not load services.");
        setServices([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadServices();

    return () => {
      mounted = false;
    };
  }, [activeCategory]);

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return services;
    return services.filter((service) => service.name.toLowerCase().includes(query));
  }, [searchQuery, services]);

  const handleServiceClick = (service: Service) => {
    router.push(
      buildMobileBookingHref(service.organization._id, {
        service: service.name,
      }),
    );
  };

  return (
    <div className="flex h-full flex-col bg-white block md:hidden">

      {/* Search bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search hair cuts..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <SlidersHorizontal className="h-4 w-4 text-blue-700" />
        </div>
      </div>

      {/* Body: category sidebar + content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Category sidebar */}
        <aside className="w-[34%] shrink-0 overflow-y-auto border-r border-slate-100 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sidebarCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`flex w-full items-center gap-2 px-3 py-4 text-left transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span className="text-xs font-medium leading-tight">{category.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

          {/* Popular Hair Cuts header */}
          <div className="flex items-center justify-between pt-3 pb-2">
            <h2 className="text-sm font-bold text-slate-900">{activeCategoryLabel}</h2>
            <button type="button" className="flex items-center gap-0.5 text-xs font-semibold text-blue-600">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-sm bg-slate-100 p-1">
                  <div className="h-20 w-full rounded-xl bg-slate-200" />
                  <div className="mt-1.5 h-2.5 w-3/4 rounded bg-slate-200" />
                  <div className="mt-1 h-2.5 w-1/2 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <p className="py-6 text-center text-xs text-red-500">{loadError}</p>
          ) : filteredServices.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">No services found.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filteredServices.map((item) => {
                const durationMinutes = item.durationMinutes ?? DEFAULT_DURATION_MINUTES;
                const imageUrl = item.imageUrl || DEFAULT_SERVICE_IMAGE;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className="text-left bg-slate-100 rounded-sm"
                    onClick={() => handleServiceClick(item)}
                  >
                    <div className="relative">
                      <div
                        className="h-20 w-full rounded-sm bg-slate-200 bg-cover bg-center"
                        style={{ backgroundImage: `url('${imageUrl}')` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] font-semibold text-slate-900">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-900">{formatPrice(item.price)}</p>
                    <div className="mt-0.5 flex items-center gap-1 text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px]">{durationMinutes} min</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* You May Also Like */}
          <div className="flex items-center justify-between pt-5 pb-2">
            <h2 className="text-sm font-bold text-slate-900">You May Also Like</h2>
            <button type="button" className="flex items-center gap-0.5 text-xs font-semibold text-blue-600">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-[2rem] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className="flex w-14 shrink-0 flex-col items-center gap-1"
                onClick={() => setActiveCategory(category.id)}
              >
                <div
                  className={`h-14 w-14 rounded-full bg-slate-200 bg-cover bg-center ${
                    activeCategory === category.id ? "ring-2 ring-slate-900" : ""
                  }`}
                  style={{ backgroundImage: `url('${category.image}')` }}
                />
                <span className="truncate text-[10px] font-medium text-slate-700">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
