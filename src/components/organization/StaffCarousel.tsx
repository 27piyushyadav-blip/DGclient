import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Users,
  Tag,
  ChevronRight,
  Building2,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectCoverflow,
} from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

// Define the Staff Member interface
interface StaffMember {
  id?: string | number;
  name: string;
  role?: string;
  image?: string;
  [key: string]: any;
}

// Define the component props interface
interface StaffCarouselProps {
  staff: StaffMember[];
  organizationSlug: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  slidesPerView?: number;
  effect?: "slide" | "fade" | "coverflow" | "cube" | "flip";
}

const StaffCarousel: React.FC<StaffCarouselProps> = ({
  staff,
  organizationSlug,
  autoPlay = true,
  autoPlayInterval = 5000,
  slidesPerView = 3,
  effect = "slide",
}) => {
  const [isVideoOpen, setIsVideoOpen] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const swiperRef = useRef<any>(null);

  const handleVideoOpen = (
    e: React.MouseEvent,
    staffMember: StaffMember,
  ): void => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedStaff(staffMember);
    setIsVideoOpen(true);
  };

  // Responsive breakpoints for different screen sizes
  const breakpoints = {
    320: {
      slidesPerView: 1,
      spaceBetween: 16,
    },
    640: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    1024: {
      slidesPerView: slidesPerView,
      spaceBetween: 24,
    },
  };

  return (
    <div className="relative px-8 py-4">
      {/* Swiper Container */}
      <Swiper
        ref={swiperRef}
        modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
        spaceBetween={24}
        slidesPerView={slidesPerView}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
          disabledClass: "opacity-50 cursor-not-allowed",
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          el: ".swiper-pagination-custom",
        }}
        autoplay={
          autoPlay
            ? {
              delay: autoPlayInterval,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }
            : false
        }
        effect={effect}
        breakpoints={breakpoints}
        loop={staff.length > slidesPerView}
        speed={800}
        grabCursor={true}
        className="staff-swiper"
      >
        {staff.map((staffMember, index) => (
          <SwiperSlide key={staffMember.id || index}>
            <div className="group">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-2 border border-zinc-200 dark:border-zinc-700 transform transition-all duration-500">

                {/* Staff Photo/Image with Video Play Button */}
                <div className="relative aspect-square bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center cursor-pointer group/staff h-[12rem] w-full overflow-hidden scrollbar-hide">
                  {staffMember.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={staffMember.image}
                      alt={staffMember.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/staff:scale-110"
                    />
                  ) : (
                    <div className="text-center transition-transform duration-700 group-hover/staff:scale-110">
                      <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3">
                        <span className="text-3xl font-bold text-white">
                          {staffMember.name?.charAt(0) || "S"}
                        </span>
                      </div>
                      <p className="text-white text-sm font-medium">No Photo</p>
                    </div>
                  )}

                  {/* Video Play Button Overlay */}
                  <button
                    onClick={(e) => handleVideoOpen(e, staffMember)}
                    className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all duration-500 group/video"
                    aria-label={`Watch ${staffMember.name}'s video`}
                  >
                    <div className="bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full p-3 transition-all duration-500 hover:scale-110 group-hover/video:scale-110 transform scale-90 group-hover/video:scale-100">
                      <Play className="w-5 h-5 fill-white text-white transition-transform duration-300 group-hover/video:rotate-12" />
                    </div>
                  </button>
                </div>

                {/* Staff Info */}
                <div className="p-4 text-center transition-all duration-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20">
                  <h4 className="font-bold text-lg text-zinc-900 dark:text-white mb-1 transition-all duration-300 group-hover:text-[var(--primary-color)]">
                    <Link
                      href={`/organizations/${organizationSlug}/staff/${staffMember.id}`}
                    >
                      {staffMember.name}
                    </Link>
                  </h4>
                  {staffMember.role && (
                    <p className="text-sm text-[var(--primary-color)] dark:text-[var(--primary-color)] font-medium mb-3 transition-all duration-300 cursor-pointer">
                      <Link
                        href={`/organizations/${organizationSlug}/staff/${staffMember.id}`}
                      >
                        {staffMember.role}
                      </Link>
                    </p>
                  )}

                  {/* Book Button with smooth animation */}
                  <Link
                    href={`/organizations/staff/booking`}
                    className="inline-flex items-center justify-center w-full px-4 py-2 mt-2 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white font-medium rounded-full transition-all duration-300 hover:scale-105 group/btn relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      Book
                      <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)] to-[var(--hover-primary-color)] transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </Link>

                  {/* Message Button with smooth animation */}
                  <Link
                    href={`/organizations/staff/message`}
                    className="inline-flex items-center justify-center w-full px-4 py-2 mt-2 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white font-medium rounded-full transition-all duration-300 hover:scale-105 group/btn relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      Message
                      <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)] to-[var(--hover-primary-color)] transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      {staff.length > slidesPerView && (
        <>
          <button
            className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Previous staff"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>

          <button
            className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Next staff"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Custom Pagination */}
      <div className="swiper-pagination-custom flex justify-center gap-2 mt-6"></div>

      {/* Video Modal */}
      {isVideoOpen && selectedStaff && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-10 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all duration-300 hover:scale-110 hover:rotate-90"
              aria-label="Close video"
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
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">
                <div className="text-center">
                  <Play className="w-16 h-16 text-white/60 mx-auto mb-4" />
                  <p className="text-white text-lg font-medium">
                    {selectedStaff.name}'s Introduction Video
                  </p>
                  <p className="text-white/60 text-sm mt-2">
                    Video player would be integrated here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add custom styles for Swiper */}
      <style jsx global>{`
        .staff-swiper {
          padding: 0 20px 20px 20px;
          overflow: visible !important;
        }

        .staff-swiper .swiper-slide {
          transition: transform 0.3s ease;
        }

        .staff-swiper .swiper-slide:hover {
          transform: translateY(-4px);
        }

        .swiper-pagination-custom .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #cbd5e1;
          opacity: 0.5;
          transition: all 0.3s ease;
        }

        .swiper-pagination-custom .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 4px;
          background: #4f46e5;
          opacity: 1;
        }

        .swiper-pagination-custom .swiper-pagination-bullet:hover {
          opacity: 0.8;
          transform: scale(1.2);
        }

        /* Coverflow effect styles */
        .staff-swiper.swiper-coverflow {
          padding: 40px 0;
        }

        /* Custom navigation button styles */
        .swiper-button-prev-custom,
        .swiper-button-next-custom {
          width: 40px;
          height: 40px;
        }

        .swiper-button-prev-custom:disabled,
        .swiper-button-next-custom:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .staff-swiper {
            padding: 0 10px 20px 10px;
          }

          .swiper-button-prev-custom,
          .swiper-button-next-custom {
            width: 32px;
            height: 32px;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes zoomIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .zoom-in-95 {
          animation: zoomIn 0.3s ease-out;
        }

        .slide-in-from-bottom-10 {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

// Sample Data 1: Dental Clinic Staff
const sampleStaffData1: StaffMember[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    role: "Senior Dentist",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400",
    specialty: "Cosmetic Dentistry",
    experience: "12 years",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    role: "Orthodontist",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400",
    specialty: "Braces & Invisalign",
    experience: "8 years",
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    role: "Pediatric Dentist",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400&h=400",
    specialty: "Children's Dentistry",
    experience: "6 years",
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    role: "Oral Surgeon",
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=400",
    specialty: "Surgical Dentistry",
    experience: "15 years",
  },
];

// Example usage
export const StaffCarouselExample1 = () => {
  return (
    <div className="container mx-auto px-4 py-4">
      <StaffCarousel
        staff={sampleStaffData1}
        organizationSlug="smile-dental-clinic"
        autoPlay={true}
        autoPlayInterval={4000}
        slidesPerView={3}
        effect="slide"
      />
    </div>
  );
};

export default StaffCarousel;
