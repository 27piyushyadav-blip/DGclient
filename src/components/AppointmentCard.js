/*
 * File: src/components/AppointmentCard.js
 * SR-DEV: Premium Session Card (Amazon-Style Layout, Custom Theme)
 *
 * FEATURES:
 * - Header Strip: Shows Date, Price, and Booking ID.
 * - Split Layout: Expert info on left, critical actions on right.
 * - Footer: Secondary actions like "Write Review".
 * - Smart Logic: Shows "Join" button only when the session is live.
 */

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ProfileImage from "@/components/ProfileImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Icons
import { Video, MapPin, Clock, Download, RotateCcw } from "lucide-react";

export default function AppointmentCard({ appointment, onCancelClick }) {
  // --- 1. Data Extraction ---
  const expert = appointment.expertId || {};
  const expertName = expert.name || "Unknown Expert";
  const expertRole = expert.specialization || "Specialist";
  const expertId = expert._id;

  const appointmentDate = new Date(appointment.appointmentDate);
  const timeString = appointment.appointmentTime; // "14:30"
  const duration = appointment.duration || 60;
  
  const isVideoCall = appointment.appointmentType === "Video Call";
  
  // Status Flags
  const isCancelled = appointment.status === "cancelled";
  const isCompleted = appointment.status === "completed";
  const isPending = appointment.status === "pending";
  const isConfirmed = appointment.status === "confirmed";
  
  // Check if date is in the past
  const today = new Date();
  today.setHours(0,0,0,0);
  const apptDay = new Date(appointmentDate);
  apptDay.setHours(0,0,0,0);
  const isPastDate = apptDay < today;
  
  // Derived "Upcoming" status
  const isUpcoming = isConfirmed && !isPastDate;

  // Formatting
  const displayDate = appointmentDate.toLocaleDateString("en-US", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC"
  });
  const displayID = appointment._id.slice(-8).toUpperCase();

  // --- 2. Join Window Logic ---
  const [canJoin, setCanJoin] = useState(false);

  useEffect(() => {
    if (!isUpcoming || !isVideoCall) return;
    const checkTime = () => {
      const now = new Date();
      const [h, m] = timeString.split(":").map(Number);
      const start = new Date(appointmentDate);
      start.setHours(h, m, 0, 0);
      
      const diffMins = (start - now) / 60000;
      // Show 10 mins before start -> until session end
      setCanJoin(diffMins <= 10 && diffMins > -duration);
    };
    checkTime();
    const timer = setInterval(checkTime, 60000);
    return () => clearInterval(timer);
  }, [appointmentDate, timeString, duration, isUpcoming, isVideoCall]);


  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm transition-all hover:shadow-md">
      
      {/* --- HEADER STRIP (Amazon Style) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50/80 dark:bg-zinc-900/50 p-4 border-b border-zinc-100 dark:border-zinc-800 text-sm">
         
         <div className="flex gap-8">
            <div className="flex flex-col">
               <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Date Booked</span>
               <span className="font-medium text-zinc-900 dark:text-zinc-200">{displayDate}</span>
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Total</span>
               <span className="font-medium text-zinc-900 dark:text-zinc-200">₹{appointment.price}</span>
            </div>
            <div className="hidden sm:flex flex-col">
               <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Sent To</span>
               <span className="font-medium text-zinc-900 dark:text-zinc-200 truncate max-w-[150px]">{expertName}</span>
            </div>
         </div>

         <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Session ID # {displayID}</span>
            <div className="flex gap-2 mt-1">
               <Link href={`/experts/${expertId}`} className="text-primary hover:underline text-xs font-medium">
                 View Expert Profile
               </Link>
            </div>
         </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="p-6 flex flex-col md:flex-row gap-6">
         
         {/* Left: Expert Details */}
         <div className="flex-1 flex gap-5">
            <div className="relative shrink-0">
               <ProfileImage 
                  src={expert.profilePicture} 
                  name={expertName} 
                  sizeClass="h-24 w-24" 
                  textClass="text-2xl font-bold text-white"
                  className="rounded-lg shadow-sm" // Square-ish for "Product" feel
               />
            </div>
            
            <div className="flex flex-col justify-center min-w-0">
               <h3 className="font-bold text-xl text-zinc-900 dark:text-zinc-50 truncate">
                  {appointment.serviceName}
               </h3>
               <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                  Conducted by <span className="font-medium text-zinc-900 dark:text-zinc-200">{expertName}</span> • {expertRole}
               </p>
               
               {/* Badges Row */}
               <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="font-normal text-xs px-2.5 h-6 gap-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200">
                     <Clock className="w-3 h-3" /> {timeString} ({duration} min)
                  </Badge>
                  
                  <Badge variant="secondary" className="font-normal text-xs px-2.5 h-6 gap-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200">
                     {isVideoCall ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                     {appointment.appointmentType}
                  </Badge>

                  {/* Status Badge */}
                  <Badge 
                    className={cn(
                      "px-2.5 h-6 text-[10px] font-bold uppercase tracking-wider pointer-events-none",
                      isCancelled ? "bg-red-100 text-red-700 hover:bg-red-100 border-red-200" :
                      isCompleted ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200" :
                      isUpcoming ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" :
                      "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"
                    )}
                  >
                     {isCancelled ? "Cancelled" : isCompleted ? "Completed" : isUpcoming ? "Upcoming" : "Pending"}
                  </Badge>
               </div>
            </div>
         </div>

         {/* Right: Primary Actions (Stacked Buttons) */}
         <div className="w-full md:w-64 flex flex-col gap-2.5 shrink-0 justify-center border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800 pt-4 md:pt-0 md:pl-6">
            
            {/* 1. Join Button (Highest Priority) */}
            {canJoin && (
               <Link href={`/video-call/${appointment._id}`} target="_blank">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm h-9 gap-2 animate-pulse">
                     <Video className="w-4 h-4" /> Join Session Now
                  </Button>
               </Link>
            )}

            {/* [!code ++] TEMPORARY: Test Button for Video Call */}
            {isVideoCall && (
               <Link href={`/video-call/${appointment._id}`} target="_blank">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm h-9 gap-2 mt-1">
                     <Video className="w-4 h-4" /> Join Call (Test Mode)
                  </Button>
               </Link>
            )}

            {/* 2. Cancel Button (Secondary) */}
            {isUpcoming && !canJoin && (
               <Button variant="outline" size="sm" onClick={onCancelClick} className="w-full justify-center h-9 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  Request Cancellation
               </Button>
            )}

            {/* 3. Download Notes */}
            {appointment.whiteboardUrl && (
               <a href={appointment.whiteboardUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm" className="w-full justify-center h-9 gap-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100">
                     <Download className="w-3.5 h-3.5" /> Download Notes
                  </Button>
               </a>
            )}

            {/* 4. Book Again (Recurring) */}
            {!isUpcoming && !isPending && expertId && (
               <Link href={`/experts/${expertId}`}>
                  <Button className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 h-9 shadow-sm">
                     <RotateCcw className="w-3.5 h-3.5 mr-2" /> Book Again
                  </Button>
               </Link>
            )}

         </div>
      </div>

      {/* --- FOOTER LINKS --- */}
      <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 flex flex-wrap gap-6 text-xs font-medium">
         
         {isCompleted && (
            <Link href={`/experts/${expertId}?review=true`} className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1">
               Write a product review
            </Link>
         )}
         
         <Link href="/support" className="text-blue-600 hover:text-blue-700 hover:underline">
            Get help with appointment
         </Link>
         
         {/* Only show Archive if completed/cancelled */}
         {(isCompleted || isCancelled) && (
             <button className="text-blue-600 hover:text-blue-700 hover:underline text-left">
                Archive Appointment
             </button>
         )}
      </div>

    </div>
  );
}