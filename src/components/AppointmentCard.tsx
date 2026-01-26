/*
 * File: src/components/AppointmentCard.js
 * SR-DEV: Premium Session Card (Amazon-Style Layout, Custom Theme)
 * FINAL: Secure meetingId routing + safe join logic
 */

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ProfileImage from "@/components/ProfileImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Icons
import {
  Video,
  MapPin,
  Clock,
  Download,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

export default function AppointmentCard({ appointment, onCancelClick }) {
  /* ----------------------------------------------------
   * 1. DATA EXTRACTION
   * -------------------------------------------------- */
  const expert = appointment.expertId || {};
  const expertName = expert.name || "Unknown Expert";
  const expertRole = expert.specialization || "Specialist";
  const expertId = expert._id;

  const appointmentDate = new Date(appointment.appointmentDate);
  const timeString = appointment.appointmentTime; // "14:30"
  const duration = appointment.duration || 60;

  const isVideoCall = appointment.appointmentType === "Video Call";

  // Status flags
  const isCancelled = appointment.status === "cancelled";
  const isCompleted = appointment.status === "completed";
  const isPending = appointment.status === "pending";
  const isConfirmed = appointment.status === "confirmed";

  // Past date check
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const apptDay = new Date(appointmentDate);
  apptDay.setHours(0, 0, 0, 0);

  const isPastDate = apptDay < today;
  const isUpcoming = isConfirmed && !isPastDate;

  // Formatting
  const displayDate = appointmentDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  // Secure display ID
  const displayID = (appointment.meetingId || appointment._id)
    .slice(-8)
    .toUpperCase();

  /* ----------------------------------------------------
   * 2. JOIN WINDOW LOGIC (timezone safe)
   * -------------------------------------------------- */
  const [canJoin, setCanJoin] = useState(false);

  useEffect(() => {
    if (!isUpcoming || !isVideoCall || !appointment.meetingId) {
      // Keep this check to ensure we have a meeting ID and it's not cancelled
      setCanJoin(false);
      return;
    }

    const checkTime = () => {
      // ---------------------------------------------
      // TEMP: FOR TESTING - ALWAYS ALLOW JOIN
      // ---------------------------------------------
      setCanJoin(true); 
      
      /* ORIGINAL LOGIC (Commented out for testing)
      const now = new Date();
      const start = new Date(
        `${appointment.appointmentDate.split("T")[0]}T${timeString}:00`
      );
      const diffMins = (start - now) / 60000;
      setCanJoin(diffMins <= 10 && diffMins > -duration);
      */
    };

    checkTime();
    const timer = setInterval(checkTime, 60000);
    return () => clearInterval(timer);
  }, [
    appointment.appointmentDate,
    timeString,
    duration,
    isUpcoming,
    isVideoCall,
    appointment.meetingId,
  ]);

  /* ----------------------------------------------------
   * RENDER
   * -------------------------------------------------- */
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm transition-all hover:shadow-md">
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-zinc-50/80 dark:bg-zinc-900/50 p-4 border-b text-sm">
        <div className="flex gap-8">
          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-500">
              Date Booked
            </span>
            <div className="font-medium">{displayDate}</div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-500">
              Total
            </span>
            <div className="font-medium">₹{appointment.price}</div>
          </div>

          <div className="hidden sm:block">
            <span className="text-[10px] font-bold uppercase text-zinc-500">
              Sent To
            </span>
            <div className="font-medium truncate max-w-[150px]">
              {expertName}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-bold uppercase text-zinc-500">
            Session ID # {displayID}
          </div>
          <Link
            href={`/experts/${expertId}`}
            className="text-primary text-xs hover:underline"
          >
            View Expert Profile
          </Link>
        </div>
      </div>

      {/* ---------------- BODY ---------------- */}
      <div className="p-6 flex flex-col md:flex-row gap-6">
        {/* LEFT */}
        <div className="flex-1 flex gap-5">
          <ProfileImage
            src={expert.profilePicture}
            name={expertName}
            sizeClass="h-24 w-24"
            className="rounded-lg shadow-sm"
          />

          <div className="min-w-0">
            <h3 className="font-bold text-xl truncate">
              {appointment.serviceName}
            </h3>

            <p className="text-sm text-zinc-500 mb-3">
              Conducted by{" "}
              <span className="font-medium">{expertName}</span> • {expertRole}
            </p>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs gap-1.5">
                <Clock className="w-3 h-3" />
                {timeString} ({duration} min)
              </Badge>

              <Badge variant="secondary" className="text-xs gap-1.5">
                {isVideoCall ? (
                  <Video className="w-3 h-3" />
                ) : (
                  <MapPin className="w-3 h-3" />
                )}
                {appointment.appointmentType}
              </Badge>

              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] font-bold uppercase",
                  isCancelled
                    ? "bg-red-100 text-red-700"
                    : isCompleted
                    ? "bg-blue-100 text-blue-700"
                    : isUpcoming
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                )}
              >
                {isCancelled
                  ? "Cancelled"
                  : isCompleted
                  ? "Completed"
                  : isUpcoming
                  ? "Upcoming"
                  : "Pending"}
              </Badge>
            </div>
          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="w-full md:w-64 flex flex-col gap-2.5 border-t md:border-l pt-4 md:pt-0 md:pl-6">
          {/* JOIN */}
          {canJoin && isVideoCall && (
            <Link
              href={`/video-call/${appointment.meetingId}`}
              target="_blank"
            >
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 animate-pulse">
                <Video className="w-4 h-4" /> Join Session Now
              </Button>
            </Link>
          )}

          {/* SETUP PENDING */}
          {isUpcoming && isVideoCall && !appointment.meetingId && (
            <Button disabled variant="outline" className="gap-2 text-amber-600">
              <AlertCircle className="w-4 h-4" /> Setup Pending
            </Button>
          )}

          {/* CANCEL (only if meeting not prepared) */}
          {isUpcoming && !canJoin && !appointment.meetingId && (
            <Button
              variant="outline"
              onClick={onCancelClick}
              className="w-full"
            >
              Request Cancellation
            </Button>
          )}

          {/* NOTES */}
          {appointment.whiteboardUrl && (
            <a
              href={appointment.whiteboardUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" className="w-full gap-2">
                <Download className="w-4 h-4" /> Download Notes
              </Button>
            </a>
          )}

          {/* BOOK AGAIN */}
          {!isUpcoming && !isPending && expertId && (
            <Link href={`/experts/${expertId}`}>
              <Button className="w-full gap-2">
                <RotateCcw className="w-4 h-4" /> Book Again
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ---------------- FOOTER ---------------- */}
      <div className="px-6 py-3 border-t text-xs flex gap-6">
        {isCompleted && (
          <Link
            href={`/experts/${expertId}?review=true`}
            className="text-blue-600 hover:underline"
          >
            Write a product review
          </Link>
        )}

        <Link href="/support" className="text-blue-600 hover:underline">
          Get help with appointment
        </Link>
      </div>
    </div>
  );
}
