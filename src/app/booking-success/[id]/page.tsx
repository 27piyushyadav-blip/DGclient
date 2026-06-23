"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProfileImage from "@/components/ProfileImage";
import { CheckCircle2, Calendar, Clock, Video, MapPin, ArrowRight, Home, Loader2, ArrowLeft, Bell, ListChecks, Check, CalendarDays, CreditCard, CalendarPlus, LayoutGrid, Scissors, User, HelpCircle } from "lucide-react";
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
  let formattedShortDate = "N/A";
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

      formattedShortDate = bookingDate.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      
      formattedTime = bookingDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  const serviceName = booking.service || "Service";
  const serviceImage = booking.serviceImage || expertProfilePicture || "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop";
  const amount = booking.amount ?? 0;
  const durationMinutes = booking.duration || 30;
  const experienceText = expert?.experienceYears
    ? `${expert.experienceYears}+ Years Exp.`
    : expertSpecialization;
  const locationName = organization?.name || (isVideo ? "Online Session" : "Clinic Visit");
  const locationAddress = organization?.address || organization?.location || organization?.city || "";
  const paymentLabel = booking.paymentMethod || booking.paymentMethodLabel || "Card payment";
  const bookingRef = `#${String(booking._id || booking.id || id).toUpperCase()}`;


  const addToGoogleCalendar = () => {
    // const startDate = "20260701T100000Z"; // YYYYMMDDTHHmmssZ
    // const endDate = "20260701T110000Z";
    const formatGoogleCalendarDate = (date) =>
      date.toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}Z$/, "Z");
    
    const start = new Date("2026-06-18T04:30:00.000Z");
    
    const durationMinutes = 60;
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    
    const startDate = formatGoogleCalendarDate(start);
    const endDate = formatGoogleCalendarDate(end);
    
    const dates = `${startDate}/${endDate}`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE
      &text=${encodeURIComponent(serviceName)}
      &dates=${dates}
      &details=${encodeURIComponent(`${serviceName} with ${expertName}`)}
      &location=${encodeURIComponent(locationAddress || locationName)}
      &sf=true&output=xml`
      .replace(/\s+/g, "");
  
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
      <div className="hidden md:block w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-500">
        
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

      {/* Mobile View */}
      <div className="block md:hidden fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-zinc-950 pb-10">

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">

          {/* Success indicator */}
          <div className="flex flex-col items-center pt-4 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/30">
              <Check className="h-9 w-9 text-white" strokeWidth={3} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Your booking is confirmed!</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">We look forward to seeing you.</p>
          </div>

          {/* Details card */}
          <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">

            {/* Service */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-16 w-16 shrink-0 rounded-xl bg-cover bg-center bg-slate-200"
                  style={{ backgroundImage: `url('${serviceImage}')` }}
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{serviceName}</h3>
                  <div className="mt-1 flex items-center gap-1 text-slate-500 dark:text-zinc-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{durationMinutes} min</span>
                  </div>
                </div>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">${amount}</span>
            </div>

            <div className="my-4 border-t border-slate-100 dark:border-zinc-800" />

            {/* Barber */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Barber</span>
              <div className="flex items-center gap-2">
                <ProfileImage
                  src={expertProfilePicture}
                  name={expertName}
                  sizeClass="w-8 h-8"
                  textClass="text-xs"
                />
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{expertName}</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{experienceText}</p>
                </div>
              </div>
            </div>

            <div className="my-4 border-t border-slate-100 dark:border-zinc-800" />

            {/* Date & Time */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Date &amp; Time</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-zinc-300">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {formattedShortDate}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-zinc-300">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {formattedTime}
                </span>
              </div>
            </div>

            <div className="my-4 border-t border-slate-100 dark:border-zinc-800" />

            {/* Location */}
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Location</span>
              <div className="flex items-start gap-1.5 text-right">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-zinc-200">{locationName}</p>
                  {locationAddress ? (
                    <p className="text-xs text-slate-400 dark:text-zinc-500">{locationAddress}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="my-4 border-t border-slate-100 dark:border-zinc-800" />

            {/* Payment */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Payment</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-zinc-300">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                  {paymentLabel}
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">${amount}</span>
              </div>
            </div>

            <div className="my-4 border-t border-slate-100 dark:border-zinc-800" />

            {/* Booking ID */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Booking ID</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200 w-[175px]">{bookingRef}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={addToGoogleCalendar}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white py-3 text-sm font-semibold text-blue-600 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <CalendarPlus className="h-4 w-4" />
              Add to Calendar
            </button>
            <button
              type="button"
              onClick={() => router.push("/appointments")}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25"
            >
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}