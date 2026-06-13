"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";

import type { Venue, VenueService, VenueStaff } from "@/app/main/data";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { createBookingApi } from "@/lib/bookingsApi";

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

  const isServiceFirstFlow = bookingFlow === "service-first";
  const serviceStep = isServiceFirstFlow ? 1 : 2;
  const staffStep = isServiceFirstFlow ? 2 : 1;
  const paymentStep = 3;

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
      if (selectedStaff.services && Array.isArray(selectedStaff.services) && selectedStaff.services.length > 0) {
        return selectedStaff.services.some(
          (item: any) => item.name?.toLowerCase() === service.name.toLowerCase(),
        );
      }
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
      (step === paymentStep &&
        selectedService &&
        selectedStaff &&
        selectedDate &&
        selectedTime &&
        selectedPaymentMethod),
  );

  const bookingSummary = [
    { label: "Service", value: selectedService?.name ?? "Select a service" },
    { label: "Therapist", value: selectedStaff?.name ?? "Select a therapist" },
    {
      label: "Date & Time",
      value:
        selectedDate && selectedTime
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
        duration: 60,
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
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600">
              Mobile booking
            </p>
            <h1 className="truncate text-base font-bold text-slate-900">
              {venue.name}
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col px-4 pb-28 pt-4">
        {/* <section className="overflow-hidden rounded-[28px] bg-slate-900 text-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.55)]">
          <div
            className="relative min-h-[220px] bg-cover bg-center"
            style={{
              backgroundImage: `url('${venueBannerUrl || venue.bgImage?.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "") || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop"}')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/10" />
            <div className="relative flex h-full min-h-[220px] flex-col justify-end p-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium backdrop-blur-md">
                <Clock className="h-3.5 w-3.5" />
                Secure mobile booking
              </div>
              <h2 className="mt-3 text-2xl font-bold leading-tight">{venue.name}</h2>
              <p className="mt-1 max-w-[26rem] text-sm text-white/80">{venue.tagline}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-white/85">
                <MapPin className="h-3.5 w-3.5 text-blue-300" />
                <span className="truncate">{venue.address}</span>
              </div>
              <div className="mt-2 text-xs text-white/70">{venue.hours}</div>
            </div>
          </div>
        </section> */}

        <section className="mt-4 rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Step {step} of 3
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {step === serviceStep
                  ? isServiceFirstFlow
                    ? "Choose a service"
                    : "Choose a therapist"
                  : step === staffStep
                    ? isServiceFirstFlow
                      ? "Choose a therapist"
                      : "Choose a service"
                    : "Review and pay"}
              </h2>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              Fast checkout
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={cn(
                  "h-2 flex-1 rounded-full transition",
                  step >= item ? "bg-blue-600" : "bg-slate-200",
                )}
              />
            ))}
          </div>
        </section>

        {step === serviceStep ? (
          <section className="mt-4 rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Select a service</h3>
            <p className="mt-1 text-sm text-slate-500">Pick the treatment you want to book.</p>
            <div className="mt-4 grid gap-3">
              {filteredServices.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
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
                      onClick={() => setSelectedService(service)}
                      className={cn(
                        "flex items-center gap-3 rounded-[22px] border p-3 text-left transition",
                        isSelected
                          ? "border-blue-600 bg-blue-50/70"
                          : "border-slate-200 hover:border-blue-300",
                      )}
                    >
                      <div
                        className="h-10 w-10 shrink-0 rounded-lg bg-cover bg-center"
                        style={{ backgroundImage: `url('${service.image}')` }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900 text-xs">{service.name}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{duration} min</p>
                          </div>
                          <div
                            className={cn(
                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 text-transparent",
                            )}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        </div>
                        <p className="mt-2 font-bold text-blue-600 text-xs">{service.price}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>
        ) : null}

        {step === staffStep ? (
          <section className="mt-4 rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Select a therapist</h3>
            <p className="mt-1 text-sm text-slate-500">
              Choose the person who will handle your appointment.
            </p>
            <div className="mt-4 grid gap-3">
              {filteredStaff.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                  No therapists available.
                </div>
              ) : (
                filteredStaff.map((member: any) => {
                  const isSelected =
                    selectedStaff?.id === member.id || selectedStaff?.name === member.name;

                  return (
                    <button
                      key={member.id || member.name}
                      type="button"
                      onClick={() => setSelectedStaff(member)}
                      className={cn(
                        "flex items-center gap-3 rounded-[22px] border p-3 text-left transition",
                        isSelected
                          ? "border-blue-600 bg-blue-50/70"
                          : "border-slate-200 hover:border-blue-300",
                      )}
                    >
                      <div
                        className="h-10 w-10 shrink-0 rounded-lg bg-cover bg-center"
                        style={{ backgroundImage: `url('${member.image}')` }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900 text-sm">{member.name}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{member.role}</p>
                          </div>
                          <div
                            className={cn(
                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 text-transparent",
                            )}
                          >
                            <Check className="h-3.5 w-3.5" />
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

        {step === paymentStep ? (
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
          </>
        ) : null}

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

        {/* <section className="mt-4 rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Why book here</p>
          <div className="mt-3 space-y-2">
            {trustPoints.map((point) => (
              <div key={point} className="flex items-center gap-2 text-sm text-slate-600">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </section> */}

        {bookingError ? (
          <section className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {bookingError}
          </section>
        ) : null}
      </main>

      <footer className="sticky bottom-15 z-20 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl gap-3">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="h-12 flex-1 rounded-2xl border-slate-200 bg-white text-sm font-semibold text-blue-600"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          ) : null}

          <Button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext || isCreatingBooking}
            className="h-12 flex-1 rounded-2xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700"
          >
            {step < paymentStep ? (
              <>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            ) : isCreatingBooking ? (
              "Processing..."
            ) : (
              <>
                Pay & Book
                <CalendarDays className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
