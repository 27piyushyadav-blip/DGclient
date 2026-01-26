/*
 * File: src/app/checkout/CheckoutClient.js
 * SR-DEV: Client-Side Checkout Logic
 * ACTION: REMOVED Platform Fee display (140) and simplified price summary.
 */

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ProfileImage from "@/components/ProfileImage";

// --- Icons ---
import { 
  Loader2, Lock, ArrowLeft, Tag, Clock, Video, Building2, 
  Calendar as CalendarIcon, CheckCircle2 
} from "lucide-react";

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-24 space-y-4">
    <Loader2 className="h-10 w-10 animate-spin text-zinc-300" />
    <p className="text-sm text-zinc-500 font-medium">Verifying session...</p>
  </div>
);

export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // 1. Parse Data
  const bookingData = {
    expertId: searchParams?.get("expertId"),
    expertName: searchParams?.get("expertName"),
    expertImage: searchParams?.get("expertImage"),
    serviceName: searchParams?.get("serviceName"),
    type: searchParams?.get("type"),
    date: searchParams?.get("date"), // YYYY-MM-DD
    time: searchParams?.get("time"),
    duration: searchParams?.get("duration"),
    price: searchParams?.get("price"),
    timezone: searchParams?.get("timezone"),
  };
  
  // 2. Format Date (Uses date string from URL for display consistency)
  const displayDate = bookingData.date ? new Date(bookingData.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : 'N/A';

  // 3. Submission Handler
  const handleConfirmAndPay = () => {
    setError("");
    startTransition(async () => {
      setError("Checkout is currently unavailable.");
    });
  };

  // Loading State (Auth or Missing Data)
  if (!bookingData.expertId) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      
      {/* Back Button */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          className="gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white pl-0 hover:bg-transparent"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Booking
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* --- LEFT: Booking Summary --- */}
        <div className="lg:col-span-2 space-y-6">
           <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
             Review & Confirm
           </h1>

           {/* Expert Info */}
           <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-5 shadow-sm">
              <ProfileImage 
                src={bookingData.expertImage} 
                name={bookingData.expertName}
                sizeClass="h-16 w-16"
                textClass="text-xl"
              />
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">You are booking with</p>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{bookingData.expertName}</h2>
              </div>
           </div>
           
           {/* Session Details */}
           <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
                 <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Appointment Details</h3>
              </div>
              
              <div className="p-6 space-y-6">
                 <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600"><Tag className="w-5 h-5" /></div>
                    <div>
                       <p className="text-xs text-zinc-500 mb-0.5">Service</p>
                       <p className="font-medium text-zinc-900 dark:text-zinc-100">{bookingData.serviceName}</p>
                       <p className="text-xs text-zinc-500 mt-0.5">{bookingData.duration} minutes</p>
                    </div>
                 </div>

                 <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600"><CalendarIcon className="w-5 h-5" /></div>
                    <div>
                       <p className="text-xs text-zinc-500 mb-0.5">Date & Time</p>
                       <p className="font-medium text-zinc-900 dark:text-zinc-100">{displayDate}</p>
                       <p className="text-xs text-zinc-500 mt-0.5">at {bookingData.time} ({bookingData.timezone})</p>
                    </div>
                 </div>

                 <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600">
                       {bookingData.type === "Video Call" ? <Video className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                    </div>
                    <div>
                       <p className="text-xs text-zinc-500 mb-0.5">Session Type</p>
                       <p className="font-medium text-zinc-900 dark:text-zinc-100">{bookingData.type}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* --- RIGHT: Payment --- */}
        <div className="lg:col-span-1">
           <div className="sticky top-24 space-y-6">
              
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden">
                 <div className="p-6 bg-zinc-900 text-white dark:bg-zinc-800">
                    <p className="text-xs font-medium opacity-80 uppercase tracking-wider mb-1">Total Payable</p>
                    <p className="text-3xl font-bold">₹{bookingData.price}</p>
                 </div>

                 <div className="p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                       <span className="text-zinc-500">Consultation Fee</span>
                       <span className="font-medium">₹{bookingData.price}</span>
                    </div>
                    {/* PLATFORM FEE REMOVED (140) */}
                    <div className="flex justify-between text-sm">
                       <span className="text-zinc-500">Platform Fee</span>
                       <span className="font-medium text-green-600">₹0</span>
                    </div>

                    <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800 my-2" />
                    
                    <Button 
                      size="lg" 
                      className="w-full h-12 text-base font-bold shadow-md bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleConfirmAndPay}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Processing...</>
                      ) : (
                        <><Lock className="h-4 w-4 mr-2" /> Pay & Confirm</>
                      )}
                    </Button>

                    {error && (
                      <p className="text-xs text-red-500 font-medium text-center bg-red-50 dark:bg-red-900/10 p-2 rounded">
                        {error}
                      </p>
                    )}

                    <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 mt-4">
                       <CheckCircle2 className="w-3.5 h-3.5" /> Secure SSL Encryption
                    </div>
                 </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}