/*
 * File: src/app/appointments/page.js
 * FIXED: Adapted for User + ExpertProfile architecture.
 * - Removes reference to deleted 'Expert' model.
 * - Maps 'expertProfileId' to the card's ID field so links work correctly.
 */

import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Appointment from "@/models/Appointment";
import User from "@/models/User"; 
import ExpertProfile from "@/models/ExpertProfile"; 
import AppointmentsClient from "./AppointmentsClient";
import { Loader2Icon } from "@/components/Icons";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const LoadingSpinner = () => (
  <div className="flex flex-1 items-center justify-center py-32">
    <Loader2Icon className="h-10 w-10 animate-spin text-zinc-300" />
  </div>
);

async function getAppointments(userId) {
  try {
    await connectToDatabase();
    
    // 1. Fetch Appointments & Populate Relations
    const appointments = await Appointment.find({ userId })
      .sort({ appointmentDate: -1 })
      .populate({
        path: "expertId", // This is the User ID (Identity)
        select: "name image", 
        model: User
      })
      .populate({
        path: "expertProfileId", // This is the Profile ID (Specialization)
        select: "specialization", 
        model: ExpertProfile
      })
      .lean();

    // 2. Transform Data for Frontend
    const formattedAppointments = appointments.map(appt => {
      const expertUser = appt.expertId || {};
      const expertProfile = appt.expertProfileId || {};

      return {
        ...appt,
        // We restructure this object to match what AppointmentCard expects
        expertId: {
          // [!code fix] Use PROFILE ID for the link, not User ID
          _id: expertProfile._id ? expertProfile._id.toString() : (appt.expertProfileId?.toString() || expertUser._id?.toString()), 
          
          name: expertUser.name || "Unknown Expert",
          profilePicture: expertUser.image, 
          specialization: expertProfile.specialization || "Specialist"
        }
      };
    });

    return JSON.parse(JSON.stringify(formattedAppointments));
  } catch (error) {
    console.error("Fetch Appointments Error:", error);
    return [];
  }
}

export default async function AppointmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login?callbackUrl=/appointments");

  const allAppointments = await getAppointments(session.user.id);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-zinc-50/50 dark:bg-zinc-950">
      
      <main className="container mx-auto max-w-5xl px-4 md:px-8 py-8 flex-1">
        
        {/* Breadcrumb / Header */}
        <div className="mb-8">
           <div className="text-xs font-medium text-zinc-500 mb-3 flex items-center gap-2">
              <Link href="/" className="hover:underline hover:text-zinc-800 dark:hover:text-zinc-200">Your Account</Link>
              <span className="text-zinc-300">/</span>
              <span className="text-primary">Your Appointments</span>
           </div>
           <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Your Appointments</h1>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <AppointmentsClient allAppointments={allAppointments} />
        </Suspense>
      </main>
    </div>
  );
}