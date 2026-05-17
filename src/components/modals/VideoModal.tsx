/*
 * File: src/components/modals/VideoModal.tsx
 * SR-DEV: Modular component for playing expert intro videos.
 */

"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type VideoModalProps = {
  videoUrl: string;
  onClose: () => void;
};

const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;

  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[1]?.length === 11 ? match[1] : null;
};

export default function VideoModal({ videoUrl, onClose }: VideoModalProps) {
  if (!videoUrl || typeof document === "undefined") return null;

  const youtubeVideoId = getYouTubeVideoId(videoUrl);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
        >
          <X className="h-6 w-6" />
        </button>

        {youtubeVideoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video player"
          />
        ) : (
          <video
            src={videoUrl}
            className="h-full w-full"
            controls
            autoPlay
            playsInline
          />
        )}
      </div>
    </div>,
    document.body
  );
}
