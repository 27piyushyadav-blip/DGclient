// FILE: ProfileModal.tsx
"use client";

import {
  Star,
  ArrowLeft,
  Heart,
  Share2,
  Flag,
  Phone,
  Video,
  MessageCircle,
  Calendar,
  Clock,
  Award,
  Check,
  User,
  MapPin,
  Scissors,
  Camera,
  Plane,
  BookOpen,
  Youtube,
  ChevronRight,
  Play,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

// Types
interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  isVerified?: boolean;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
}

interface Hobby {
  id: string;
  name: string;
  icon?: React.ReactNode;
}

interface StaffMember {
  name: string;
  role: string;
  imageUrl: string;
  [key: string]: any;
}

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember;
  venueName?: string;
}

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Video Modal Component
const VideoModal = ({
  isOpen,
  onClose,
  videoUrl,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}) => {
  const videoId = getYouTubeVideoId(videoUrl);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white/80 hover:text-white bg-black/50 rounded-full p-2 transition-colors hover:bg-black/70 cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {videoId ? (
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />
          </div>
        ) : (
          <div className="aspect-video flex items-center justify-center bg-zinc-900">
            <p className="text-white">Video not available</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StarRating = ({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-1">
      <Star className={`${sizes[size]} fill-yellow-400 text-yellow-400`} />
      <span className={`font-semibold text-zinc-900 ${size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg"}`}>
        {rating}
      </span>
    </div>
  );
};

export default function ProfileModal({
  open,
  onOpenChange,
  staff,
  venueName = "",
}: ProfileModalProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Build staff detail data from the passed staff prop
  const staffData = {
    id: staff.name,
    name: staff.name,
    role: staff.role,
    rating: 4.9,
    reviews: 119,
    experience: "10 Years",
    imageUrl: staff.imageUrl,
    videoUrl: "https://youtu.be/sRWcJrMTtMI?si=hbh0v0HYOocQsXrE",
    location: "90, Shiv Shakti Rowhouse, Tarsali, Vadodara",
    bio: `Professional ${staff.role.toLowerCase()} with 10+ years of experience. Specialized in providing relaxing and rejuvenating treatments. Passionate and creative professional known for delivering premium experiences and personalized service.`,
    tags: [
      "Hair Cut",
      "Free Styling",
      "Blow Dry",
      "Hair Spa",
      "Coloring",
      "Keratin",
    ],
    certifications: [
      {
        id: "1",
        name: "Certified in Hair Cutting & Styling",
        issuer: "Advanced Hair Design Diploma",
      },
      {
        id: "2",
        name: "Professional Salon Training Certified",
        issuer: "International Beauty Academy",
      },
    ],
    hobbies: [
      { id: "1", name: "Creative Styling" },
      { id: "2", name: "Fashion Photography" },
      { id: "3", name: "Traveling" },
      { id: "4", name: "Hair Trends Research" },
      { id: "5", name: "Creating Hair Tutorials" },
    ],
    reviewsList: [
      {
        id: "1",
        name: "Sarah M.",
        rating: 5.0,
        comment:
          "Amazing experience | She understood exactly what I wanted. Highly recommended.",
        isVerified: true,
      },
      {
        id: "2",
        name: "Emily R.",
        rating: 4.7,
        comment: "Very professional and friendly. Loved my haircut!",
        isVerified: true,
      },
    ],
  };

  const displayedReviews = showAllReviews
    ? staffData.reviewsList
    : staffData.reviewsList.slice(0, 2);

  const handlePlayVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (staffData.videoUrl) {
      setIsVideoModalOpen(true);
    }
  };

  const handleBookClick = () => {
    onOpenChange(false);
    // Optionally trigger booking flow
  };

  const handleMessageClick = () => {
    onOpenChange(false);
    // Optionally trigger message flow
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-0 overflow-hidden rounded-2xl bg-zinc-50 border-zinc-200">
          <DialogTitle className="sr-only">Staff Profile - {staff.name}</DialogTitle>

          <div className="overflow-y-scroll scrollbar-thin max-h-[90vh] p-2">
            <div className="container mx-auto max-w-6xl px-4 py-6">
              {/* Header with Back Button */}
              <div className="flex items-center gap-4 mb-6 sticky top-0 bg-zinc-50 py-2 z-10">
                <button onClick={() => onOpenChange(false)} className="p-2 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer">
                  <ArrowLeft className="w-5 h-5 text-zinc-600" />
                </button>
                <h1 className="text-xl font-semibold text-zinc-900">Staff Details</h1>
              </div>

              {/* 3 Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* GRID 1 - Photo with Play Button + Book & Message Buttons */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden sticky top-24">

                    {/* Image with Play Button Overlay */}
                    <div className="relative aspect-square w-full max-h-[20rem] cursor-pointer group overflow-hidden">
                      {!imageError && staffData.imageUrl ? (
                        <>
                          <Image
                            src={staffData.imageUrl}
                            alt={staffData.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={() => setImageError(true)}
                          />
                          {/* Play Button Overlay */}
                          <button
                            onClick={handlePlayVideo}
                            className="absolute inset-0 flex items-center justify-center transition-all duration-300 cursor-pointer"
                          >
                            <div className="bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full p-4 transition-all duration-300 hover:scale-110 opacity-100">
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
                    <div className="p-5 text-center">
                      <h2 className="text-2xl font-bold text-zinc-900">{staffData.name}</h2>
                      <p className="text-indigo-600 mt-1">{staffData.role}</p>

                      <div className="flex items-center justify-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm text-zinc-600">{staffData.experience} Experience</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2 mt-2">
                        <StarRating rating={staffData.rating} size="md" />
                        <span className="text-sm text-zinc-500">
                          ({staffData.reviews} Public Reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GRID 2 - Description, Tags & Certification */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Description */}
                  <div className="bg-white rounded-2xl border border-zinc-200 p-5">
                    <h3 className="text-lg font-bold text-zinc-900 mb-3">Description</h3>
                    <p className="text-zinc-600 leading-relaxed text-sm">
                      {staffData.bio}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="bg-white rounded-2xl border border-zinc-200 p-5">
                    <h3 className="text-lg font-bold text-zinc-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {staffData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certification */}
                  <div className="bg-white rounded-2xl border border-zinc-200 p-5">
                    <h3 className="text-lg font-bold text-zinc-900 mb-3">Certification</h3>
                    <div className="space-y-3">
                      {staffData.certifications.map((cert) => (
                        <div key={cert.id} className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900 text-sm">{cert.name}</p>
                            <p className="text-xs text-zinc-500">- {cert.issuer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* GRID 3 - Hobbies & Public Reviews */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Hobbies */}
                  <div className="bg-white rounded-2xl border border-zinc-200 p-5">
                    <h3 className="text-lg font-bold text-zinc-900 mb-3">Hobbies</h3>
                    <div className="flex flex-wrap gap-2">
                      {staffData.hobbies.map((hobby) => (
                        <span
                          key={hobby.id}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm"
                        >
                          {hobby.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Public Reviews */}
                  <div className="bg-white rounded-2xl border border-zinc-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-zinc-900">Public Reviews</h3>
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                      >
                        {showAllReviews ? "Show Less" : "View All Reviews"}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {displayedReviews.map((review) => (
                        <div key={review.id} className="border-b border-zinc-100 last:border-0 pb-4 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-zinc-900 text-sm">{review.name}</span>
                              {review.isVerified && (
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                                  Verified
                                </span>
                              )}
                            </div>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          <p className="text-zinc-600 text-sm">{review.comment}</p>
                        </div>
                      ))}
                    </div>

                    {/* Write Review Button */}
                    <button className="w-full mt-4 px-4 py-2 border border-zinc-200 rounded-lg text-zinc-700 text-sm hover:bg-zinc-50 transition-all duration-300 cursor-pointer">
                      Write a Review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={staffData.videoUrl}
        title={`${staffData.name} - Introduction Video`}
      />
    </>
  );
}
