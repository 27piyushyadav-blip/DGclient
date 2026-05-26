/*
 * File: src/components/OrganizationCard.tsx
 * SR-DEV: Preview card for the Organization listing page.
 * Features: Displays organization video thumbnail, name, location, and action buttons.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play, Users, ChevronRight, Building2, MapPin } from "lucide-react";
import StaffCarousel, {
  StaffCarouselExample1,
} from "../components/organization/StaffCarousel";
import OrganizationSidebarModal from "../components/organization/OrganizationSidebarModal";

interface StaffMember {
  id?: string;
  name?: string;
  role?: string;
  avatar?: string;
  [key: string]: any;
}

interface Organization {
  _id?: string;
  slug: string;
  name: string;
  logoUrl?: string;
  location?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  hours?: string;
  established?: string;
  category?: string;
  staff?: StaffMember[];
  [key: string]: any;
}

interface OrganizationCardProps {
  organization: Organization;
}

// Sample Test Data 1: Dental Clinic Staff
export const sampleStaffData1 = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    role: "Senior Dentist",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400",
    specialty: "Cosmetic Dentistry",
    experience: "12 years",
    rating: 4.9,
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 123-4567",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    role: "Orthodontist",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400",
    specialty: "Braces & Invisalign",
    experience: "8 years",
    rating: 4.8,
    email: "michael.chen@example.com",
    phone: "+1 (555) 234-5678",
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    role: "Pediatric Dentist",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400&h=400",
    specialty: "Children's Dentistry",
    experience: "6 years",
    rating: 4.9,
    email: "emily.rodriguez@example.com",
    phone: "+1 (555) 345-6789",
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    role: "Oral Surgeon",
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=400",
    specialty: "Surgical Dentistry",
    experience: "15 years",
    rating: 5.0,
    email: "james.wilson@example.com",
    phone: "+1 (555) 456-7890",
  },
  {
    id: 5,
    name: "Dr. Lisa Park",
    role: "Periodontist",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400&h=400",
    specialty: "Gum Disease Treatment",
    experience: "10 years",
    rating: 4.7,
    email: "lisa.park@example.com",
    phone: "+1 (555) 567-8901",
  },
];

export default function OrganizationCard({
  organization,
}: OrganizationCardProps) {
  const router = useRouter();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Determine video URL (from organization or fallback)
  const videoUrl = "https://youtu.be/sRWcJrMTtMI?si=hbh0v0HYOocQsXrE";

  // Extract video ID for YouTube thumbnails
  const getYouTubeThumbnail = (url: string): string | null => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeThumbnail(videoUrl);

  // Use different thumbnail URLs as fallbacks
  const getThumbnailUrl = (): string[] => {
    if (videoId) {
      return [
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      ];
    }
    return [organization.logoUrl || "/placeholder-org.jpg"];
  };

  const thumbnailOptions = getThumbnailUrl();
  const [currentThumbnailIndex, setCurrentThumbnailIndex] = useState(0);
  const currentThumbnail = thumbnailOptions[currentThumbnailIndex];

  const handleImageError = () => {
    if (currentThumbnailIndex < thumbnailOptions.length - 1) {
      setCurrentThumbnailIndex(currentThumbnailIndex + 1);
    } else {
      setImageError(true);
    }
  };

  const handleStaffClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsStaffModalOpen(true);
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSidebarOpen(true);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVideoOpen(true);
  };

  return (
    <>
      <Link href={`/organizations/${organization._id}`} className="block h-full">
        <div className="group flex flex-col justify-between h-full p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          {/* --- Header: Logo & Identity --- */}
          <div className="flex items-start gap-4 mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                organization.logo ||
                organization.logoUrl ||
                "https://placehold.co/48x48/e2e8f0/475569?text=Org"
              }
              alt={`${organization.name} Logo`}
              className="w-12 h-12 rounded-lg shrink-0 border border-zinc-100 dark:border-zinc-700 shadow-inner object-cover bg-zinc-100 dark:bg-zinc-800"
              width={48}
              height={48}
            />

            <div className="flex-1 min-w-0">
              <button
                onClick={handleTitleClick}
                className="w-full text-left cursor-pointer"
              >
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white truncate group-hover:text-primary transition-colors">
                  {organization.name}
                </h3>
              </button>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 uppercase tracking-wider">
                Partner Program
              </p>
            </div>
          </div>

          {/* Video Thumbnail Section with Play Button Overlay */}
          <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-4 rounded-xl">
            {!imageError ? (
              <Image
                src={currentThumbnail}
                alt={`${organization.name} video thumbnail`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 rounded-xl">
                <Building2 className="w-16 h-16 text-indigo-400 dark:text-indigo-600" />
              </div>
            )}

            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors rounded-xl" />

            <button
              type="button"
              onClick={handleVideoClick}
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              aria-label={`Play ${organization.name} video`}
            >
              <div className="bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full p-4 transition-all hover:scale-110">
                <Play className="w-6 h-6 fill-white text-white" />
              </div>
            </button>
          </div>

          {/* Location */}
          {organization?.location && (
            <div className="flex items-center gap-2 text-lg mb-4">
              <MapPin
                size={18}
                className="shrink-0 text-zinc-500 dark:text-zinc-400"
              />
              <p className="text-zinc-600 dark:text-zinc-400 line-clamp-1 m-0 text-md font-bold">
                {organization.location}
              </p>
            </div>
          )}

          {/* Stats Row - Buttons Section */}
          <div className="p-5 pt-3">
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <div className="bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] p-[2px] rounded max-w-[8rem]">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/organizations/booking`); }}
                  className="group inline-flex items-center justify-center gap-1 text-sm font-medium text-white dark:text-white px-2 rounded transition-all duration-300 hover:shadow-md hover:scale-105 hover:cursor-pointer"
                >
                  Book
                </button>
              </div>

              <div className="bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] p-0.5 rounded max-w-[10rem]">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/organizations/staff/message`); }}
                  className="group inline-flex items-center justify-center gap-1 text-sm font-medium text-white dark:text-white px-2 rounded transition-all duration-300 hover:shadow-md hover:scale-105 hover:cursor-pointer"
                >
                  Message
                </button>
              </div>

              <div className="bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] p-0.5 rounded max-w-[10rem]">
                <button
                  type="button"
                  onClick={handleStaffClick}
                  className="group inline-flex items-center justify-center gap-1 text-sm font-medium text-white dark:text-white px-2 rounded transition-all duration-300 hover:shadow-md hover:scale-105 hover:cursor-pointer"
                >
                  Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Video Modal */}
      {isVideoOpen && videoId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-10 text-white/80 hover:text-white bg-black/50 rounded-full p-2 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`${organization.name} video`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      {isStaffModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsStaffModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-2 border-b border-zinc-200 dark:border-zinc-800">
              <div>{/* Header content can be added here if needed */}</div>

              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body - Staff Grid */}
            <div className="p-3 max-h-[70vh]">
              {/* <StaffCarouselExample1 /> */}
              <StaffCarousel
                staff={sampleStaffData1}
                organizationSlug="smile-dental-clinic"
                autoPlay={true}
                autoPlayInterval={4000}
              />
            </div>
          </div>
        </div>
      )}

      {/* Organization Sidebar Modal */}
      <OrganizationSidebarModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        organization={organization}
      />
    </>
  );
}