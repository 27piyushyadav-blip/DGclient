"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Star,
  User,
  Award,
  Clock,
  Calendar,
  Play,
  Check,
} from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import VideoModal from "@/components/modals/VideoModal";
import ChangeExpertDialog from "./ChangeExpertDialog";
import ProfileModal from "./ProfileModal";
import RealChatPanel from "./RealChatPanel";

// Types
interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

interface StaffMember {
  id?: string;
  name: string;
  role: string;
  image: string;
  imageUrl?: string;
  [key: string]: any;
}

type NormalizedStaffMember = StaffMember & {
  imageUrl: string;
};

type MessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember;
  venueName: string;
  allStaff?: StaffMember[];
  services?: any[];
};

// No hardcoded demo services — only real organization services are shown

const StarRating = ({
  rating,
  reviews,
}: {
  rating: number;
  reviews: number;
}) => (
  <div className="flex items-center gap-1">
    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    <span className="text-sm font-semibold text-zinc-700">{rating}</span>
    <span className="text-xs text-zinc-500">
      ★★★★★({reviews} Public Reviews)
    </span>
  </div>
);

export default function MessageDialog({
  open,
  onOpenChange,
  staff,
  venueName,
  allStaff = [],
  services = [],
}: MessageDialogProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isChangeExpertOpen, setIsChangeExpertOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  // Track which staff member is actively being chatted with (allows switching)
  const [activeStaff, setActiveStaff] = useState<StaffMember>(staff);

  // Sync activeStaff when the staff prop changes (e.g. user opens dialog with a different expert)
  useEffect(() => {
    setActiveStaff(staff);
  }, [staff]);

  console.log("[MessageDialog] activeStaff:", activeStaff);
  console.log("[MessageDialog] activeStaff.id:", activeStaff.id);

  // Convert and map dynamic services to MenuItem format
  const activeMenuItems = useMemo(() => {
    if (services && services.length > 0) {
      return services.map((s: any, index: number) => {
        // Handle both VenueService format (price: "$80") and raw API format (basePrice: 80)
        const rawPrice = s.basePrice ?? s.price ?? 0;
        const parsedPrice = typeof rawPrice === 'string'
          ? parseFloat(rawPrice.replace(/[^0-9.]/g, "")) || 0
          : typeof rawPrice === 'number' ? rawPrice : 0;
        return {
          id: s.id || s._id || s.name || String(index),
          name: s.name,
          price: parsedPrice,
          description: s.description || null,
          imageUrl: s.imageUrl || s.image || "",
        };
      });
    }
    // No services configured yet
    return [];
  }, [services]);

  // Filter services by what the active expert provides
  const filteredMenuItems = useMemo(() => {
    if (activeStaff.services && Array.isArray(activeStaff.services) && activeStaff.services.length > 0) {
      const filtered = activeMenuItems.filter((item: any) => {
        return activeStaff.services.some((s: any) => {
          if (!s) return false;
          // If s is an object (e.g. { id, name })
          if (typeof s === 'object') {
            return s.id === item.id || s._id === item.id || s.name === item.name;
          }
          // If s is a string (could be id or name)
          return s === item.id || s === item.name;
        });
      });
      // Fallback: If filtered is empty, show all activeMenuItems so the menu is never empty
      if (filtered.length > 0) {
        return filtered;
      }
    }
    return activeMenuItems;
  }, [activeMenuItems, activeStaff.services]);

  // Expert data
  const expertData = {
    id: activeStaff.id || activeStaff.name,
    name: activeStaff.name,
    role: activeStaff.role,
    rating: 4.9,
    reviews: 119,
    experience: activeStaff.experienceYears ? `${activeStaff.experienceYears} Years` : "10 Years",
    imageUrl: activeStaff.image || activeStaff.imageUrl || "",
    videoUrl: "https://youtu.be/sRWcJrMTtMI?si=hbh0v0HYOocQsXrE",
    isOnline: true,
    bio: `Professional ${activeStaff.role.toLowerCase()} with ${activeStaff.experienceYears || 10}+ years of experience. Specialized in providing relaxing and rejuvenating treatments.`,
  };

  const normalizedStaff: NormalizedStaffMember = {
    ...activeStaff,
    imageUrl: activeStaff.imageUrl || activeStaff.image || "",
  };

  const normalizedAllStaff: NormalizedStaffMember[] = allStaff.map(
    (expert) => ({
      ...expert,
      imageUrl: expert.imageUrl || expert.image || "",
    })
  );

  const selectedServicesList = filteredMenuItems.filter((s) =>
    selectedServices.includes(s.id)
  );
  const totalAmount = selectedServicesList.reduce(
    (sum, service) => sum + service.price,
    0
  );
  const gst = Math.round(totalAmount * 0.05);
  const totalWithGst = totalAmount + gst;

  const handlePlayVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (expertData.videoUrl) {
      onOpenChange(false);
      window.setTimeout(() => {
        setIsVideoModalOpen(true);
      }, 0);
    }
  };

  const handleBookNow = () => {
    if (selectedServicesList.length === 0) {
      alert("Please select at least one service");
      return;
    }
    alert(`Booking confirmed at ${venueName}! Total: $${totalWithGst} USD`);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 overflow-hidden rounded-2xl bg-zinc-50 border-zinc-200">
          <DialogTitle className="sr-only">
            Chat with {activeStaff.name}
          </DialogTitle>

          <div className="bg-zinc-50 h-full overflow-hidden flex flex-col">
            <div className="container mx-auto max-w-7xl px-4 py-6 h-full flex flex-col flex-1 min-h-0">
              {/* Header */}
              <div className="flex items-center gap-4 mb-4 flex-shrink-0">
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5 text-zinc-600" />
                </button>
                <h1 className="text-2xl font-bold text-zinc-900">Messages</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
                {/* LEFT COLUMN - Expert Profile */}
                <div className="lg:col-span-4 h-full overflow-y-auto pr-1">
                  <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden sticky top-6">
                    {/* Profile Image with Play Button */}
                    <div className="relative aspect-square w-full cursor-pointer group overflow-hidden h-[12rem]">
                      {!imageError && expertData.imageUrl ? (
                        <>
                          <Image
                            src={expertData.imageUrl}
                            alt={expertData.name}
                            fill
                            className="object-cover transition-transform duration-500"
                            onError={() => setImageError(true)}
                            unoptimized
                          />
                          <button
                            onClick={handlePlayVideo}
                            className="absolute inset-0 flex items-center justify-center transition-all duration-300 cursor-pointer"
                          >
                            <div className="bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full p-4 transition-all duration-300 hover:scale-110 opacity-100 cursor-pointer">
                              <Play className="w-8 h-8 fill-white text-white" />
                            </div>
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <User className="w-20 h-20 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Staff Info */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold text-zinc-900">
                          {expertData.name}
                        </h3>
                        {expertData.isOnline && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-green-600">
                              Online
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-md text-indigo-600 mb-3">
                        {expertData.role}
                      </p>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm text-zinc-700">
                            {expertData.experience} Experience
                          </span>
                        </div>
                      </div>

                      <StarRating
                        rating={expertData.rating}
                        reviews={expertData.reviews}
                      />

                      <p className="text-sm text-zinc-600 mt-4 pt-4 border-t border-zinc-200">
                        {expertData.bio}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-4 pt-4 border-t border-zinc-200">
                        <Button
                          variant="outline"
                          className="flex-1 rounded-xl border-slate-200 text-blue-600 bg-white text-black hover:bg-white hover:text-black"
                          onClick={() => setIsProfileModalOpen(true)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MIDDLE COLUMN - Real Chat */}
                <div className="lg:col-span-5 flex flex-col h-full min-h-0">
                  <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col flex-1 h-full min-h-0">
                    {/* Chat Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-white flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
                            {expertData.imageUrl && !imageError ? (
                              <Image
                                src={expertData.imageUrl}
                                alt={expertData.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                          {expertData.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-zinc-900 text-sm">
                            Chat with {expertData.name}
                          </h3>
                          <p className="text-xs text-green-600">
                            {activeStaff.id
                              ? "Live · Usually responds in minutes"
                              : "Demo mode"}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="rounded-xl border-slate-200 text-blue-600 bg-white text-black hover:bg-white hover:text-black text-sm"
                        onClick={() => setIsChangeExpertOpen(true)}
                      >
                        Change Expert
                      </Button>
                    </div>

                    {/* Real Chat Panel */}
                    <div className="flex-1 overflow-hidden min-h-0">
                      {activeStaff.id ? (
                        <RealChatPanel
                          key={activeStaff.id}
                          expertId={activeStaff.id}
                          expertName={expertData.name}
                          expertAvatar={expertData.imageUrl}
                          messagesHeightClass="flex-1"
                        />
                      ) : (
                        /* Fallback when no expert ID (static/demo data) */
                        <div className="flex flex-col items-center justify-center h-full py-8 text-zinc-400 px-4 text-center">
                          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
                            <User className="w-7 h-7 text-indigo-400" />
                          </div>
                          <p className="text-sm font-medium text-zinc-600">
                            Chat unavailable
                          </p>
                          <p className="text-xs text-zinc-400 mt-1">
                            This expert is from demo data. Browse real
                            organizations to start a live chat.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN - Menu & Total */}
                <div className="lg:col-span-3 flex flex-col h-full min-h-0 space-y-4 overflow-hidden">
                  {/* Menu Section */}
                  <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="p-5 border-b border-zinc-200 flex-shrink-0">
                      <h3 className="text-xl font-bold text-zinc-900">
                        Services Menu
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1">
                        Select services you want to book
                      </p>
                    </div>

                    <div className="divide-y divide-zinc-200 overflow-y-auto flex-1 min-h-0 scrollbar-thin">
                      {filteredMenuItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-10 px-4 text-center">
                          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
                            <svg className="w-7 h-7 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-zinc-600">No services listed</p>
                          <p className="text-xs text-zinc-400 mt-1">This organization hasn't added any services yet.</p>
                        </div>
                      ) : (
                        filteredMenuItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              if (selectedServices.includes(item.id)) {
                                setSelectedServices(
                                  selectedServices.filter((id) => id !== item.id)
                                );
                              } else {
                                setSelectedServices([
                                  ...selectedServices,
                                  item.id,
                                ]);
                              }
                            }}
                            className={`p-4 cursor-pointer transition-all duration-200 hover:bg-zinc-50 ${
                              selectedServices.includes(item.id)
                                ? "bg-indigo-50"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex-shrink-0">
                                {item.imageUrl ? (
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg
                                      className="w-6 h-6 text-indigo-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-zinc-900 text-sm truncate">
                                  {item.name}
                                </h4>
                                {item.description && (
                                  <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                                    {item.description}
                                  </p>
                                )}
                              </div>

                              <div className="text-right flex-shrink-0">
                                <p className="text-base font-bold text-indigo-600">
                                  {item.price > 0 ? `$${item.price}` : "Free"}
                                </p>
                                {selectedServices.includes(item.id) && (
                                  <Check className="w-4 h-4 text-indigo-600 mt-1 ml-auto" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Total Section */}
                  {selectedServices.length > 0 && (
                    <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm flex-shrink-0">
                      <h3 className="text-xl font-bold text-zinc-900 mb-4">
                        Order Summary
                      </h3>

                      <div className="max-h-[7rem] overflow-y-auto scrollbar-thin">
                        <div className="space-y-2 mb-4">
                          {selectedServicesList.map((service) => (
                            <div
                              key={service.id}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="text-zinc-700">
                                {service.name}
                              </span>
                              <span className="font-semibold text-indigo-600">
                                ${service.price}
                              </span>
                            </div>
                          ))}
                        </div>

                        {selectedServicesList.length > 0 && (
                          <>
                            <div className="flex justify-between items-center text-sm pt-2 border-t border-zinc-200">
                              <span className="text-zinc-600">Subtotal</span>
                              <span className="text-zinc-900">
                                ${totalAmount}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-sm mt-2">
                              <span className="text-zinc-600">GST (5%)</span>
                              <span className="text-zinc-900">${gst}</span>
                            </div>

                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-200">
                              <span className="text-lg font-bold text-zinc-900">
                                Total
                              </span>
                              <span className="text-2xl font-bold text-indigo-600">
                                ${totalWithGst}
                              </span>
                            </div>

                            <div className="mt-3 pt-3 border-t border-zinc-200">
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-zinc-400" />
                                  <span className="text-zinc-600">
                                    12 April
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-zinc-400" />
                                  <span className="text-zinc-600">
                                    3:00 PM – 7:00 PM
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <button
                        onClick={handleBookNow}
                        className="w-full mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg cursor-pointer text-sm"
                      >
                        Book &amp; Pay{" "}
                        {totalWithGst > 0 && `$${totalWithGst} USD`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isVideoModalOpen && expertData.videoUrl ? (
        <VideoModal
          videoUrl={expertData.videoUrl}
          onClose={() => setIsVideoModalOpen(false)}
        />
      ) : null}

      {/* Change Expert Dialog */}
      <ChangeExpertDialog
        open={isChangeExpertOpen}
        onOpenChange={setIsChangeExpertOpen}
        currentExpert={{ ...expertData, imageUrl: expertData.imageUrl }}
        allExperts={normalizedAllStaff}
        onSelectExpert={(newExpert) => {
          // Switch to new expert and re-initialize chat
          setActiveStaff({
            id: newExpert.id,
            name: newExpert.name,
            role: newExpert.role,
            image: newExpert.imageUrl || newExpert.image || "",
            services: newExpert.services || [],
          });
          setIsChangeExpertOpen(false);
        }}
      />

      <ProfileModal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        staff={normalizedStaff}
        venueName={venueName}
      />
    </>
  );
}
