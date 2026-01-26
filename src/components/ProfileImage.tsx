/*
 * File: src/components/ProfileImage.tsx
 * SR-DEV: Premium Profile Image (Vibrant Initials + Zero-Flicker)
 *
 * FEATURES:
 * - Vibrant Initials: Assigns a unique, consistent background color based on the name.
 * - Zero-Flicker: Preloads images in background before swapping.
 * - Accessibility: Initials have high contrast.
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Vibrant Tailwind-compatible colors
const COLORS: string[] = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
];

const getColorFromName = (name: string | null | undefined): string => {
  if (!name) return "bg-zinc-400"; // Default gray
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
};

interface ProfileImageProps {
  src?: string | null;
  name?: string | null;
  sizeClass?: string;
  textClass?: string;
  className?: string;
  priority?: boolean;
}

export default function ProfileImage({ 
  src, 
  name, 
  sizeClass = "h-10 w-10", 
  textClass = "text-sm", 
  className,
  priority = true 
}: ProfileImageProps) {
  const [visibleSrc, setVisibleSrc] = useState<string | null | undefined>(src);
  const [imgError, setImgError] = useState<boolean>(false);

  // Calculate consistent color
  const bgColor = useMemo(() => getColorFromName(name), [name]);

  // Smart Preloading Logic
  useEffect(() => {
    if (!src) {
      setVisibleSrc(null);
      return;
    }
    if (src === visibleSrc) return;

    // Preload the new image in the background
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setImgError(false);
      setVisibleSrc(src);
    };
    img.onerror = () => {
      setImgError(true);
      setVisibleSrc(src); // Fallback handles error state
    };
  }, [src, visibleSrc]);

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-full shrink-0 select-none border border-white/10 dark:border-zinc-700 shadow-sm",
        // If no image, use the vibrant color. If image exists, use neutral background while loading.
        visibleSrc && !imgError ? "bg-zinc-100 dark:bg-zinc-800" : bgColor,
        sizeClass,
        className
      )}
    >
      {/* Layer A: Initials Fallback (Always rendered underneath) */}
      <div className={cn(
          "absolute inset-0 flex items-center justify-center font-bold z-0",
          // Ensure text is legible on vibrant backgrounds
          visibleSrc && !imgError ? "text-zinc-400" : "text-white"
        )}>
        <span className={textClass}>{initials}</span>
      </div>

      {/* Layer B: Image (Fades in or sits on top) */}
      {visibleSrc && !imgError && (
        <Image
          key={visibleSrc}
          src={visibleSrc}
          alt={name || "Profile"}
          fill
          className="object-cover z-10"
          sizes="(max-width: 768px) 96px, 128px"
          priority={priority}
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}
