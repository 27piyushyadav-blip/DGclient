/*
 * File: src/components/modals/VideoModal.js
 * SR-DEV: Modular component for playing expert intro videos.
 */

"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

export default function VideoModal({ videoUrl, onClose }) {
  if (!videoUrl) return null;

  // Lock body scroll when modal is open
  useEffect(() => { 
    document.body.style.overflow = 'hidden'; 
    return () => { 
      document.body.style.overflow = ''; 
    }; 
  }, []);

  return (
    // Fixed container with dark, blurred overlay
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" 
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
         {/* Close Button */}
         <button 
           onClick={onClose} 
           className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-50"
         >
           <X className="w-6 h-6" />
         </button>
         
         {/* FIX: Use <video> tag instead of <iframe> for direct UploadThing URLs */}
         <video 
           src={videoUrl} 
           className="w-full h-full" 
           controls 
           autoPlay 
           playsInline
         />
      </div>
    </div>
  );
}