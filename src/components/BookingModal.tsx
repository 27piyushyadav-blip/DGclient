/*
 * File: src/components/BookingModal.js
 * SR-DEV: 3-Step Booking Wizard
 * ACTION: FIXED Date Serialization Bug & Removed Platform Fee (137).
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  addMonths, 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isBefore, 
  startOfToday,
  parse,
  isToday
} from "date-fns";
import { Button } from "@/components/ui/button";
import ProfileImage from "@/components/ProfileImage";
import { cn } from "@/lib/utils";
import TimezoneSelect from "@/components/TimezoneSelect";

// --- ICONS ---
import { 
  X, ChevronLeft, ChevronRight, Video, Building2, 
  Calendar as CalendarIcon, Clock, CheckCircle2, Tag 
} from "lucide-react";

// --- HELPER: Time Slot Generator ---
const generateTimeSlots = (availability: any, selectedDate: Date, duration: number): string[] => {
  if (!selectedDate || !duration || !availability) return [];

  const dayName = format(selectedDate, 'EEEE'); // "Monday", "Tuesday"...
  const daySlots = availability.filter(slot => slot.dayOfWeek === dayName);

  if (daySlots.length === 0) return [];

  const slots: string[] = [];
  
  daySlots.forEach(window => {
    // Parse start/end times (e.g., "09:00")
    // We use an arbitrary date (today) to perform time calculations
    const start = parse(window.startTime, 'HH:mm', new Date());
    const end = parse(window.endTime, 'HH:mm', new Date());
    
    let current = start;
    
    // Loop until we fit the last slot
    // We need current + duration <= end
    while (true) {
      const nextSlot = new Date(current.getTime() + duration * 60000);
      if (nextSlot > end) break;

      // Filter out slots that are in the past today
      if (isToday(selectedDate) && current <= new Date()) {
          current = nextSlot;
          continue;
      }

      slots.push(format(current, 'HH:mm'));
      current = nextSlot;
    }
  });

  return slots.sort();
};

// --- INTERNAL COMPONENT: Mini Calendar ---
const MiniCalendar = ({ selectedDate, onSelect, availability }: { 
  selectedDate: Date | null; 
  onSelect: (date: Date) => void; 
  availability: any[]; 
}) => {
  const [currentMonth, setCurrentMonth] = useState(startOfToday());
  const today = startOfToday();

  // Get all available days from the expert's schedule (e.g., ["Monday", "Wednesday"])
  const availableDaysSet = useMemo(() => 
    new Set(availability.map(a => a.dayOfWeek)), 
  [availability]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));

  // Limit booking to 3 months in advance
  const maxDate = addMonths(today, 3);

  return (
    <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-1">
          <button 
            onClick={prevMonth} 
            disabled={isSameMonth(currentMonth, today)}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={nextMonth} 
            disabled={isSameMonth(currentMonth, maxDate)}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {['S','M','T','W','T','F','S'].map((d,i) => (
          <span key={i} className="text-zinc-400 font-medium">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm">
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isPast = isBefore(day, today);
          const dayName = format(day, 'EEEE');
          const isAvailableDay = availableDaysSet.has(dayName);
          
          const isUnselectable = !isCurrentMonth || isPast || !isAvailableDay;
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={i}
              onClick={() => !isUnselectable && onSelect(day)}
              disabled={isUnselectable}
              className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center transition-all relative",
                !isCurrentMonth && "invisible", // Hide days from other months for cleaner look
                isUnselectable && isCurrentMonth && "text-zinc-300 dark:text-zinc-700 cursor-not-allowed decoration-zinc-300 line-through decoration-1",
                !isUnselectable && "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium",
                isSelected && "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 font-bold shadow-md"
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function BookingModal({ expert, onClose }: { expert: any; onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Step 1 Data
  const [selectedService, setSelectedService] = useState<any>(null);
  const [appointmentType, setAppointmentType] = useState<"Video Call" | "Clinic Visit" | null>(null); // "Video Call" | "Clinic Visit"

  // Step 2 Data
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);

  // Initialize default service (lowest price logic)
  useEffect(() => {
    if (expert.services?.length > 0 && !selectedService) {
      const cheapest = expert.services.reduce((prev, curr) => {
        const prevMin = Math.min(prev.videoPrice ?? Infinity, prev.clinicPrice ?? Infinity);
        const currMin = Math.min(curr.videoPrice ?? Infinity, curr.clinicPrice ?? Infinity);
        return currMin < prevMin ? curr : prev;
      }, expert.services[0]);
      
      setSelectedService(cheapest);
      
      // Auto-select type based on availability
      if (cheapest.videoPrice != null) setAppointmentType("Video Call");
      else if (cheapest.clinicPrice != null) setAppointmentType("Clinic Visit");
    }
  }, [expert, selectedService]);

  // Update slots when date changes
  useEffect(() => {
    if (selectedDate && selectedService) {
      setSlots(generateTimeSlots(expert.availability, selectedDate, selectedService.duration));
      setSelectedTime(null); // Reset time when date changes
    }
  }, [selectedDate, selectedService, expert.availability]);

  // Handler for MiniCalendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleNext = () => {
    if (step === 1 && selectedService && appointmentType) setStep(2);
    // UPDATED STEP 2 CHECK: Requires selectedTime and selectedTimezone
    else if (step === 2 && selectedDate && selectedTime && selectedTimezone) setStep(3);
    else if (step === 3) handleConfirm();
  };

  const handleConfirm = () => {
    if (!selectedService || !appointmentType) return;
    
    const price = appointmentType === "Video Call" ? selectedService.videoPrice : selectedService.clinicPrice;
    
    // CRITICAL FIX: Pass date as ISO string (with date component only)
    const dateOnlyISO = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;

    const params = new URLSearchParams({
      expertId: expert._id,
      expertName: expert.name,
      expertImage: expert.profilePicture || "",
      serviceName: selectedService.name,
      type: appointmentType || "",
      duration: selectedService.duration,
      price: price,
      date: dateOnlyISO || "", // Pass clean date string
      time: selectedTime || "",
      timezone: selectedTimezone || "",
    });
    
    router.push(`/checkout?${params.toString()}`);
  };

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] animate-in zoom-in-95 duration-300 border border-zinc-200 dark:border-zinc-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-10">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Book Appointment</h2>
            <p className="text-xs text-zinc-500">Step {step} of 3</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            
            {/* STEP 1: Service & Type (Unchanged) */}
            {step === 1 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">1. Select Service</label>
                  <div className="grid gap-3">
                    {expert.services.map((s) => (
                      <div 
                        key={s.name}
                        onClick={() => {
                          setSelectedService(s);
                          if (appointmentType === "Video Call" && s.videoPrice == null) setAppointmentType("Clinic Visit");
                          if (appointmentType === "Clinic Visit" && s.clinicPrice == null) setAppointmentType("Video Call");
                        }}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                          selectedService?.name === s.name 
                            ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900" 
                            : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                        )}
                      >
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">{s.name}</p>
                          <p className="text-sm text-zinc-500">{s.duration} minutes</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-zinc-900 dark:text-white">
                            From ₹{Math.min(s.videoPrice ?? Infinity, s.clinicPrice ?? Infinity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedService && (
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">2. Select Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        disabled={selectedService.videoPrice == null}
                        onClick={() => setAppointmentType("Video Call")}
                        className={cn(
                          "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all gap-3",
                          selectedService.videoPrice == null ? "opacity-50 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900" : "cursor-pointer",
                          appointmentType === "Video Call" 
                            ? "border-zinc-900 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:border-white shadow-md scale-[1.02]" 
                            : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                        )}
                      >
                        <Video className="w-6 h-6" />
                        <div className="text-center">
                          <p className="font-bold text-sm">Video Call</p>
                          {selectedService.videoPrice != null && <p className="text-xs opacity-80">₹{selectedService.videoPrice}</p>}
                        </div>
                      </button>

                      <button
                        disabled={selectedService.clinicPrice == null}
                        onClick={() => setAppointmentType("Clinic Visit")}
                        className={cn(
                          "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all gap-3",
                          selectedService.clinicPrice == null ? "opacity-50 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900" : "cursor-pointer",
                          appointmentType === "Clinic Visit" 
                            ? "border-zinc-900 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:border-white shadow-md scale-[1.02]" 
                            : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                        )}
                      >
                        <Building2 className="w-6 h-6" />
                        <div className="text-center">
                          <p className="font-bold text-sm">Clinic Visit</p>
                          {selectedService.clinicPrice != null && <p className="text-xs opacity-80">₹{selectedService.clinicPrice}</p>}
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Date & Time */}
            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full animate-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col h-full">
                   <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3">Select Date</label>
                   <MiniCalendar 
                     selectedDate={selectedDate} 
                     onSelect={handleDateSelect} 
                     availability={expert.availability}
                   />
                </div>

                <div className="flex flex-col h-full space-y-6">
                   
                   {/* Timezone Select */}
                   <TimezoneSelect defaultValue={""} onSelect={setSelectedTimezone} className="" />

                   <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3">Select Time</label>
                   
                   {!selectedDate ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 bg-zinc-50/50 dark:bg-zinc-900/50">
                       <CalendarIcon className="w-10 h-10 mb-2 opacity-50" />
                       <p className="text-sm">Please select a date first</p>
                     </div>
                   ) : slots.length === 0 ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 bg-zinc-50/50 dark:bg-zinc-900/50">
                       <Clock className="w-10 h-10 mb-2 opacity-50" />
                       <p className="text-sm">No available slots on this day.</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-3 gap-3 content-start">
                       {slots.map(time => (
                         <button
                           key={time}
                           onClick={() => setSelectedTime(time)}
                           className={cn(
                             "py-2 px-3 rounded-lg text-sm font-medium border transition-all",
                             selectedTime === time 
                               ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900"
                               : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 text-zinc-700 dark:text-zinc-300"
                           )}
                         >
                           {time}
                         </button>
                       ))}
                     </div>
                   )}
                </div>
              </div>
            )}

            {/* STEP 3: Confirm (Removed Platform Fee) */}
            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
                
                {/* Summary Card (Unchanged) */}
                <div className="space-y-6">
                   <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                      <ProfileImage src={expert.profilePicture} name={expert.name} sizeClass="w-14 h-14" className="rounded-lg" />
                      <div>
                         <p className="text-xs text-zinc-500">Booking with</p>
                         <h3 className="font-bold text-zinc-900 dark:text-white text-lg">{expert.name}</h3>
                         <p className="text-xs text-primary font-medium">{expert.specialization}</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex gap-4">
                         <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0">
                            <Tag className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-xs text-zinc-500">Service</p>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{selectedService.name}</p>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 shrink-0">
                            {appointmentType === "Video Call" ? <Video className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                         </div>
                         <div>
                            <p className="text-xs text-zinc-500">Type</p>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{appointmentType}</p>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 shrink-0">
                            <CalendarIcon className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-xs text-zinc-500">Date & Time</p>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">
                              {selectedDate ? format(selectedDate, 'EEEE, d MMMM') : 'No date selected'} at {selectedTime || 'No time selected'}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                               Timezone: {selectedTimezone}
                            </p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Price Breakdown (Removed Platform Fee) */}
                <div className="flex flex-col justify-center">
                   <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg">
                      <h3 className="font-bold text-lg mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">Payment Summary</h3>
                      <div className="flex justify-between items-center mb-6 text-sm">
                         <span className="text-zinc-500">{selectedService.name}</span>
                         <span className="font-medium">₹{appointmentType === "Video Call" ? selectedService.videoPrice : selectedService.clinicPrice}</span>
                      </div>
                      
                      {/* PLATFORM FEE REMOVED */}
                      
                      <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
                         <span className="font-bold text-lg">Total</span>
                         <span className="font-bold text-2xl text-zinc-900 dark:text-white">
                           ₹{appointmentType === "Video Call" ? selectedService.videoPrice : selectedService.clinicPrice}
                         </span>
                      </div>
                   </div>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* Footer Actions (Unchanged) */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex justify-between items-center">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)} className="gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          ) : (
            <div /> // Spacer
          )}

          <Button 
            size="lg"
            onClick={handleNext} 
            disabled={
              (step === 1 && (!selectedService || !appointmentType)) ||
              (step === 2 && (!selectedDate || !selectedTime || !selectedTimezone))
            }
            className={cn(
              "min-w-[140px] shadow-lg transition-all",
              step === 3 ? "bg-green-600 hover:bg-green-700 text-white" : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            )}
          >
            {step === 3 ? (
              <span className="flex items-center gap-2">Confirm & Pay <CheckCircle2 className="w-4 h-4" /></span>
            ) : (
              <span className="flex items-center gap-2">Next Step <ChevronRight className="w-4 h-4" /></span>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}