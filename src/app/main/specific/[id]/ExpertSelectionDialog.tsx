"use client";

import { useState } from "react";
import { User, Star, Award, Clock } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface StaffMember {
  id?: string;
  name: string;
  role: string;
  image: string;
  imageUrl?: string;
  experienceYears?: number;
  [key: string]: any;
}

type ExpertSelectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allStaff: StaffMember[];
  venueName: string;
  onSelectExpert: (expert: StaffMember) => void;
};

export default function ExpertSelectionDialog({
  open,
  onOpenChange,
  allStaff,
  venueName,
  onSelectExpert,
}: ExpertSelectionDialogProps) {
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  const normalizedStaff = allStaff.map((expert) => ({
    ...expert,
    imageUrl: expert.imageUrl || expert.image || "",
  }));

  const handleSelectExpert = (expert: StaffMember) => {
    onSelectExpert(expert);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[92vw] min-h-[55vh] max-h-[85vh] p-0 overflow-hidden rounded-3xl bg-zinc-50 border-zinc-200 flex flex-col">
        <DialogTitle className="sr-only">Select Expert</DialogTitle>

        {/* Content Container */}
        <div className="p-8 overflow-y-auto flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6 flex-shrink-0">
            <button
              onClick={() => onOpenChange(false)}
              className="p-2.5 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 leading-tight">Select an Expert</h1>
              <p className="text-sm text-zinc-500 mt-1">{venueName}</p>
            </div>
          </div>

          {/* Expert List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {normalizedStaff.map((expert) => (
              <div
                key={expert.id || expert.name}
                onClick={() => handleSelectExpert(expert)}
                className="bg-white rounded-2xl border border-zinc-150 shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-zinc-300 transition-all duration-200"
              >
                <div className="flex items-start gap-6 p-6">
                  {/* Expert Image (Enlarged and styled) */}
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 shadow-sm">
                    {!imageError[expert.id || expert.name] && expert.imageUrl ? (
                      <Image
                        src={expert.imageUrl}
                        alt={expert.name}
                        fill
                        className="object-cover"
                        onError={() => setImageError(prev => ({ ...prev, [expert.id || expert.name]: true }))}
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Expert Info */}
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="text-lg font-bold text-zinc-900 truncate mb-1">
                      {expert.name}
                    </h3>
                    <p className="text-sm font-semibold text-indigo-600 mb-3 truncate">
                      {expert.role}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-yellow-700">4.9</span>
                      </div>
                      <div className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg">
                        <Award className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-semibold text-indigo-700">
                          {expert.experienceYears ? `${expert.experienceYears} Years Experience` : "Experienced"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Message Button */}
                  <Button
                    variant="outline"
                    className="rounded-xl border-slate-200 px-4 py-2 text-sm text-zinc-700 bg-zinc-50 hover:bg-indigo-50 hover:text-indigo-600 flex-shrink-0 font-semibold shadow-sm transition-all"
                  >
                    Message
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {normalizedStaff.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-indigo-400" />
              </div>
              <p className="text-base font-semibold text-zinc-700">
                No experts available
              </p>
              <p className="text-sm text-zinc-400 mt-1">
                This organization doesn't have any experts yet.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
