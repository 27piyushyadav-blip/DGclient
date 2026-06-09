// FILE: app/staff/[id]/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
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
  Loader2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getExpertProfileByIdApi } from "@/lib/directoryApi";

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

// Sample Data
const demoStaffData = {
  id: "1",
  name: "Georgina Kate",
  role: "Certified Hairdresser",
  rating: 4.9,
  reviewsCount: 119,
  experience: "10 Years",
  imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800&h=800",
  videoUrl: "https://youtu.be/sRWcJrMTtMI?si=hbh0v0HYOocQsXrE",
  location: "90, Shiv Shakti Rowhouse, Tarsali, Vadodara",
  bio: "Passionate and creative hairstylist with over 10 years of experience in precision cutting, modern styling, and personalized hair transformations. Known for delivering premium salon experiences and trend-driven looks tailored to each client.",
  tags: ["Hair Cut", "Free Styling", "Blow Dry", "Hair Spa", "Coloring", "Keratin"],
  certifications: [
    { id: "1", name: "Certified in Hair Cutting & Styling", issuer: "Advanced Hair Design Diploma" },
    { id: "2", name: "Professional Salon Training Certified", issuer: "International Beauty Academy" }
  ],
  hobbies: [
    { id: "1", name: "Creative Styling" },
    { id: "2", name: "Fashion Photography" },
    { id: "3", name: "Traveling" },
    { id: "4", name: "Hair Trends Research" },
    { id: "5", name: "Creating Hair Tutorials" }
  ],
  reviews: [
    { id: "1", name: "Sarah M.", rating: 5.0, comment: "Amazing experience | She understood exactly what I wanted. Highly recommended.", isVerified: true },
    { id: "2", name: "Emily R.", rating: 4.7, comment: "Very professional and friendly. Loved my haircut!", isVerified: true }
  ]
};

