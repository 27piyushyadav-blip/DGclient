/*
 * File: src/components/SafeImage.tsx
 * SR-DEV: Fully optimized image component.
 * Uses next/image for WebP/AVIF conversion and responsive sizing.
 * Handles loading states and error fallbacks gracefully.
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

const DEFAULT_FALLBACK = "https://placehold.co/600x400/e2e8f0/475569?text=Image+Not+Found";

interface SafeImageProps extends Omit<ComponentProps<typeof Image>, 'src' | 'alt'> {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

export default function SafeImage({
  src,
  alt,
  className,
  fallbackSrc = DEFAULT_FALLBACK,
  fill = false,
  width,
  height,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null | undefined>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Sync state if prop changes
  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-zinc-100 dark:bg-zinc-800", 
        fill ? "w-full h-full" : "",
        className
      )}
      // If not filling, we might need inline styles or wrapper classes for aspect ratio
      style={!fill && width && height ? { width, height } : {}}
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-10 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
      )}

      <Image
        src={hasError ? fallbackSrc : (imgSrc || fallbackSrc)}
        alt={alt || "Image"}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        priority={priority}
        sizes={sizes}
        className={cn(
          "transition-opacity duration-500 ease-in-out",
          isLoading ? "opacity-0" : "opacity-100",
          // If using 'fill', we usually want object-cover
          fill && "object-cover" 
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false); // Stop loading so we see the fallback
        }}
        {...props}
      />
    </div>
  );
}
