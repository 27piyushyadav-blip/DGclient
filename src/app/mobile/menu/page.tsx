"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Heart,
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
  CalendarDays,
} from "lucide-react";

const categories = [
  { id: "hair-cut", label: "Hair Cut", icon: Scissors },
  { id: "beard-trim", label: "Beard Trim", icon: Wind },
  { id: "shave", label: "Shave", icon: Droplets },
  { id: "hair-styling", label: "Hair Styling", icon: Wand2 },
  { id: "hair-color", label: "Hair Color", icon: Palette },
  { id: "kids-cut", label: "Kids Cut", icon: Baby },
  { id: "hot-towel-shave", label: "Hot Towel Shave", icon: Flame },
  { id: "facial", label: "Facial", icon: Smile },
  { id: "packages", label: "Packages", icon: Package },
  { id: "add-ons", label: "Add-ons", icon: Settings },
];

const popularHairCuts = [
  { id: "classic-cut", name: "Classic Cut", price: 30, duration: 30, image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop" },
  { id: "fade-cut", name: "Fade Cut", price: 35, duration: 30, image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop" },
  { id: "undercut", name: "Undercut", price: 35, duration: 35, image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=400&auto=format&fit=crop" },
  { id: "taper-cut", name: "Taper Cut", price: 30, duration: 30, image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=400&auto=format&fit=crop" },
  { id: "crew-cut", name: "Crew Cut", price: 25, duration: 20, image: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?q=80&w=400&auto=format&fit=crop" },
  { id: "buzz-cut", name: "Buzz Cut", price: 20, duration: 15, image: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=400&auto=format&fit=crop" },
  { id: "textured-crop", name: "Textured Crop", price: 35, duration: 30, image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&auto=format&fit=crop" },
  { id: "quiff", name: "Quiff", price: 35, duration: 30, image: "https://images.unsplash.com/photo-1620577691299-9a753f4cd1c1?q=80&w=400&auto=format&fit=crop" },
  { id: "side-part", name: "Side Part", price: 30, duration: 25, image: "https://images.unsplash.com/photo-1599351431613-18ef1fdd27e1?q=80&w=400&auto=format&fit=crop" },
];

const youMayAlsoLike = [
  { id: "beard-trim", label: "Beard Trim", image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=200&auto=format&fit=crop" },
  { id: "shave", label: "Shave", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=200&auto=format&fit=crop" },
  { id: "hair-styling", label: "Hair Styling", image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=200&auto=format&fit=crop" },
  { id: "hair-color", label: "Hair Color", image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=200&auto=format&fit=crop" },
  { id: "packages", label: "Packages", image: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=200&auto=format&fit=crop" },
];

export default function MobileMenuPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("hair-cut");
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
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
            placeholder="Search hair cuts..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <SlidersHorizontal className="h-4 w-4 text-blue-700" />
          {/* <SlidersHorizontal className="h-4 w-4 text-slate-500" /> */}
        </div>
      </div>

      {/* Body: category sidebar + content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Category sidebar */}
        <aside className="w-[34%] shrink-0 overflow-y-auto border-r border-slate-100 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => {
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
            <h2 className="text-sm font-bold text-slate-900">Popular Hair Cuts</h2>
            <button type="button" className="flex items-center gap-0.5 text-xs font-semibold text-blue-600">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-3 gap-2">
            {popularHairCuts.map((item) => {
              const isFav = favorites.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className="text-left bg-slate-100 rounded-sm"
                  onClick={() => router.push("/main")}
                >
                  <div className="relative">
                    <div
                      className="h-20 w-full rounded-xl bg-slate-200 bg-cover bg-center"
                      style={{ backgroundImage: `url('${item.image}')` }}
                    />
                    {/* <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm"
                    >
                      <Heart
                        className={`h-3.5 w-3.5 ${isFav ? "fill-red-500 text-red-500" : "text-slate-700"}`}
                      />
                    </span> */}
                  </div>
                  <p className="mt-1.5 text-[10px] font-semibold text-slate-900">{item.name}</p>
                  <p className="text-[10px] font-bold text-slate-900">${item.price}</p>
                  <div className="mt-0.5 flex items-center gap-1 text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span className="text-[10px]">{item.duration} min</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* You May Also Like */}
          <div className="flex items-center justify-between pt-5 pb-2">
            <h2 className="text-sm font-bold text-slate-900">You May Also Like</h2>
            <button type="button" className="flex items-center gap-0.5 text-xs font-semibold text-blue-600">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-[2rem] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {youMayAlsoLike.map((item) => (
              <button key={item.id} type="button" className="flex w-14 shrink-0 flex-col items-center gap-1">
                <div
                  className="h-14 w-14 rounded-full bg-slate-200 bg-cover bg-center"
                  style={{ backgroundImage: `url('${item.image}')` }}
                />
                <span className="truncate text-[10px] font-medium text-slate-700">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
