/*
 * File: src/components/modals/DocumentViewerModal.js
 * SR-DEV: Modular component for viewing Expert credentials/documents.
 * ACTION: FIXED TypeError by checking if 'document' is defined before accessing 'document.body'.
 */

"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

export default function DocumentViewerModal({ document, onClose }) {
  if (!document || !document.url) return null;

  // Lock body scroll when modal is open
  useEffect(() => { 
    // CRITICAL FIX: Check if we are in the browser environment before accessing document.body
    if (typeof document !== 'undefined' && document.body) {
        document.body.style.overflow = 'hidden'; 
    }
    
    return () => { 
      if (typeof document !== 'undefined' && document.body) {
          document.body.style.overflow = ''; 
      }
    }; 
  }, []);

  return (
    // Fixed container with dark, blurred overlay
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" 
      onClick={onClose}
    >
      <div 
        className="relative z-[101] w-full max-w-5xl h-[85vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
         {/* Close Button */}
         <button 
           onClick={onClose} 
           className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
         >
           <X className="w-6 h-6" />
         </button>
         
         {document.type === 'image' ? (
           // Image Viewer
           <img 
             src={document.url} 
             alt={document.title || "Document Image"} 
             className="max-w-full max-h-full object-contain rounded-lg shadow-2xl bg-black" 
           />
         ) : (
           // PDF Viewer (using iframe)
           <iframe 
             src={document.url} 
             className="w-full h-full bg-white rounded-lg shadow-2xl" 
             title={document.title || "Document"} 
           />
         )}
         
         {/* Title Caption */}
         <p className="mt-4 text-white/90 font-medium text-lg bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
           Viewing: {document.title}
         </p>
      </div>
    </div>
  );
}