const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };
  
  return (
    <div className="flex items-center gap-1">
      <Star className={`${sizes[size]} fill-yellow-400 text-yellow-400`} />
      <span className={`font-semibold text-zinc-900 dark:text-white ${size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg"}`}>
        {rating}
      </span>
    </div>
  );
};

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Video Modal Component
const VideoModal = ({ isOpen, onClose, videoUrl, title }: { isOpen: boolean; onClose: () => void; videoUrl: string; title: string }) => {
  const isYouTube = videoUrl && (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be"));
  const videoId = isYouTube ? getYouTubeVideoId(videoUrl) : null;
  
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
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
        
        {isYouTube && videoId ? (
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />
          </div>
        ) : videoUrl ? (
          <div className="aspect-video bg-black flex items-center justify-center">
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
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

function StaffDetailContent() {
  const searchParams = useSearchParams();
  const expertId = searchParams.get("id");

  const [expert, setExpert] = useState<any>(null);
  const [loading, setLoading] = useState(!!expertId);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    if (!expertId) return;
    let active = true;
    async function fetchExpert() {
      try {
        setLoading(true);
        const response = await getExpertProfileByIdApi(expertId!);
        if (active && response?.data) {
          setExpert(response.data);
        }
      } catch (err) {
        console.error("Error fetching expert profile:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchExpert();
    return () => {
      active = false;
    };
  }, [expertId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
          <p className="text-zinc-600 dark:text-zinc-400 font-medium text-sm">Loading expert details...</p>
        </div>
      </div>
    );
  }

  const rawPic = expert?.profilePicture;
  const hasValidPic = rawPic && typeof rawPic === 'string' && !rawPic.endsWith('/null') && !rawPic.endsWith('/undefined') && !rawPic.endsWith('/uploads/null');
  const imageUrl = hasValidPic ? rawPic : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800&h=800";

  const rawVideo = expert?.videoUrl;
  const hasValidVideo = rawVideo && typeof rawVideo === 'string' && !rawVideo.endsWith('/null') && !rawVideo.endsWith('/undefined') && !rawVideo.endsWith('/uploads/null');
  const videoUrl = hasValidVideo ? rawVideo : "";

  const staffData = expert ? {
    id: expert._id,
    name: expert.name,
    role: expert.specialization || "Wellness Professional",
    rating: expert.rating || 4.8,
    reviewsCount: expert.reviews?.length || expert.reviewCount || 12,
    experience: expert.experienceYears ? `${expert.experienceYears} Years` : "N/A",
    imageUrl: imageUrl,
    videoUrl: videoUrl,
    location: expert.location || "Online",
    bio: expert.bio || "No bio available.",
    tags: (expert.services || []).map((s: any) => s.name || s),
    certifications: (expert.education || []).map((edu: any, index: number) => ({
      id: edu.id || String(index),
      name: `${edu.degree} in ${edu.fieldOfStudy}`,
      issuer: edu.institution
    })),
    hobbies: (expert.interests || expert.languages || ["English"]).map((item: any, index: number) => ({
      id: String(index),
      name: item
    })),
    reviews: (expert.reviews || []).map((r: any, index: number) => ({
      id: r.id || String(index),
      name: r.reviewerName || "Anonymous",
      rating: r.rating || 5,
      comment: r.comment || "",
      isVerified: true
    }))
  } : demoStaffData;

  const displayedReviews = showAllReviews ? staffData.reviews : staffData.reviews.slice(0, 2);

  const handlePlayVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (staffData.videoUrl) {
      setIsVideoModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto max-w-6xl px-4 py-6">
        
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/organizations" className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </Link>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Staff Details</h1>
        </div>

        {/* 3 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* GRID 1 - Photo with Play Button + Book & Message Buttons */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden sticky top-6">
              
              {/* Image with Play Button Overlay */}
              <div className="relative aspect-square w-full max-h-[20rem] cursor-pointer group overflow-hidden">
                {!imageError && staffData.imageUrl ? (
                  <img
                    src={staffData.imageUrl}
                    alt={staffData.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <User className="w-20 h-20 text-white" />
                  </div>
                )}

                {/* Play Button Overlay (always visible if videoUrl is present, regardless of imageError) */}
                {staffData.videoUrl && (
                  <button
                    onClick={handlePlayVideo}
                    className="absolute inset-0 flex items-center justify-center transition-all duration-300 cursor-pointer"
                  >
                    <div className="bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full p-4 transition-all duration-300 hover:scale-110 opacity-100">
                      <Play className="w-8 h-8 fill-white text-white" />
                    </div>
                  </button>
                )}
              </div>

              {/* Staff Info */}
              <div className="p-5 text-center">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{staffData.name}</h2>
                <p className="text-[var(--primary-color)] dark:text-[var(--primary-color)] mt-1">{staffData.role}</p>
                
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-[var(--primary-color)]" />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{staffData.experience} Experience</span>
                  </div>
                </div>
                
                {/* <div className="flex items-center justify-center gap-2 mt-2">
                  <StarRating rating={staffData.rating} size="md" />
                  <span className="text-sm text-zinc-500">({staffData.reviews} Public Reviews)</span>
                </div> */}

                {/* Book & Message Buttons */}
                <div className="flex gap-3 mt-5">
                  <Link href="/organizations/staff/booking" className="flex-1">
                    <button className="w-full px-4 py-2.5 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] hover:bg-[var(--hover-primary-color)] text-white font-semibold rounded-xl transition-all duration-300 cursor-pointer">
                      Book
                    </button>
                  </Link>
                  <Link href="/organizations/staff/message" className="flex-1">
                    <button className="w-full px-4 py-2.5 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] dark:[var(--primary-color)] text-white dark:text-white font-semibold rounded-xl hover:bg-[var(--hover-primary-color)] transition-all duration-300 cursor-pointer">
                      Message
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* GRID 2 - Description, Tags & Certification */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Description */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">Description</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
                {staffData.bio}
              </p>
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {staffData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Certification */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">Certification</h3>
              <div className="space-y-3">
                {staffData.certifications.map((cert) => (
                  <div key={cert.id} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white text-sm">{cert.name}</p>
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
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">Hobbies</h3>
              <div className="flex flex-wrap gap-2">
                {staffData.hobbies.map((hobby) => (
                  <span
                    key={hobby.id}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-[var(--hover-primary-color)] dark:text-[var(--hover-primary-color)] rounded-full text-sm"
                  >
                    {hobby.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Public Reviews */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Public Reviews</h3>
                <button 
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="text-sm text-[var(--primary-color)] hover:text-[var(--hover-primary-color)] flex items-center gap-1 cursor-pointer"
                >
                  {showAllReviews ? "Show Less" : "View All Reviews"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {displayedReviews.map((review) => (
                  <div key={review.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 dark:text-white text-sm">{review.name}</span>
                        {review.isVerified && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>

              {/* Write Review Button */}
              <button className="w-full mt-4 px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-300 cursor-pointer">
                Write a Review
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={staffData.videoUrl}
        title={`${staffData.name} - Introduction Video`}
      />
    </div>
  );
}

export default function StaffDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
          <p className="text-zinc-600 dark:text-zinc-400 font-medium text-sm">Loading expert details...</p>
        </div>
      </div>
    }>
      <StaffDetailContent />
    </Suspense>
  );
}