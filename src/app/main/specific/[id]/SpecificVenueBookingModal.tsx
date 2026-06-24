"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Wallet,
} from "lucide-react";

import type { Venue, VenueStaff, VenueService } from "@/app/main/data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createBookingApi } from "@/lib/bookingsApi";

type SpecificVenueBookingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venue: Venue;
  preselectedService?: any;
  preselectedStaff?: any;
  initialStep?: number;
  bookingFlow?: "service-first" | "staff-first";
  verticalBannerUrl?: string;
  preselectedCategoryId?: string | null;
};

const whyChooseUs = [
  "Certified & experienced therapists",
  "Clean & hygienic environment",
  "Premium quality oils & products",
  "Customer satisfaction guarantee",
];

const paymentMethods = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "paypal", label: "PayPal", icon: Wallet },
  { id: "afterpay", label: "Afterpay", icon: Sparkles },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parsePrice(price: string) {
  return Number(price.replace(/[^0-9.]/g, "")) || 0;
}

function buildAvailableDates() {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index + 1);
    return date;
  });
}

function formatBookingDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SpecificVenueBookingModal({
  open,
  onOpenChange,
  venue,
  preselectedService,
  preselectedStaff,
  initialStep = 1,
  bookingFlow = "service-first",
  verticalBannerUrl,
  preselectedCategoryId,
}: SpecificVenueBookingModalProps) {
  const services = venue.services;
  const staff = venue.staff;
  const availableDates = useMemo(() => buildAvailableDates(), []);
  const availableTimes = useMemo(
    () => [
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "01:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
    ],
    [],
  );

  const [step, setStep] = useState(initialStep);
  const [selectedService, setSelectedService] = useState<VenueService | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<VenueStaff | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0].id);
  const [isDateTimeModalOpen, setIsDateTimeModalOpen] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(
    selectedDate,
  );
  const [tempSelectedTime, setTempSelectedTime] = useState<string | null>(
    selectedTime,
  );
  // Filter staff based on the selected service
  const filteredStaff = useMemo(() => {
    if (!selectedService) return staff;
    return staff.filter((member: any) => {
      // If member has services listed, check if one of them matches selectedService.name
      if (member.services && Array.isArray(member.services) && member.services.length > 0) {
        return member.services.some(
          (s: any) => s.name.toLowerCase() === selectedService.name.toLowerCase()
        );
      }
      return true;
    });
  }, [staff, selectedService]);

  // Filter services based on the selected staff and preselected category
  const filteredServices = useMemo(() => {
    let result = services;
    if (preselectedCategoryId) {
      result = result.filter((service) => service.categoryId === preselectedCategoryId);
    }
    if (!selectedStaff) return result;
    return result.filter((service) => {
      // If selectedStaff has services listed, check if one of them matches service.name
      if (selectedStaff.services && Array.isArray(selectedStaff.services) && selectedStaff.services.length > 0) {
        return selectedStaff.services.some(
          (s: any) => s.name.toLowerCase() === service.name.toLowerCase()
        );
      }
      return true;
    });
  }, [services, selectedStaff, preselectedCategoryId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsToShow = 2;
  const totalCards = filteredStaff.length;
  const maxIndex = Math.max(0, totalCards - cardsToShow);

  // Booking state
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Add these states and calculations
  const [scrollIndex, setScrollIndex] = useState(0);
  const cardsPerView = 2; // Always show 2 cards
  const maxScrollIndex = Math.max(0, filteredStaff.length - cardsPerView);
  const totalDots = Math.ceil(filteredStaff.length / cardsPerView);

  const handlePrev = () => {
    setScrollIndex(Math.max(0, scrollIndex - 1));
  };

  const handleNext = () => {
    setScrollIndex(Math.min(maxScrollIndex, scrollIndex + 1));
  };

  // Reset selected staff and scroll index if selected service changes and filters staff
  useEffect(() => {
    setScrollIndex(0);
    if (selectedStaff) {
      if (filteredStaff.length > 0) {
        const isStillAvailable = filteredStaff.some(
          (member: any) => member.id === selectedStaff.id || member.name === selectedStaff.name
        );
        if (!isStillAvailable) {
          setSelectedStaff(filteredStaff[0]);
        }
      } else {
        setSelectedStaff(null);
      }
    }
  }, [filteredStaff, selectedStaff]);

  // Reset selected service if selected staff changes and filters services
  useEffect(() => {
    if (selectedService) {
      if (filteredServices.length > 0) {
        const isStillAvailable = filteredServices.some(
          (service: any) => service.name === selectedService.name
        );
        if (!isStillAvailable) {
          setSelectedService(filteredServices[0]);
        }
      } else {
        setSelectedService(null);
      }
    }
  }, [filteredServices, selectedService]);

  const isServiceFirstFlow = bookingFlow === "service-first";
  const serviceStep = isServiceFirstFlow ? 1 : 2;
  const staffStep = isServiceFirstFlow ? 2 : 1;
  const paymentStep = 3;

  useEffect(() => {
    if (!open) {
      return;
    }

    setStep(initialStep);

    // If there's a preselected service, use it
    if (preselectedService) {
      setSelectedService(preselectedService);
    } else {
      setSelectedService(null);
    }

    // If there's a preselected staff, use it
    if (preselectedStaff) {
      setSelectedStaff(preselectedStaff);
    } else {
      setSelectedStaff(null);
    }

    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedPaymentMethod(paymentMethods[0].id);
  }, [open, services, staff, availableDates, availableTimes, initialStep, preselectedService, preselectedStaff]);

// Add this useEffect after the existing useEffect
useEffect(() => {
  // When entering step 3 (payment step) and date/time is not selected, auto-open the modal
  if (step === paymentStep && (!selectedDate || !selectedTime)) {
    setTempSelectedDate(selectedDate);
    setTempSelectedTime(selectedTime);
    setIsDateTimeModalOpen(true);
  }
}, [step, selectedDate, selectedTime, paymentStep]);


const bookingPrice = selectedService ? parsePrice(selectedService.price) : 0;
const taxes = Math.round(bookingPrice * 0.1);
const total = bookingPrice + taxes;

const bookingSummary = [
  { label: "Service", value: selectedService?.name ?? "Select a service" },
  { label: "Therapist", value: selectedStaff?.name ?? "Select a therapist" },
  {
    label: "Date & Time",
    value:
      selectedDate && selectedTime
        ? `${selectedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}, ${selectedTime}`
        : "Select date & time",
  },
];

const stepConfig = [
  { id: 1, label: isServiceFirstFlow ? "Select Service" : "Select Staff" },
  { id: 2, label: isServiceFirstFlow ? "Select Staff" : "Select Service" },
  { id: 3, label: "Book & Pay" },
];

const canGoNext = Boolean(
  (step === serviceStep && selectedService) ||
  (step === staffStep && selectedStaff) ||
  (step === paymentStep &&
    selectedDate &&
    selectedTime &&
    selectedPaymentMethod),
);

// Add this function to generate time slots with 30-minute intervals
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 9; hour <= 20; hour++) {
    for (let minute of [0, 30]) {
      if (hour === 20 && minute === 30) continue; // Stop at 8:00 PM
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const formattedMinute = minute === 0 ? "00" : "30";
      slots.push(`${displayHour}:${formattedMinute} ${period}`);
    }
  }
  return slots;
};

