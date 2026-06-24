"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Clock1,
  Clock4,
  CreditCard,
  MapPin,
  SearchIcon,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";

import type { Venue, VenueService, VenueStaff } from "@/app/main/data";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { createBookingApi } from "@/lib/bookingsApi";
import Badge from "@mui/material/Badge";
import Image from "next/image";

type BookingFlow = "service-first" | "staff-first";

type MobileVenueBookingScreenProps = {
  venue: Venue;
  venueId?: string;
  venueBannerUrl?: string;
  bookingFlow?: BookingFlow;
  initialStep?: number;
  preselectedService?: VenueService | null;
  preselectedStaff?: VenueStaff | null;
  backHref?: string;
};

const paymentMethods = [
  { id: "card", label: "Card", icon: CreditCard },
  { id: "paypal", label: "PayPal", icon: Wallet },
  { id: "wallet", label: "Wallet", icon: Sparkles },
];

const trustPoints = [
  "Certified & experienced therapists",
  "Clean and hygienic environment",
  "Secure payment and instant confirmation",
];

function parsePrice(price: string) {
  return Number(price.replace(/[^0-9.]/g, "")) || 0;
}

function formatBookingDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function generateTimeSlots() {
  const slots: string[] = [];
  for (let hour = 9; hour <= 20; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === 20 && minute === 30) continue;
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      slots.push(`${displayHour}:${minute === 0 ? "00" : "30"} ${period}`);
    }
  }
  return slots;
}

