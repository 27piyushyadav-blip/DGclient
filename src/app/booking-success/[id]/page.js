/*
 * File: src/app/booking-success/[id]/page.js
 * FIXED: Adapted for User + ExpertProfile architecture.
 * - Removes reference to deleted 'Expert' model.
 * - Merges Identity (User) and Specialization (Profile) for display.
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Appointment from "@/models/Appointment";
import User from "@/models/User"; // [!code ++]
import ExpertProfile from "@/models/ExpertProfile"; // [!code ++]
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProfileImage from "@/components/ProfileImage";
import { CheckCircle2, Calendar, Clock, Video, MapPin, ArrowRight, Home } from "lucide-react";
import { format } from "date-fns";

export const metadata = {
  title: "Booking Confirmed | Mind Namo",
  description: "Your appointment has been successfully scheduled.",
};

// Helper to fetch appointment securely
async function getAppointment(id, userId) {
  if (!id || id.length !== 24) return null;
  
  try {
    await connectToDatabase();
    
    // 1. Fetch Appointment with Population
    const appointment = await Appointment.findOne({ 
      _id: id, 
      userId 
    })
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

    if (!appointment) return null;

    // 2. Transform for Client
    // We flatten the user and profile data into one 'expert' object for easy use
    const expertUser = appointment.expertId || {};
    const expertProfile = appointment.expertProfileId || {};

    const formattedAppointment = {
        ...appointment,
        expertId: {
            _id: expertUser._id,
            name: expertUser.name || "Unknown Expert",
            profilePicture: expertUser.image,
            specialization: expertProfile.specialization || "Specialist"
        }
    };

    return JSON.parse(JSON.stringify(formattedAppointment));
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return null;
  }
}

export default async function BookingSuccessPage({ params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    const { id } = await params; 
    redirect(`/login?callbackUrl=/booking-success/${id}`);
  }

  const { id } = await params;
  const appointment = await getAppointment(id, session.user.id);

  if (!appointment) {
    notFound();
  }

  const expert = appointment.expertId; // Now contains merged User + Profile data
  const isVideo = appointment.appointmentType === "Video Call";
  
  const dateObj = new Date(appointment.appointmentDate);
  const formattedDate = format(dateObj, "EEEE, MMMM d, yyyy");

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
      
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Success Header */}
        <div className="bg-green-600 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-green-100">
            Your session has been scheduled. A confirmation email is on its way.
          </p>
        </div>

        {/* Appointment Details */}
        <div className="p-8 space-y-8">
          
          {/* Expert Info */}
          <div className="flex items-center gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
             <ProfileImage 
                src={expert.profilePicture} 
                name={expert.name} 
                sizeClass="w-16 h-16" 
                textClass="text-xl"
             />
             <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">Appointment with</p>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{expert.name}</h3>
                <p className="text-sm text-primary font-medium">{expert.specialization}</p>
             </div>
          </div>

          {/* Session Grid */}
          <div className="grid grid-cols-1 gap-4">
             <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                <Calendar className="w-5 h-5 text-zinc-500 mt-0.5" />
                <div>
                   <p className="text-xs font-bold text-zinc-400 uppercase">Date</p>
                   <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{formattedDate}</p>
                </div>
             </div>
             
             <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                <Clock className="w-5 h-5 text-zinc-500 mt-0.5" />
                <div>
                   <p className="text-xs font-bold text-zinc-400 uppercase">Time</p>
                   <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                     {appointment.appointmentTime} ({appointment.duration} mins)
                   </p>
                </div>
             </div>

             <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                {isVideo ? <Video className="w-5 h-5 text-zinc-500 mt-0.5" /> : <MapPin className="w-5 h-5 text-zinc-500 mt-0.5" />}
                <div>
                   <p className="text-xs font-bold text-zinc-400 uppercase">Type</p>
                   <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{appointment.appointmentType}</p>
                </div>
             </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
             <Link href="/appointments">
                <Button className="w-full h-12 text-base bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900">
                   View My Appointments <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
             </Link>
             <Link href="/">
                <Button variant="outline" className="w-full h-12 border-zinc-200 dark:border-zinc-700">
                   <Home className="w-4 h-4 mr-2" /> Back to Home
                </Button>
             </Link>
          </div>

        </div>
      </div>
    </div>
  );
}