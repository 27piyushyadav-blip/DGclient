"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, MapPin, Mail, Phone, Globe, Clock, Users, Building2, Play, ChevronRight, CheckCircle, Video, LogOut, Trash2, Edit3, UserPlus, UserMinus } from "lucide-react";

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
  status?: "active" | "inactive";
  videoUrl?: string;
  staff?: any[];
  [key: string]: any;
}

interface OrganizationSidebarModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization | null;
}

export default function OrganizationSidebarModal({
  isOpen,
  onClose,
  organization,
}: OrganizationSidebarModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!organization) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isOpen 
            ? "bg-black/50 backdrop-blur-sm opacity-100" 
            : "bg-black/0 backdrop-blur-none opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header Section */}
        <div className="relative">
          {/* Video Thumbnail Section */}
          <div className="relative aspect-video bg-gradient-to-r from-indigo-500 to-purple-600">
            {organization.videoUrl ? (
              <>
                <Image
                  src={organization.videoUrl}
                  alt={organization.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="w-16 h-16 text-white/60" />
              </div>
            )}
            
            {/* Play Button Overlay */}
            <button className="absolute inset-0 flex items-center justify-center group">
              <div className="bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full p-3 transition-all group-hover:scale-110">
                <Play className="w-6 h-6 fill-white text-white" />
              </div>
            </button>

            {/* Video Duration Badge */}
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm rounded-md px-2 py-1">
              <span className="text-white text-xs">1 min intro video</span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Organization Logo Overlay */}
          <div className="absolute -bottom-8 left-6">
            <div className="w-16 h-16 rounded-xl bg-white dark:bg-zinc-800 shadow-lg overflow-hidden border-4 border-white dark:border-zinc-900">
              {organization.logoUrl ? (
                <Image
                  src={organization.logoUrl}
                  alt={organization.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
                  <span className="text-xl font-bold text-[var(--primary-color)] dark:text-[var(--primary-color)]">
                    {organization.name?.charAt(0) || "O"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-12 pb-6 px-5 overflow-y-auto h-[calc(100%-14rem)]">
          {/* Organization Name & Status */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {organization.name}
            </h2>
            {organization.status && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                organization.status === "active" 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                <CheckCircle className="w-3 h-3" />
                {organization.status === "active" ? "Active" : "Inactive"}
              </span>
            )}
          </div>

          {/* Category/Location */}
          {organization.location && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              {organization.location}
            </p>
          )}

          {/* Video Duration Info */}
          <div className="flex items-center gap-2 mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            <Video className="w-4 h-4" />
            <span>1 min intro video</span>
            <span className="text-zinc-300 dark:text-zinc-600">•</span>
            <span>1 min</span>
          </div>

          {/* Action Buttons - Profile Management */}
          <div className="space-y-2 mb-6">
            <button className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors group">
              <span className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                <UserPlus className="w-4 h-4" />
                <span className="text-sm font-medium">Show Profile</span>
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors group">
              <span className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Delete Profile</span>
              </span>
              <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors group">
              <span className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                <Edit3 className="w-4 h-4" />
                <span className="text-sm font-medium">Change Logo & Video</span>
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors group">
              <span className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                <UserMinus className="w-4 h-4" />
                <span className="text-sm font-medium">Connect & Disconnect Experts</span>
              </span>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Experts Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
                Experts
              </h3>
              <button className="text-[var(--primary-color)] dark:text-[var(--primary-color)] text-sm font-medium hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-2">
              {/* Expert List */}
              {organization.staff && organization.staff.length > 0 ? (
                organization.staff.slice(0, 3).map((expert, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
                        {expert.avatar ? (
                          <Image src={expert.avatar} alt={expert.name} width={40} height={40} className="rounded-full" />
                        ) : (
                          <span className="text-sm font-medium text-[var(--primary-color)] dark:text-[var(--primary-color)]">
                            {expert.name?.charAt(0) || "E"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                          {expert.name || "Expert Name"}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {expert.role || "Professional"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-zinc-500 dark:text-zinc-400 text-sm">
                  No experts connected yet
                </div>
              )}
            </div>

            {/* Add Expert Button */}
            <button className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-[var(--primary-color)] dark:text-[var(--primary-color)] text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors">
              <UserPlus className="w-4 h-4" />
              Connect Expert
            </button>
          </div>
        </div>
      </div>
    </>
  );
}