const timeSlots = useMemo(() => generateTimeSlots(), []);

// Add this function to handle date/time confirmation
const handleDateTimeConfirm = () => {
  if (tempSelectedDate && tempSelectedTime) {
    setSelectedDate(tempSelectedDate);
    setSelectedTime(tempSelectedTime);
    setIsDateTimeModalOpen(false);
  }
};

// Add this function to handle booking creation
const handleCreateBooking = async () => {
  if (!selectedService || !selectedStaff || !selectedDate || !selectedTime) {
    setBookingError('Please complete all required fields');
    return;
  }

  setIsCreatingBooking(true);
  setBookingError(null);

  try {
    // Parse the time to get hours and minutes
    const [timeStr, period] = selectedTime.split(' ');
    const [hours, minutes] = timeStr.split(':').map(Number);
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;

    // Create the scheduled date
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(hour24, minutes, 0, 0);

    // Calculate duration (default to 60 minutes for now)
    const duration = 60;

    // Calculate amount from service price
    const amount = parsePrice(selectedService.price);

    // Create booking
    const response = await createBookingApi({
      expertId: selectedStaff.id || '',
      organizationId: venue.userId || venue.id, // Use userId (organisation.id) if available, otherwise fall back to id
      service: selectedService.name,
      consultationType: 'offline', // Default to offline for venue bookings
      scheduledDate: scheduledDateTime.toISOString(),
      duration: duration,
      amount: amount,
      notes: `Booking for ${selectedService.name} at ${venue.name}`,
    });

    // Close modal and show success
    onOpenChange(false);
    
    // Optionally redirect to booking success page
    if (response.booking?.id) {
      window.location.href = `/booking-success/${response.booking.id}`;
    }
  } catch (error: any) {
    console.error('Booking creation failed:', error);
    setBookingError(error.message || 'Failed to create booking. Please try again.');
  } finally {
    setIsCreatingBooking(false);
  }
};

