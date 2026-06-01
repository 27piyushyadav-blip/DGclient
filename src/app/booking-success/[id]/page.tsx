"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProfileImage from "@/components/ProfileImage";
import { CheckCircle2, Calendar, Clock, Video, MapPin, ArrowRight, Home, Loader2 } from "lucide-react";
import { getBookingDetailsApi } from "@/lib/bookingsApi";
import { useAuth } from "@/contexts/AuthContext";

export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    async function fetchDetails() {
      if (!id || !isAuthenticated) return;
      try {
        const res = await getBookingDetailsApi(id);
        console.log("Success page booking details:", res);
        setBookingDetails(res);
      } catch (err: any) {
        console.error("Failed to load booking details:", err);
        setError("Could not load booking details.");
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchDetails();
    }
  }, [id, isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-zinc-50 dark:bg-zinc-950 px-4">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-4">{error || "Booking not found."}</p>
          <Link href="/">
            <Button variant="outline" className="text-black bg-white"><Home className="mr-2 h-4 w-4" /> Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Support both nested structure and flat structure safely
  const booking = bookingDetails.booking || bookingDetails;
  const expert = bookingDetails.expert || bookingDetails.expertInfo || booking.expert || null;
  const expertProfile = bookingDetails.expertProfile || bookingDetails.expertProfileInfo || booking.expertProfile || null;
  const organization = bookingDetails.organization || bookingDetails.organizationInfo || booking.organization || null;

  const expertName = expert?.name || "Expert";
  const expertProfilePicture = expert?.avatar || expert?.image || expert?.profilePicture || null;
  const expertSpecialization = expertProfile?.specialization || expert?.specialization || expert?.role || "Specialist";

  const isVideo = booking.consultationType === "online" || booking.consultationType === "Video Call";
  
  let formattedDate = "N/A";
  let formattedTime = "N/A";
  
  if (booking.scheduledDate) {
    const bookingDate = new Date(booking.scheduledDate);
    if (!isNaN(bookingDate.getTime())) {
      formattedDate = bookingDate.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      
      formattedTime = bookingDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Success Header */}
        <div className="bg-green-600 p-8 text-center text-white">
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
                src={expertProfilePicture} 
                name={expertName} 
                sizeClass="w-16 h-16" 
                textClass="text-xl"
             />
             <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">Appointment with</p>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{expertName}</h3>
                <p className="text-sm text-primary font-medium">{expertSpecialization}</p>
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
                   <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{formattedTime}</p>
                </div>
             </div>

             <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                {isVideo ? <Video className="w-5 h-5 text-zinc-500 mt-0.5" /> : <MapPin className="w-5 h-5 text-zinc-500 mt-0.5" />}
                <div>
                   <p className="text-xs font-bold text-zinc-400 uppercase">Type</p>
                   <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                     {isVideo ? "Video Call" : `In-Person (${organization?.name || "Clinic Visit"})`}
                   </p>
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
                <Button variant="outline" className="w-full h-12 border-zinc-200 dark:border-zinc-700 bg-white text-black hover:bg-slate-50 hover:text-black">
                   <Home className="w-4 h-4 mr-2" /> Back to Home
                </Button>
             </Link>
          </div>

        </div>
      </div>
    </div>
  );
}