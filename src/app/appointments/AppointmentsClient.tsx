/*
 * File: src/app/appointments/AppointmentsClient.js
 * SR-DEV: Appointments Client (Tabs & Cancellation Logic)
 * ACTION: REMOVED count display from tab headers (114).
 */

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import AppointmentCard from "@/components/AppointmentCard";
import CancelAppointmentModal from "@/components/CancelAppointmentModal";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, CalendarX2 } from "lucide-react";

export default function AppointmentsClient({ allAppointments }: { allAppointments: any[] }) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const router = useRouter();
  
  // Cancellation State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // --- Filter Logic ---
  const [upcoming, past] = useMemo(() => {
    const now = new Date();
    const up: any[] = [];
    const p: any[] = [];

    allAppointments.forEach(appt => {
      // Combine date and time strings for accurate comparison
      const [h, m] = appt.appointmentTime.split(":").map(Number);
      const apptDate = new Date(appt.appointmentDate);
      apptDate.setHours(h, m, 0, 0);

      // Logic:
      // "Upcoming" = Status is confirmed/pending AND time is in future
      // "Past" = Status is completed/cancelled/no-show OR time is in past
      
      const isFuture = apptDate.getTime() > now.getTime();
      const isActiveStatus = ["confirmed", "pending"].includes(appt.status);

      if (isFuture && isActiveStatus) {
        up.push(appt);
      } else {
        p.push(appt);
      }
    });
    
    // Sort Upcoming: Nearest first
    up.sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
    
    // Sort Past: Most recent first
    p.sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

    return [up, p];
  }, [allAppointments]);

  // --- Handlers ---

  const handleOpenCancelModal = (appt) => {
    setSelectedAppointment(appt);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancellation = async (reason) => {
    if (!selectedAppointment) return { success: false };

    toast.error("Cancellation is currently unavailable.");
    return { success: false };
  };

  const list = activeTab === "upcoming" ? upcoming : past;

  return (
    <div className="space-y-6">
      
      {/* --- TABS (Clean Underline Style) --- */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
         <div className="flex gap-8 px-1">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={cn(
                "pb-3 text-sm font-bold border-b-2 transition-all",
                activeTab === "upcoming" 
                  ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white" 
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
              )}
            >
              Open Appointments 
              {/* REMOVED: ({upcoming.length}) */}
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={cn(
                "pb-3 text-sm font-bold border-b-2 transition-all",
                activeTab === "past" 
                  ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white" 
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
              )}
            >
              History & Cancelled 
              {/* REMOVED: ({past.length}) */}
            </button>
         </div>
      </div>

      {/* --- LIST --- */}
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        {list.length > 0 ? (
          list.map((appt) => (
            <AppointmentCard
              key={appt._id}
              appointment={appt}
              onCancelClick={() => handleOpenCancelModal(appt)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm text-center">
             <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-full mb-4">
                {activeTab === "upcoming" ? (
                   <Search className="w-8 h-8 text-zinc-400" />
                ) : (
                   <CalendarX2 className="w-8 h-8 text-zinc-400" />
                )}
             </div>
             <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
               {activeTab === "upcoming" ? "No active appointments" : "No appointment history"}
             </h3>
             <p className="text-zinc-500 dark:text-zinc-400 mt-1 mb-6 text-sm max-w-xs">
               {activeTab === "upcoming" 
                 ? "You don't have any upcoming sessions. Ready to start your journey?" 
                 : "You haven't completed any sessions yet."}
             </p>
             {activeTab === "upcoming" && (
                <Link href="/experts">
                  <Button className="px-8 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
                    Find an Expert
                  </Button>
                </Link>
             )}
          </div>
        )}
      </div>

      {/* --- MODAL --- */}
      {isCancelModalOpen && selectedAppointment && (
        <CancelAppointmentModal
          appointment={selectedAppointment}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleConfirmCancellation}
        />
      )}
    </div>
  );
}