export default function MobileVenueBookingScreen({
  venue,
  venueId,
  venueBannerUrl,
  bookingFlow = "service-first",
  initialStep = 1,
  preselectedService,
  preselectedStaff,
  backHref = "/main",
}: MobileVenueBookingScreenProps) {
  const router = useRouter();
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const routeVenueId = venueId || venue.id;

  const [step, setStep] = useState(initialStep);
  const [selectedService, setSelectedService] = useState<VenueService | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<VenueStaff | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0].id);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null);

  const isServiceFirstFlow = bookingFlow === "service-first";
  const serviceStep = isServiceFirstFlow ? 1 : 2;
  const staffStep = isServiceFirstFlow ? 2 : 1;
  const dateTimeStep = 3;
  const paymentStep = 4;

  const filteredStaff = useMemo(() => {
    if (!selectedService) return venue.staff;
    return venue.staff.filter((member: any) => {
      if (member.services && Array.isArray(member.services) && member.services.length > 0) {
        return member.services.some(
          (service: any) =>
            service.name?.toLowerCase() === selectedService.name.toLowerCase(),
        );
      }
      return true;
    });
  }, [selectedService, venue.staff]);

  const filteredServices = useMemo(() => {
    if (!selectedStaff) return venue.services;
    return venue.services.filter((service) => {
      // if (selectedStaff.services && Array.isArray(selectedStaff.services) && selectedStaff.services.length > 0) {
      //   return selectedStaff.services.some(
      //     (item: any) => item.name?.toLowerCase() === service.name.toLowerCase(),
      //   );
      // }
      return true;
    });
  }, [selectedStaff, venue.services]);

  useEffect(() => {
    setStep(initialStep);
    setSelectedService(preselectedService ?? null);
    setSelectedStaff(preselectedStaff ?? null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedPaymentMethod(paymentMethods[0].id);
    setBookingError(null);
  }, [bookingFlow, initialStep, preselectedService, preselectedStaff, routeVenueId, venue]);

  useEffect(() => {
    if (selectedStaff && filteredStaff.length > 0) {
      const stillExists = filteredStaff.some(
        (member: any) => member.id === selectedStaff.id || member.name === selectedStaff.name,
      );
      if (!stillExists) {
        setSelectedStaff(filteredStaff[0]);
      }
    }
  }, [filteredStaff, selectedStaff]);

  useEffect(() => {
    if (selectedService && filteredServices.length > 0) {
      const stillExists = filteredServices.some(
        (service) => service.name === selectedService.name,
      );
      if (!stillExists) {
        setSelectedService(filteredServices[0]);
      }
    }
  }, [filteredServices, selectedService]);

  const bookingPrice = selectedService ? parsePrice(selectedService.price) : 0;
  const taxes = Math.round(bookingPrice * 0.1);
  const total = bookingPrice + taxes;

  const canGoNext = Boolean(
    (step === serviceStep && selectedService) ||
      (step === staffStep && selectedStaff) ||
      (step === dateTimeStep && selectedDate && selectedTime) ||
      (step === paymentStep && selectedPaymentMethod)
  );

  const bookingSummary = [
    { label: "Service", value: selectedService?.name ?? "Select a service" },
    { label: "Therapist", value: selectedStaff?.name ?? "Select a therapist" },
    {
      label: "Date & Time",
      value: selectedDate && selectedTime
        ? `${formatBookingDate(selectedDate)} · ${selectedTime}`
        : "Select date & time",
    },
  ];

  const handleBack = () => {
    if (step === 1) {
      router.push(backHref);
      return;
    }
    setStep((current) => Math.max(1, current - 1));
  };
  
  const handleNext = () => {
    if (step < paymentStep) {
      setStep((current) => current + 1);
      return;
    }
    void handleCreateBooking();
  };

  async function handleCreateBooking() {
    if (!selectedService || !selectedStaff || !selectedDate || !selectedTime) {
      setBookingError("Please complete all required fields");
      return;
    }

    setIsCreatingBooking(true);
    setBookingError(null);

    try {
      const [timeStr, period] = selectedTime.split(" ");
      const [hours, minutes] = timeStr.split(":").map(Number);
      let hour24 = hours;
      if (period === "PM" && hours !== 12) hour24 += 12;
      if (period === "AM" && hours === 12) hour24 = 0;

      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hour24, minutes, 0, 0);

      const response = await createBookingApi({
        expertId: selectedStaff.id || "",
        organizationId: venue.userId || venue.id,
        service: selectedService.name,
        consultationType: "offline",
        scheduledDate: scheduledDateTime.toISOString(),
        duration: (selectedService as any).durationMinutes || 30,
        amount: parsePrice(selectedService.price),
        notes: `Booking for ${selectedService.name} at ${venue.name}`,
      });

      const bookingId = response?.booking?.id || response?.id;
      if (bookingId) {
        router.push(`/booking-success/${bookingId}`);
      } else {
        router.push("/appointments");
      }
    } catch (error: any) {
      setBookingError(error?.message || "Failed to create booking. Please try again.");
    } finally {
      setIsCreatingBooking(false);
    }
  }
  

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#f7fbff_0%,#f4f7fb_100%)] text-slate-900">

      <main className="mx-auto flex max-w-3xl flex-col px-4 pb-28 pt-1">

        {step === serviceStep ? (
          <section className=" ">
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Search..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 h-7"
                />
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <h3 className="text-base font-semibold text-slate-900">Select a service</h3>
            <div className="mt grid gap-2">
              {filteredServices.length === 0 ? (
                <div className="rounded-md border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                  No services available.
                </div>
              ) : (
                filteredServices.map((service, index) => {
                  const isSelected = selectedService?.name === service.name;
                  const duration = 60 + index * 15;

                  return (
                    <button
                      key={service.name}
                      type="button"
                      className={cn(
                        "flex items-center gap-3 rounded-md border p- text-left transition",
                        isSelected
                          ? " bg-blue-50/70"
                          : " hover:border-blue-300",
                      )}
                    >
                      <div
                        className="h-20 w-23 shrink-0 rounded-md bg-cover bg-center"
                        style={{ backgroundImage: `url('${service.image}')` }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900 text-xs">{service.name}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{duration} min</p>
                          </div>
                        </div>
                        <p className="mt-2 font-bold text-blue-600 text-xs">{service.price}</p>
                         <div className="relative">
                      <div
                      onClick={() => setSelectedService(service)}
                            className={cn(
                              "mt-0.5 flex shrink-0 items-center justify-center rounded-sm border bottom-0 right-1 absolute text-sm px-2",
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 text-black",
                            )}
                          >
                            {isSelected?"Selected":"Select"}
                          </div>
                          </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>
        ) : null}

        {step === staffStep ? (
          <section className=" ">
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Search..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 h-7"
                />
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <h3 className="text-base font-semibold text-slate-900">Top staff member</h3>
            <div className="mt grid gap-2">
              {filteredStaff.length === 0 ? (
                <div className="rounded-md border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                  No staff available.
                </div>
              ) : (
                filteredStaff.map((member, index) => {
                  const isSelected = selectedStaff?.id === member.id || selectedStaff?.name === member.name;

                  return (
                    <button
                      key={member.id || member.name}
                      type="button"
                      className={cn(
                        "flex items-center gap-3 rounded-md border p- text-left transition",
                        isSelected
                          ? " bg-blue-50/70"
                          : " hover:border-blue-300",
                      )}
                    >
                      <div
                        className="h-20 w-23 shrink-0 rounded-md bg-cover bg-center"
                        style={{ backgroundImage: `url('${member.image}')` }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                            <p className="truncate font-semibold text-slate-900 text-xs">{member.name}</p>
                            <Badge className="text-[8px] text-white bg-black rounded-full px-1 py-0.5 flex items-center gap-1"><Star className="w-2 h-2 text-white" />{member.rating}</Badge>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500">{member.experienceYears + "+ years Exp." || "Experienced professional"}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{member.role}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div
                            onClick={() => setSelectedStaff(member)}
                            className={cn(
                              "mt-0.5 flex shrink-0 items-center justify-center rounded-sm border bottom-[-10px] right-1 absolute text-sm px-2",
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 text-black",
                            )}
                          >
                            {isSelected ? "Selected" : "Select"}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>
        ) : null}
  
        {/* Step 3: Date & Time Picker */}
        {step === dateTimeStep ? (
          <>
            <section className="">
              {/* Date Picker - Chip Style */}
              <div className="mt-1">
                <div className="mb-3 text-sm font-semibold text-slate-900">
                  Select Date
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[0, 1, 2, 3, 4].map((offset) => {
                    const date = new Date();
                    date.setDate(date.getDate() + offset);
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNumber = date.getDate();
                    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                    
                    return (
                      <button
                        key={offset}
                        type="button"
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-sm border px-4.5 py-2  transition",
                          isSelected
                            ? "border-blue-600 bg-blue-50 text-blue-600"
                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                        )}
                      >
                        <span className="text-[8px] font-medium">{dayName}</span>
                        <span className="text-xs font-bold">{dayNumber}</span>
                        <span className="text-[8px] text-slate-500">{monthName}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setTempSelectedDate(selectedDate);
                      setIsCalendarOpen(true);
                    }}
                    // className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-4 py-2 min-w-[70px] bg-white hover:border-blue-300 transition"
                    className={cn(
                      "flex flex-col items-center justify-center rounded-sm border px-2.5 py-2  transition",
                    )}
                  >
                    <CalendarDays className="h-3 w-3 text-slate-500" />
                    <span className="text-xs text-slate-500 mt-1">More</span>
                  </button>
                </div>
              </div>

              {/* Time Picker */}
              <div className="mt-4">
                <div className="mb-3 text-sm font-semibold text-slate-900">
                  Select Time
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => {
                    const isSelected = selectedTime === time;
                    const isDisabled = !selectedDate;

                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => !isDisabled && setSelectedTime(time)}
                        className={cn(
                          "rounded-xl border px-2 py-2 text-sm font-medium transition",
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : isDisabled
                              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                              : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50",
                        )}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
                {!selectedDate ? (
                  <p className="mt-3 text-center text-xs text-amber-600">
                    Please select a date first
                  </p>
                ) : null}
              </div>
            </section>

            {/* Calendar Modal */}
            {isCalendarOpen && (
              <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 mb-10" onClick={() => setIsCalendarOpen(false)}>
                <div className="relative w-full max-w-md bg-white rounded-t-2xl animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between border-b border-slate-100 p-4">
                    <h3 className="text-lg font-semibold text-slate-900">Select Date</h3>
                    <button
                      onClick={() => setIsCalendarOpen(false)}
                      className="rounded-full p-1 hover:bg-slate-100"
                    >
                      <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-2 flex justify-center">
                    <Calendar
                      mode="single"
                      selected={tempSelectedDate || undefined}
                      onSelect={(date) => setTempSelectedDate(date ?? null)}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      className="rounded-md bg-white text-black"
                    />
                  </div>
                  <div className="flex gap-1 border-t border-slate-100 p-4">
                    <button
                      onClick={() => {
                        if (tempSelectedDate) {
                          setSelectedDate(tempSelectedDate);
                        }
                        setIsCalendarOpen(false);
                      }}
                      className="flex-1 rounded-xs bg-blue-600 py-2 text-sm font-semibold text-white"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}

        {/* Step 4: Payment & Summary */}
        {step === paymentStep ? (
  <>
    {/* Your Booking Section */}
    <section className="mt-2 ">
      <p className="text-base font-semibold text-slate-900">Your Booking</p>
      <div className="mt-1 space-y-1 rounded-sm border border-slate-100 bg-white p-1 shadow-sm">
        {/* Service */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-sm bg-cover bg-center bg-red-300" style={{ backgroundImage: `url('${selectedService?.image}')` }} />
          <div>
            <p className="text-sm font-semibold text-slate-900">{selectedService?.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-slate-500">{selectedService?.price}</span>
              <span className="text-sm text-slate-500">•</span>
              <span className="flex items-center gap-1">
              <span className="text-sm text-slate-500"><Clock4 className="w-4 h-4 text-slate-500" /></span>
              <span className="text-sm text-slate-500">{(selectedService as any)?.durationMinutes || "30"} min</span>
              </span>
            </div>
          </div>
          </div>
          <button
            onClick={() => setStep(serviceStep)}
            className="text-xs font-semibold text-blue-600 border border-blue-600 rounded-sm px-2 py-1"
          >
            Change
          </button>
        </div>

        {/* Staff */}
        <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-sm bg-cover bg-center bg-red-300" style={{ backgroundImage: `url('${selectedStaff?.image}')` }} />
          <div>
            <p className="text-sm font-semibold text-slate-900">{selectedStaff?.name}</p>
            <p className="text-sm text-slate-500">{selectedStaff?.experienceYears}+ Years Exp.</p>
          </div>
          </div>
          <button
            onClick={() => setStep(staffStep)}
            className="text-xs font-semibold text-blue-600 border border-blue-600 rounded-sm px-2 py-1"
          >
            Change
          </button>
 
        </div>

        {/* Date & Time */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1">
              <CalendarDays className="w-4 h-4 text-slate-500" />
            <p className="text-sm font-semibold text-slate-900">
              {selectedDate && selectedTime 
                ? `${formatBookingDate(selectedDate)}`
                : "Date not selected"}
            </p>
            </div>
            {selectedTime && (
              <div className="flex items-center gap-1">
              <Clock4 className="w-4 h-4 text-slate-500" />
              <p className="text-sm text-slate-500">{selectedTime}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setStep(dateTimeStep)}
            className="text-xs font-semibold text-blue-600 border border-blue-600 rounded-sm px-2 py-1"
          >
            Change
          </button>
        </div>
      </div>
    </section>

    {/* Order Summary Section */}
    <section className="mt-2">
      <p className="text-base font-semibold text-slate-900">Order Summary</p>
      <div className="mt-1 space-y-2 rounded-sm border border-slate-100 bg-white p-1 shadow-sm">
        {/* Service line items - assuming single service for now */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">{selectedService?.name}</span>
          <span className="text-sm font-semibold text-slate-900">{selectedService?.price}</span>
        </div>
        
        {/* Subtotal */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-slate-600">Subtotal</span>
          <span className="text-sm font-semibold text-slate-900">${bookingPrice}</span>
        </div>
        
        {/* Tax */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Tax (5%)</span>
          <span className="text-sm font-semibold text-slate-900">${Math.round(bookingPrice * 0.05)}</span>
        </div>
        
        {/* Total */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 mt-2">
          <span className="text-base font-semibold text-slate-900">Total</span>
          <span className="text-xl font-bold text-blue-600">${Math.round(bookingPrice * 1.05)}</span>
        </div>
      </div>
    </section>

    {/* Payment Method Section */}
    <section className="mt-2 ">
      <p className="text-base font-semibold text-slate-900">Payment Method</p>
      <div className="mt-1 space-y-2 rounded-sm border border-slate-100 bg-white p-1 shadow-sm">
        {/* Mastercard */}
        <button
          onClick={() => setSelectedPaymentMethod("mastercard")}
          className={cn(
            "flex items-center justify-between w-full p-1 rounded-sm border transition",
            selectedPaymentMethod === "mastercard"
              ? "border-blue-600 bg-blue-50/50"
              : "border-slate-200 hover:border-blue-300"
          )}
        >
          <div className="flex items-center gap-3">
          <div className={cn(
            "h-5 w-5 rounded-full border-2 flex items-center justify-center",
            selectedPaymentMethod === "mastercard"
              ? "border-blue-600"
              : "border-slate-300"
          )}>
            {selectedPaymentMethod === "mastercard" && (
              <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            )}
          </div>
          <span className="text-sm font-medium text-slate-900">Mastercard</span>
          </div>
            <div className="h-8 w-12 flex items-center justify-center">
              <Image height={32} width={32} src="/Mastercard_2019_logo.svg" alt="Mastercard" />
            </div>
          
        </button>

        {/* Visa */}
        <button
          onClick={() => setSelectedPaymentMethod("visa")}
          className={cn(
            "flex items-center justify-between w-full p-1 rounded-sm border transition",
            selectedPaymentMethod === "visa"
              ? "border-blue-600 bg-blue-50/50"
              : "border-slate-200 hover:border-blue-300"
          )}
        >
          <div className="flex items-center gap-3">
          <div className={cn(
            "h-5 w-5 rounded-full border-2 flex items-center justify-center",
            selectedPaymentMethod === "visa"
              ? "border-blue-600"
              : "border-slate-300"
          )}>
            {selectedPaymentMethod === "visa" && (
              <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            )}
          </div>
          <span className="text-sm font-medium text-slate-900">Visa</span>
          </div>
            <div className="h-8 w-12 flex items-center justify-center">
              <Image height={32} width={32} src="/Visa_Inc._logo_(2021–present).svg" alt="visa" />
            </div>
          
        </button>

        {/* PayPal */}
        <button
          onClick={() => setSelectedPaymentMethod("paypal")}
          className={cn(
            "flex items-center justify-between w-full p-1 rounded-sm border transition",
            selectedPaymentMethod === "paypal"
              ? "border-blue-600 bg-blue-50/50"
              : "border-slate-200 hover:border-blue-300"
          )}
        >
          <div className="flex items-center gap-3">
          <div className={cn(
            "h-5 w-5 rounded-full border-2 flex items-center justify-center",
            selectedPaymentMethod === "paypal"
              ? "border-blue-600"
              : "border-slate-300"
          )}>
            {selectedPaymentMethod === "paypal" && (
              <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            )}
          </div>
          <span className="text-sm font-medium text-slate-900">Paypal</span>
          </div>
            <div className="h-8 w-12 flex items-center justify-center">
              <Image height={20} width={20} src="/PayPal_Logo_Icon_2014.svg" alt="paypal" />
            </div>
          
        </button>

        {/* Add New Card */}
        <button
          onClick={() => setSelectedPaymentMethod("new-card")}
          className={cn(
            "flex items-center justify-between w-full p-1 rounded-sm border transition",
            selectedPaymentMethod === "new-card"
              ? "border-blue-600 bg-blue-50/50"
              : "border-slate-200 hover:border-blue-300"
          )}
        >
          <div className="flex items-center gap-3">
          <div className={cn(
            "h-5 w-5 rounded-full border-2 flex items-center justify-center",
            selectedPaymentMethod === "new-card"
              ? "border-blue-600"
              : "border-slate-300"
          )}>
            {selectedPaymentMethod === "new-card" && (
              <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            )}
          </div>
          <span className="text-sm font-medium text-slate-900">Add New Card</span>
          </div>
            <div className="h-8 w-12 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-slate-500" />
            </div>
          
        </button>
      </div>
    </section>

    {/* Pay Button - Update the footer button text for payment step */}
  </>
) : null}
        {/* {step === paymentStep ? (
          <>
            <section className="mt-4 rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Date, time and payment
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose a time slot and confirm your payment method.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-slate-100 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                  Choose a date
                </div>
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={(date) => setSelectedDate(date ?? null)}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  className="rounded-md bg-white text-black"
                />
              </div>

              <div className="mt-4 rounded-[24px] border border-slate-100 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Choose a time
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => {
                    const isSelected = selectedTime === time;
                    const isDisabled =
                      !selectedDate || time === "12:30 PM" || time === "1:00 PM";

                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => !isDisabled && setSelectedTime(time)}
                        className={cn(
                          "rounded-xl border px-2 py-2 text-sm font-semibold transition",
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : isDisabled
                              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                              : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50",
                        )}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
                {!selectedDate ? (
                  <p className="mt-3 text-center text-xs text-amber-600">
                    Please select a date first
                  </p>
                ) : null}
              </div>
            </section>

            <section className="mt-4 rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Payment method</h3>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedPaymentMethod === method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={cn(
                        "inline-flex min-w-fit items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition",
                        isSelected
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {method.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-[22px] bg-slate-50 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-900">${bookingPrice}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Taxes & fees</span>
                  <span className="font-semibold text-slate-900">${taxes}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-sm font-semibold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-blue-600">${total}</span>
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Booking summary</p>
          <div className="mt-3 space-y-2">
            {bookingSummary.map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-3 py-2.5"
              >
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className="max-w-[60%] text-right text-xs font-semibold text-slate-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>
          </>
        ) : null} */}

        {bookingError ? (
          <section className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {bookingError}
          </section>
        ) : null}
      </main>

      <footer className=" fixed inset-x-0 bottom-10 z-20 border-t border-slate-200 bg-white/95 px-4 py-2 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl gap-3 justify-center">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="h-6 flex-1 rounded-xs max-w-[7rem] border-slate-200 bg-white text-sm font-semibold text-blue-600"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          ) : null}

          <Button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext || isCreatingBooking}
            className="h-6 flex-1 rounded-xs max-w-[7rem] bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700"
          >
            {step < paymentStep ? (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            ) : isCreatingBooking ? (
              "Processing..."
            ) : (
              <>
                Pay & Book
                <CalendarDays className="ml- h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