return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="overflow-hidden border-0 p-0 sm:max-w-[1100px]">
      <div className="grid max-h-[90vh] min-h-[680px] md:grid-cols-[280px_minmax(0,1fr)]">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-amber-950 via-amber-800 to-stone-950 p-6 text-white md:flex md:flex-col md:justify-end">
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
            style={{
              backgroundImage: verticalBannerUrl
                ? `url('${verticalBannerUrl}')`
                : "url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop')",
              opacity: verticalBannerUrl ? 1 : 0.7,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />

          <div className="relative space-y-6">
            <div>
              <p className="text-3xl font-semibold leading-tight">
                Escape the stress.
              </p>
              <p className="text-3xl font-semibold leading-tight text-white/90">
                Embrace the calm.
              </p>
            </div>

            <div className="space-y-4 text-sm text-white/95">
              <div className="flex items-center gap-3">
                <UserRound className="h-4 w-4" />
                <span>Professional therapists</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4" />
                <span>Hygienic environment</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4" />
                <span>Premium massage experience</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col bg-white">
          <div className="border-b border-slate-100 px-6 pb-5 pt-6">
            <DialogTitle className="text-3xl font-bold text-slate-900">
              Book Your Appointment
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-slate-500">
              Relax, rejuvenate & refresh your mind and body
            </DialogDescription>

            <div className="mt-6 flex items-center gap-3 overflow-x-auto">
              {stepConfig.map((item, index) => (
                <div
                  key={item.id}
                  className="flex min-w-fit items-center gap-3"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition",
                      step >= item.id
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-500",
                    )}
                  >
                    {item.id}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      step >= item.id ? "text-blue-600" : "text-slate-500",
                    )}
                  >
                    {item.label}
                  </span>
                  {index < stepConfig.length - 1 ? (
                    <div className="h-px w-16 bg-slate-200 md:w-28" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className={cn(
            "flex-1 px-6 py-6",
            step === paymentStep ? "overflow-visible" : "overflow-y-scroll scrollbar-thin",
            step !== paymentStep && "min-h-0"
          )}>
            <div className={cn(
              step === paymentStep ? "h-full" : "grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_240px]"
            )}>
              <div className={cn(
                step !== paymentStep && "space-y-5",
                step === staffStep && !isServiceFirstFlow && "lg:col-span-2",
                step === paymentStep && "h-full"
              )}>
                {step === serviceStep ? (
                  <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                    <h3 className="text-xl font-semibold text-slate-900">Select Your Massage Service</h3>
                    <p className="mt-1 text-sm text-slate-500">Choose the treatment you want to book today.</p>

                    <div className={`mt-5 grid gap-4 md:grid-cols-2`}>
                      {filteredServices.map((service, index) => {
                        const isSelected =
                          selectedService?.name === service.name;
                        const duration = (service as any).durationMinutes || 60;

                        return (
                          <button
                            key={service.name}
                            type="button"
                            onClick={() => setSelectedService(service)}
                            className={cn(
                              "group relative rounded-[22px] border p-3 text-left transition",
                              isSelected
                                ? "border-blue-600 bg-blue-50/70 shadow-sm"
                                : "border-slate-200 hover:border-blue-300",
                            )}
                          >
                            <div
                              className={cn(
                                "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border bg-white shadow-sm z-10",
                                isSelected
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 text-transparent",
                              )}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </div>

                            <div className="flex gap-3">
                              {service.image ? (
                                <div
                                  className="h-24 w-24 rounded-2xl bg-cover bg-center shrink-0 transition-transform duration-300 group-hover:scale-105"
                                  style={{
                                    backgroundImage: `url('${service.image}')`,
                                  }}
                                />
                              ) : (
                                <div className="h-24 w-24 rounded-2xl flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100/60 transition-colors duration-300 group-hover:from-slate-100 group-hover:to-slate-200/50 shrink-0">
                                  <Sparkles className="w-8 h-8 text-slate-300 transition-transform duration-300 group-hover:scale-110" />
                                </div>
                              )}
                              <div className="flex flex-1 flex-col">
                                <div className="flex items-start justify-between gap-3 pr-6">
                                  <div>
                                    <p className="font-semibold text-slate-900 leading-snug">
                                      {service.name}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {duration} min
                                    </p>
                                  </div>
                                </div>
                                <p className="mt-3 text-lg font-bold text-blue-600">
                                  {service.price}
                                </p>
                              </div>
                            </div>
                            {service.description && (
                              <p className="mt-auto pt-2 text-xs leading-5 text-slate-500">
                                {service.description}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {step === staffStep ? (
                  <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                    <h3 className="text-xl font-semibold text-slate-900">
                      Select Your Preferred Therapist
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {isServiceFirstFlow
                        ? "Our professional therapists are here to provide your best experience."
                        : "Choose your therapist first, then continue to service selection."}
                    </p>

                    <div className="relative mt-5">
                      {/* Slider Container */}
                      <div className="overflow-hidden">
                        <div
                          className="flex transition-transform duration-300 ease-in-out"
                          style={{
                            transform: `translateX(-${scrollIndex * (100 / cardsPerView)}%)`,
                          }}
                        >
                          {filteredStaff.map((member, index) => {
                            const isSelected =
                              selectedStaff?.name === member.name;
                            const experience = member.experienceYears || (3 + index * 2);
                            const specialties = (member.services && member.services.length > 0)
                              ? member.services.map((item: any) => item.name).join(", ")
                              : member.role;

                            return (
                              <div
                                key={member.name}
                                className="flex-shrink-0 px-2"
                                style={{ width: `${100 / cardsPerView}%` }}
                              >
                                <button
                                  type="button"
                                  onClick={() => setSelectedStaff(member)}
                                  className={cn(
                                    "w-full rounded-[22px] border p-3 text-left transition",
                                    isSelected
                                      ? "border-blue-600 bg-blue-50/70 shadow-sm"
                                      : "border-slate-200 hover:border-blue-300",
                                  )}
                                >
                                  {isServiceFirstFlow ? (
                                    <>
                                      <div className="relative">
                                        <div
                                          className="h-44 rounded-[20px] bg-cover bg-center"
                                          style={{
                                            backgroundImage: `url('${member.image}')`,
                                          }}
                                        />
                                        <div
                                          className={cn(
                                            "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border bg-white",
                                            isSelected
                                              ? "border-blue-600 text-blue-600"
                                              : "border-slate-300 text-transparent",
                                          )}
                                        >
                                          <Check className="h-3.5 w-3.5" />
                                        </div>
                                      </div>

                                      <div className="pt-4 text-center">
                                        <p className="text-lg font-semibold text-slate-900">
                                          {member.name}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                          {experience} Years Experience
                                        </p>
                                        <div className="mt-2 flex items-center justify-center gap-1 text-amber-400">
                                          {Array.from({ length: 5 }).map(
                                            (_, ratingIndex) => (
                                              <Star
                                                key={ratingIndex}
                                                className="h-3.5 w-3.5 fill-current"
                                              />
                                            ),
                                          )}
                                          <span className="ml-1 text-xs text-slate-500">
                                            ({180 + index * 23})
                                          </span>
                                        </div>
                                        <p className="mt-3 text-xs leading-5 text-slate-500">
                                          Specializes in{" "}
                                          {specialties}
                                        </p>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="relative flex flex-col items-center justify-center gap-4 text-center">
                                      {/* Check button - top right */}
                                      <div
                                        className={cn(
                                          "absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full border",
                                          isSelected
                                            ? "border-blue-600 bg-blue-600 text-white"
                                            : "border-slate-300 text-transparent",
                                        )}
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                      </div>

                                      {/* Image */}
                                      <div
                                        className="h-20 w-20 shrink-0 rounded-2xl bg-cover bg-center"
                                        style={{
                                          backgroundImage: `url('${member.image}')`,
                                        }}
                                      />

                                      {/* Content */}
                                      <div className="min-w-0">
                                        <p className="text-lg font-semibold text-slate-900">
                                          {member.name}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                          {experience} Years Experience
                                        </p>

                                        <div className="mt-2 flex items-center justify-center gap-1 text-amber-400">
                                          {Array.from({ length: 5 }).map(
                                            (_, ratingIndex) => (
                                              <Star
                                                key={ratingIndex}
                                                className="h-3.5 w-3.5 fill-current"
                                              />
                                            ),
                                          )}
                                          <span className="ml-1 text-xs text-slate-500">
                                            ({180 + index * 23})
                                          </span>
                                        </div>

                                        <p className="mt-3 text-xs leading-5 text-slate-500">
                                          Specializes in{" "}
                                          {specialties}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Navigation Buttons */}
                      {filteredStaff.length > cardsPerView && (
                        <>
                          <button
                            onClick={handlePrev}
                            disabled={scrollIndex === 0}
                            className={cn(
                              "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full bg-white p-2 shadow-lg border border-slate-200 transition-all",
                              scrollIndex === 0
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-slate-50 hover:shadow-xl",
                            )}
                          >
                            <ChevronLeft className="h-5 w-5 text-slate-600" />
                          </button>

                          <button
                            onClick={handleNext}
                            disabled={scrollIndex >= maxScrollIndex}
                            className={cn(
                              "absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full bg-white p-2 shadow-lg border border-slate-200 transition-all",
                              scrollIndex >= maxScrollIndex
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-slate-50 hover:shadow-xl",
                            )}
                          >
                            <ChevronRight className="h-5 w-5 text-slate-600" />
                          </button>
                        </>
                      )}

                      {/* Dots Indicator */}
                      {filteredStaff.length > cardsPerView && (
                        <div className="mt-6 flex justify-center gap-2">
                          {Array.from({ length: totalDots }).map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setScrollIndex(idx)}
                              className={cn(
                                "h-2 rounded-full transition-all",
                                scrollIndex === idx
                                  ? "w-6 bg-blue-600"
                                  : "w-2 bg-slate-300 hover:bg-slate-400",
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Next button for staff-first flow - only show when !isServiceFirstFlow */}
                    {!isServiceFirstFlow && (
                      <div className="mt-8 flex items-center gap-3">
                        {step > 1 ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep(step - 1)}
                            className="flex-1 rounded-2xl bg-white py-6 text-base font-semibold text-blue-600 shadow-lg shadow-blue-600/25"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Back
                          </Button>
                        ) : null}

                        <Button
                          type="button"
                          onClick={() => {
                            if (step < paymentStep) {
                              setStep(step + 1);
                              return;
                            }
                            onOpenChange(false);
                          }}
                          disabled={!canGoNext}
                          className="flex-1 rounded-2xl bg-blue-600 py-6 text-base font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700"
                        >
                          {step < paymentStep ? (
                            <>
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </>
                          ) : (
                            <>Pay Now</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : null}

                {step === paymentStep ? (
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_500px]">
                    <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm max-h-[30rem] overflow-y-scroll scrollbar-thin scrollbar-thumb-slate-100">
                      <h3 className="text-xl font-semibold text-slate-900">
                        Your Booking Details
                      </h3>

                      <div className="mt-5 flex items-center gap-4 rounded-[22px] border border-slate-100 p-4 ">
                        {selectedService?.image ? (
                          <div
                            className="h-24 w-30 rounded-2xl bg-cover bg-center shrink-0"
                            style={{
                              backgroundImage: `url('${selectedService?.image}')`,
                            }}
                          />
                        ) : (
                          <div className="h-24 w-30 rounded-2xl flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 shrink-0">
                            <Sparkles className="w-8 h-8 text-slate-300" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">
                            {selectedService?.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            60 min - {selectedService?.price}
                          </p>
                          {/* <p className="mt-3 text-sm leading-6 text-slate-500">
                            Relaxing full-body massage to improve circulation and reduce stress.
                          </p> */}
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-900">
                            Selected Therapist
                          </h4>
                          <button
                            type="button"
                            onClick={() => setStep(staffStep)}
                            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                          >
                            Change
                          </button>
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                          <div
                            className="h-14 w-14 rounded-full bg-cover bg-center"
                            style={{
                              backgroundImage: `url('${selectedStaff?.image}')`,
                            }}
                          />
                          <div>
                            <p className="font-semibold text-slate-900">
                              {selectedStaff?.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {selectedStaff?.role}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="font-semibold text-slate-900">
                          Select Date & Time
                        </h4>

                        <button
                          type="button"
                          onClick={() => {
                            setTempSelectedDate(selectedDate);
                            setTempSelectedTime(selectedTime);
                            setIsDateTimeModalOpen(true);
                          }}
                          className="mt-4 w-full rounded-[24px] border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-slate-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CalendarIcon className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-sm font-medium text-slate-700">
                                  {selectedDate && selectedTime
                                    ? `${formatBookingDate(selectedDate)} at ${selectedTime}`
                                    : "Select date & time"}
                                </p>
                                {selectedDate && selectedTime && (
                                  <p className="mt-1 text-xs text-blue-500">
                                    Click to change
                                  </p>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm max-h-[30rem]">
                      <h3 className="text-xl font-semibold text-slate-900">
                        Your Booking Summary
                      </h3>
                      <div className="flex gap-4 mt-4">
                        {/* Left Column - Booking Summary & Venue */}
                        <div className="flex-1">
                          <div className="space-y-3 text-sm">
                            {bookingSummary.map((item) => (
                              <div
                                key={item.label}
                                className="flex items-start justify-between gap-4"
                              >
                                <span className="text-slate-500 text-xs">
                                  {item.label}
                                </span>
                                <span className="text-right font-semibold text-slate-900 text-xs">
                                  {item.value}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 rounded-xl border border-slate-100 p-2">
                            <div
                              className="h-16 rounded-xl bg-cover bg-center"
                              style={{
                                backgroundImage: `url('${venue.bgImage?.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "") || "https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=1200&auto=format&fit=crop"}')`,
                              }}
                            />
                            <div className="mt-2 flex items-start gap-2">
                              <MapPin className="mt-0.5 h-3 w-3 text-blue-600" />
                              <div>
                                <p className="text-xs font-semibold text-slate-900">
                                  {venue.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {venue.address}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Payment Method & Total */}
                        <div className="flex-1">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              Payment Method
                            </p>
                            <div className="mt-2 space-y-1.5">
                              {paymentMethods.map((method) => {
                                const Icon = method.icon;
                                const isSelected =
                                  selectedPaymentMethod === method.id;

                                return (
                                  <button
                                    key={method.id}
                                    type="button"
                                    onClick={() =>
                                      setSelectedPaymentMethod(method.id)
                                    }
                                    className={cn(
                                      "flex w-full items-center rounded-lg border px-2 py-1.5 text-left transition",
                                      isSelected
                                        ? "border-blue-600 bg-blue-50"
                                        : "border-slate-200 hover:border-blue-300",
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={cn(
                                          "flex h-3.5 w-3.5 items-center justify-center rounded-full border",
                                          isSelected
                                            ? "border-blue-600 bg-blue-600 text-white"
                                            : "border-slate-300",
                                        )}
                                      >
                                        {isSelected && (
                                          <Check className="h-2 w-2" />
                                        )}
                                      </div>
                                      <Icon className="h-3 w-3 text-slate-500" />
                                      <span className="text-xs font-medium text-slate-800">
                                        {method.label}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">
                                Subtotal
                              </span>
                              <span className="text-xs font-semibold text-slate-900">
                                ${bookingPrice}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">
                                Taxes & Fees
                              </span>
                              <span className="text-xs font-semibold text-slate-900">
                                ${taxes}
                              </span>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-200 pt-1.5">
                              <span className="text-sm font-semibold text-slate-900">
                                Total
                              </span>
                              <span className="text-lg font-bold text-blue-600">
                                ${total}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        {step > 1 ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep(step - 1)}
                            className="flex-1 rounded-xl bg-white py-2 text-sm font-semibold text-blue-600 shadow-sm hover:bg-slate-100 hover:text-blue-600"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            Back
                          </Button>
                        ) : null}

                        <Button
                          type="button"
                          onClick={() => {
                            if (step < paymentStep) {
                              setStep(step + 1);
                              return;
                            }
                            handleCreateBooking();
                          }}
                          disabled={!canGoNext || isCreatingBooking}
                          className="flex-1 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                          {step < paymentStep ? (
                            <>
                              Next
                              <ChevronRight className="h-3.5 w-3.5" />
                            </>
                          ) : isCreatingBooking ? (
                            <>Processing...</>
                          ) : (
                            <>Pay Now</>
                          )}
                        </Button>
                      </div>

                      {bookingError && (
                        <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                          {bookingError}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

        {(step !== paymentStep && !(step === staffStep && !isServiceFirstFlow)) ? (
          <div className="rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm h-fit">
            <h3 className="text-base font-semibold text-slate-900">Your Booking</h3>

            {selectedService ? (
              <div className="mt-3 flex gap-2 rounded-[20px] border border-slate-100 p-2 items-center">
                {selectedService.image ? (
                  <div
                    className="h-14 w-14 rounded-xl bg-cover bg-center shrink-0"
                    style={{ backgroundImage: `url('${selectedService.image}')` }}
                  />
                ) : (
                  <div className="h-14 w-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 shrink-0">
                    <Sparkles className="w-5 h-5 text-slate-300" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-sm">{selectedService.name}</p>
                  <p className="text-xs text-slate-500">60 min</p>
                  <p className="mt-1 text-base font-bold text-blue-600">{selectedService.price}</p>
                </div>
              </div>
            ) : null}

            {(isServiceFirstFlow ? step >= 2 : step >= 1) && selectedStaff ? (
              <div className="mt-3 flex items-center gap-2 rounded-[20px] border border-slate-100 p-2">
                <div
                  className="h-10 w-10 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${selectedStaff.image}')` }}
                />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{selectedStaff.name}</p>
                  <p className="text-xs text-slate-500">{selectedStaff.role}</p>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => step < 3 && setStep(step + 1)}
              className="mt-3 flex w-full items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-left text-xs text-slate-500 transition hover:bg-slate-100"
            >
              <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs">
                {selectedDate && selectedTime
                  ? `${selectedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} - ${selectedTime}`
                  : "Select Date & Time"}
              </span>
            </button>

            <div className="mt-4 flex items-center gap-2">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 rounded-xl bg-white py-2 text-sm font-semibold text-blue-600 shadow-sm hover:bg-slate-100 hover:text-blue-600"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Back
                </Button>
              ) : null}

              <Button
                type="button"
                onClick={() => {
                  if (step < paymentStep) {
                    setStep(step + 1);
                    return;
                  }
                  onOpenChange(false);
                }}
                disabled={!canGoNext}
                className="flex-1 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                {step < paymentStep ? (
                  <>
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>Pay Now</>
                )}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  </div>
</div>
      </DialogContent>

  {/* DateTime Modal - Add this after the closing </div> of the main content, before the sidebar */ }
  <Dialog open={isDateTimeModalOpen} onOpenChange={setIsDateTimeModalOpen}>
    <DialogContent className="max-h-[90vh] max-w-lg overflow-hidden rounded-3xl p-0 bg-white">
      <DialogHeader className="border-b border-slate-100 px-6 pb-4 pt-6">
        <DialogTitle className="text-2xl font-bold text-slate-900">
          Select Date & Time
        </DialogTitle>
        <p className="text-sm text-slate-500">
          Choose your preferred appointment slot
        </p>
      </DialogHeader>

      <div className="max-h-[calc(90vh-120px)] overflow-y-scroll scrollbar-thin px-6 pb-8">
        {/* Calendar */}
        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CalendarIcon className="h-4 w-4 text-blue-600" />
            <span>Select Date</span>
          </div>
          <div className="mt-3 flex justify-center rounded-2xl border border-slate-200 p-4 ">
            <Calendar
              mode="single"
              selected={tempSelectedDate || undefined}
              onSelect={(date) => setTempSelectedDate(date)}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              className="rounded-md bg-white hover:text-black text-black"
              classNames={{
                months:
                  "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                  "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-blue-50 rounded-full",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 rounded-full transition",
                day_selected:
                  "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
                day_today: "bg-slate-100 text-slate-900",
                day_outside: "text-slate-400 opacity-50",
                day_disabled: "text-slate-400 opacity-50",
                day_range_middle:
                  "aria-selected:bg-blue-50 aria-selected:text-slate-900",
                day_hidden: "invisible",
              }}
            />
          </div>
        </div>

        {/* Time Slots */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Select Time Slot</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
              <span>🍽️</span>
              <span>Lunch Break</span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {timeSlots.map((time) => {
              const isSelected = tempSelectedTime === time;
              const isDisabled =
                !tempSelectedDate ||
                time === "12:30 PM" ||
                time === "1:00 PM";
              const isLunchSlot = time === "12:30 PM" || time === "1:00 PM";

              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => !isDisabled && setTempSelectedTime(time)}
                  disabled={isDisabled}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : isDisabled
                        ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                        : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50",
                    isLunchSlot && !isSelected && "relative",
                  )}
                >
                  {time}
                  {isLunchSlot && !isSelected && (
                    <span className="absolute -top-1 -right-1 text-xs">
                      🍽️
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {!tempSelectedDate && (
            <p className="mt-3 text-center text-xs text-amber-600">
              Please select a date first
            </p>
          )}
          {tempSelectedDate && (
            <p className="mt-3 text-center text-xs text-slate-500">
              ⚠️ Lunch break: 12:30 PM - 1:00 PM (not available)
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setTempSelectedDate(selectedDate);
              setTempSelectedTime(selectedTime);
              setIsDateTimeModalOpen(false);
            }}
            className="flex-1 rounded-2xl border-slate-200 py-6 text-base font-semibold bg-white hover:bg-slate-100 hover:text-black text-black"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDateTimeConfirm}
            disabled={!tempSelectedDate || !tempSelectedTime}
            className="flex-1 rounded-2xl bg-blue-600 py-6 text-base font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 disabled:opacity-50"
          >
            Confirm
            <Check className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</Dialog>
  );
}
