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
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0 overflow-hidden rounded-2xl bg-zinc-50 border-zinc-200">
        <DialogTitle className="sr-only">Select Expert</DialogTitle>

        <div className="min-h-full bg-zinc-50 h-full overflow-auto">
          <div className="container mx-auto max-w-4xl px-4 py-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">Select an Expert</h1>
                <p className="text-sm text-zinc-600 mt-1">{venueName}</p>
              </div>
            </div>

            {/* Expert List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1">
              {normalizedStaff.map((expert) => (
                <div
                  key={expert.id || expert.name}
                  onClick={() => handleSelectExpert(expert)}
                  className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-zinc-300 transition-all duration-200"
                >
                  <div className="flex items-start gap-4 p-4">
                    {/* Expert Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0">
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
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-zinc-900 truncate">
                        {expert.name}
                      </h3>
                      <p className="text-sm text-indigo-600 mb-2">
                        {expert.role}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-zinc-600">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>4.9</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-indigo-600" />
                          <span>10+ Years</span>
                        </div>
                      </div>
                    </div>

                    {/* Message Button */}
                    <Button
                      variant="outline"
                      className="rounded-xl border-slate-200 text-blue-600 bg-white text-black hover:bg-white hover:text-black flex-shrink-0"
                    >
                      Message
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {normalizedStaff.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-8 text-zinc-400 px-4 text-center">
                <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
                  <User className="w-7 h-7 text-indigo-400" />
                </div>
                <p className="text-sm font-medium text-zinc-600">
                  No experts available
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  This organization doesn't have any experts yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
