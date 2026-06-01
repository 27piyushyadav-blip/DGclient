// "use client";

// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
// import { User, X, Check } from "lucide-react";
// import Image from "next/image";
// import { useState } from "react";

// interface StaffMember {
//   name: string;
//   role: string;
//   imageUrl: string;
// }

// interface ChangeExpertDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   currentExpert: StaffMember;
//   allExperts: StaffMember[];
//   onSelectExpert: (expert: StaffMember) => void;
// }

// export default function ChangeExpertDialog({
//   open,
//   onOpenChange,
//   currentExpert,
//   allExperts,
//   onSelectExpert,
// }: ChangeExpertDialogProps) {
//   const [selectedExpert, setSelectedExpert] = useState<StaffMember | null>(null);

//   // Filter out current expert from the list
//   const filteredExperts = allExperts.filter(
//     (expert) => expert.name !== currentExpert.name
//   );

//   const handleSelect = () => {
//     if (selectedExpert) {
//       onSelectExpert(selectedExpert);
//       onOpenChange(false);
//       setSelectedExpert(null);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-md w-[90vw] rounded-2xl p-0 overflow-hidden bg-white border-zinc-200">
//         <DialogTitle className="sr-only">Change Expert</DialogTitle>

//         <div className="p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-xl font-bold text-zinc-900">Change Expert</h3>
//           </div>

//           <p className="text-sm text-zinc-500 mb-4">
//             Select an expert to continue your conversation
//           </p>

//           {filteredExperts.length === 0 ? (
//             <div className="text-center py-8 text-zinc-500">
//               <p>No other experts available</p>
//             </div>
//           ) : (
//             <div className="space-y-2 max-h-[50vh] overflow-y-auto">
//               {filteredExperts.map((expert) => (
//                 <button
//                   key={expert.name}
//                   onClick={() => setSelectedExpert(expert)}
//                   className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
//                     selectedExpert?.name === expert.name
//                       ? "bg-indigo-50 border-2 border-indigo-500"
//                       : "hover:bg-zinc-50 border-2 border-transparent"
//                   }`}
//                 >
//                   <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0">
//                     {expert.imageUrl ? (
//                       <Image
//                         src={expert.imageUrl}
//                         alt={expert.name}
//                         width={48}
//                         height={48}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center">
//                         <User className="w-6 h-6 text-white" />
//                       </div>
//                     )}
//                   </div>

//                   <div className="flex-1 text-left">
//                     <h4 className="font-semibold text-zinc-900">{expert.name}</h4>
//                     <p className="text-xs text-zinc-500">{expert.role}</p>
//                   </div>

//                   {selectedExpert?.name === expert.name && (
//                     <Check className="w-5 h-5 text-indigo-600" />
//                   )}
//                 </button>
//               ))}
//             </div>
//           )}

//           <div className="flex gap-3 mt-6">
//             <Button
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               className="flex-1 rounded-xl border-slate-200"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSelect}
//               disabled={!selectedExpert}
//               className="flex-1 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400"
//             >
//               Change Expert
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { User, Check, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface StaffMember {
  id?: string;
  name: string;
  role: string;
  imageUrl: string;
  services?: any[];
  [key: string]: any;
}

interface ChangeExpertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentExpert: StaffMember;
  allExperts: StaffMember[];
  onSelectExpert: (expert: StaffMember) => void;
}

// Stateful avatar component with nice colored initials fallback on loading failures or empty values
function ExpertAvatar({ imageUrl, name }: { imageUrl?: string; name: string }) {
  const [hasError, setHasError] = useState(false);

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  if (!imageUrl || hasError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg select-none">
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={name}
      width={64}
      height={64}
      className="w-full h-full object-cover"
      onError={() => setHasError(true)}
      unoptimized
    />
  );
}

export default function ChangeExpertDialog({
  open,
  onOpenChange,
  currentExpert,
  allExperts,
  onSelectExpert,
}: ChangeExpertDialogProps) {
  const [selectedExpert, setSelectedExpert] = useState<StaffMember | null>(
    null,
  );
  const [currentSlide, setCurrentSlide] = useState(0);

  const filteredExperts = allExperts.filter(
    (expert) => expert.name?.trim().toLowerCase() !== currentExpert.name?.trim().toLowerCase(),
  );

  const itemsPerPage = 2;
  // Calculate how many "steps" we can take
  const maxSlides = Math.max(0, filteredExperts.length - itemsPerPage);

  const nextSlide = () => {
    if (currentSlide < maxSlides) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const handleSelect = () => {
    if (selectedExpert) {
      onSelectExpert(selectedExpert);
      onOpenChange(false);
      setSelectedExpert(null);
      setCurrentSlide(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] rounded-3xl p-0 overflow-hidden bg-white border-zinc-200">
        <DialogTitle className="sr-only">Change Expert</DialogTitle>

        <div className="p-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-zinc-900">
              Change Expert
            </h3>
          </div>

          <p className="text-sm text-zinc-500 mb-6">
            Select an expert to continue
          </p>

          {filteredExperts.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 bg-zinc-50 rounded-2xl">
              <p>No other experts available</p>
            </div>
          ) : (
            <div className="relative">
              {/* Carousel Container */}
              <div className="relative w-full overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${currentSlide * 50}%)`,
                  }}
                >
                  {filteredExperts.map((expert) => (
                    <div key={expert.name} className="min-w-[50%] p-1.5">
                      <button
                        onClick={() => setSelectedExpert(expert)}
                        className={`w-full flex flex-col items-center gap-3 p-4 rounded-2xl transition-all border-2 text-center h-full ${selectedExpert?.name === expert.name
                            ? "bg-indigo-50 border-indigo-500 shadow-md shadow-indigo-100/50"
                            : "bg-white border-zinc-100 hover:border-zinc-300"
                          }`}
                      >
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white shadow-sm flex-shrink-0">
                            <ExpertAvatar imageUrl={expert.imageUrl} name={expert.name} />
                          </div>
                          {selectedExpert?.name === expert.name && (
                            <div className="absolute -right-1 -bottom-1 bg-indigo-600 rounded-full p-1 border-2 border-white z-10">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="w-full">
                          <h4 className="font-bold text-sm text-zinc-900 leading-tight mb-1">
                            {expert.name}
                          </h4>
                          <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-tighter truncate">
                            {expert.role}
                          </p>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Left Navigation Button - centered vertically */}
              {filteredExperts.length > itemsPerPage && currentSlide > 0 && (
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 -translate-x-3 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-lg hover:bg-zinc-50 transition-all z-10"
                >
                  <ChevronLeft className="h-4 w-4 text-zinc-600" />
                </button>
              )}

              {/* Right Navigation Button - centered vertically */}
              {filteredExperts.length > itemsPerPage && currentSlide < maxSlides && (
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 translate-x-3 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-lg hover:bg-zinc-50 transition-all z-10"
                >
                  <ChevronRight className="h-4 w-4 text-zinc-600" />
                </button>
              )}
            </div>
          )}

          {/* Dots Indicator */}
          {filteredExperts.length > itemsPerPage && (
            <div className="flex justify-center gap-1.5 mt-4">
              {Array.from({ length: maxSlides + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all ${currentSlide === idx
                      ? "w-4 bg-indigo-600"
                      : "w-1.5 bg-zinc-300 hover:bg-zinc-400"
                    }`}
                />
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl text-zinc-500 hover:text-zinc-900"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSelect}
              disabled={!selectedExpert}
              className="flex-1 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:shadow-none"
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
