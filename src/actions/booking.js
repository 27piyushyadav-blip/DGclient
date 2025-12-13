/*
 * File: src/actions/booking.js
 * SR-DEV: Secure Booking Logic (Server Actions)
 * ACTION: FIXED CRITICAL VALIDATION BUG (136) by comparing client's local time string against expert's schedule.
 */

"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Expert from "@/models/Expert";
import Appointment from "@/models/Appointment";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/nodemailer";
import { parseISO } from 'date-fns'; 
import { formatInTimeZone } from 'date-fns-tz'; 

// --- HELPER FUNCTIONS ---

/**
 * @name validateBookingRequest
 * @description Verifies availability, price, and logic before DB writes.
 * @param {Date} fullAppointmentDateTime - The canonical UTC Date object.
 * @param {string} clientLocalTimeString - The HH:MM string selected by the user. 
 * @param {number} duration - The duration of the service in minutes.
 */
async function validateBookingRequest(expertId, serviceName, type, fullAppointmentDateTime, duration, clientLocalTimeString) { // <-- MODIFIED SIGNATURE
  try {
    await connectToDatabase();
    
    // Day name derived from UTC date object (as per current schema validation flow)
    const dayName = formatInTimeZone(fullAppointmentDateTime, 'UTC', 'EEEE');
    
    // 1. Fetch Expert with relevant fields
    const expert = await Expert.findById(expertId).select(
      "name profilePicture services availability leaves specialization"
    );
    if (!expert) return { error: "Expert not found." };

    // 2. Validate Service & Price
    const service = expert.services.find((s) => s.name === serviceName);
    if (!service) return { error: "Service not found or no longer offered." };
    
    const price = type === "Video Call" ? service.videoPrice : service.clinicPrice;
    if (price === null || price === undefined) return { error: "This appointment type is not available." };

    // 3. Validate Date (Past check) - Compare against current UTC time
    if (fullAppointmentDateTime < new Date()) return { error: "Cannot book dates/times in the past." };

    // 4. Check Leaves 
    const isOnLeave = expert.leaves.some((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return fullAppointmentDateTime >= start && fullAppointmentDateTime <= end;
    });

    if (isOnLeave) return { error: "Expert is on leave during this date." };

    // 5. Check Availability Pattern (Day of Week & Time Window)
    const daySlot = expert.availability.find((slot) => slot.dayOfWeek === dayName);
    if (!daySlot) return { error: `${expert.name} is not available on ${dayName}s.` };

    const [startH, startM] = daySlot.startTime.split(':').map(Number);
    const [endH, endM] = daySlot.endTime.split(':').map(Number);
    
    // USE CLIENT LOCAL TIME STRING FOR COMPARISON (FIX)
    const [apptH, apptM] = clientLocalTimeString.split(':').map(Number); 
    
    const apptTimeInMins = apptH * 60 + apptM;
    const startTimeInMins = startH * 60 + startM;
    const endTimeInMins = endH * 60 + endM;

    // Check if appointment start time is within the window AND if the appointment END time is also within the window
    if (apptTimeInMins < startTimeInMins || (apptTimeInMins + duration) > endTimeInMins) {
      return { error: "Appointment time is outside the expert's declared window." };
    }
    
    // 6. Check for Double Booking (Database Query)
    const existingBooking = await Appointment.findOne({
        expertId,
        appointmentDate: fullAppointmentDateTime,
        status: { $in: ["confirmed", "pending"] },
    });

    if (existingBooking) return { error: "This slot was just booked by someone else." };

    // Success
    return {
      success: true,
      data: {
        expertUserId: expert.user,        // <-- ADD THIS
        expertName: expert.name,
        expertImage: expert.profilePicture,
        specialization: expert.specialization,
        serviceName: service.name,
        duration: service.duration,
        price: price,
        fullAppointmentDateTime,
        time: clientLocalTimeString,
      },
    };
  } catch (error) {
    console.error("Validate Error:", error);
    return { error: "Validation failed due to a server error." };
  }
}

// --- CLIENT-FACING ACTIONS ---

/**
 * @name createAppointmentAction
 */
export async function createAppointmentAction(bookingData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, message: "Authentication failed. Please log in." };
  }

  // --- FIX START: Parse duration to an integer ---
  // Ensure duration is a number to prevent string concatenation (e.g. "975" + "75" = "97575")
  const duration = parseInt(bookingData.duration, 10); 
  // --- FIX END ---

  const datePart = bookingData.date;        
  const timePart = bookingData.time;        
  const timeZone = bookingData.timezone;    

  // Construct the canonical time string by treating it as UTC for storage
  const combinedUTCTimeString = `${datePart}T${timePart}:00Z`;
  
  // Use parseISO to create the canonical UTC Date object
  const fullAppointmentDateTime = parseISO(combinedUTCTimeString); 
  
  // 1. Re-Validate - Pass the parsed number 'duration'
  const validation = await validateBookingRequest(
    bookingData.expertId,
    bookingData.serviceName,
    bookingData.type,
    fullAppointmentDateTime, 
    duration, // <--- CHANGED from bookingData.duration to duration
    bookingData.time 
  );

  if (validation.error) return { success: false, message: validation.error };

  const { data } = validation;

  try {
    await connectToDatabase();

    // 2. Create Appointment
    const newAppointment = await Appointment.create({
      userId: session.user.id,
      
      // FIXED MAPPING
      expertId: data.expertUserId,              // <-- Expert's User ID
      expertProfileId: bookingData.expertId,    // <-- ExpertProfile ID passed from UI
    
      appointmentDate: data.fullAppointmentDateTime,
      appointmentTime: bookingData.time,
    
      // Snapshot properties
      serviceName: data.serviceName,
      appointmentType: bookingData.type,
      duration: data.duration,
      price: data.price,
    
      status: "confirmed",
      paymentStatus: "paid",
    
      meetingLink:
        bookingData.type === "Video Call"
          ? `${process.env.APP_URL}/video-call/${Date.now()}`
          : null,
    });

    // 3. Send Confirmation Email (Async - don't block)
    // Format the canonical UTC date/time back into the user's selected timezone for email readability
    const formattedDate = formatInTimeZone(data.fullAppointmentDateTime, timeZone, 'EEEE, d MMMM');
    const formattedTime = formatInTimeZone(data.fullAppointmentDateTime, timeZone, 'hh:mm a zzzz');

    sendEmail({
      to: session.user.email,
      slug: "booking-confirmed",
      data: {
        name: session.user.name,
        expertName: data.expertName,
        serviceName: data.serviceName,
        date: formattedDate,
        time: formattedTime,
        type: bookingData.type,
        link: `${process.env.APP_URL}/appointments` 
      },
    });

    // 4. Revalidate & Return
    revalidatePath("/appointments");
    return { success: true, appointmentId: newAppointment._id.toString() };

  } catch (error) {
    console.error("CreateAction Error:", error);
    if (error.code === 11000) {
        return { success: false, message: "This slot was just booked by someone else." };
    }
    return { success: false, message: "Failed to create appointment." };
  }
}

/**
 * @name cancelAppointmentAction
 * @description Cancels a booking. Securely verifies ownership.
 */
export async function cancelAppointmentAction({ appointmentId, reason }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, message: "Unauthorized." };

  if (!appointmentId || !reason) return { success: false, message: "Missing details." };

  try {
    await connectToDatabase();

    // 1. Find & Verify Ownership
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      userId: session.user.id, // Security Check: User must own this appt
    }).populate('expertId', 'name');

    if (!appointment) return { success: false, message: "Appointment not found." };

    if (appointment.status === "cancelled") {
        return { success: false, message: "Appointment is already cancelled." };
    }

    // 2. Update Status
    appointment.status = "cancelled";
    appointment.paymentStatus = "refunded"; // Simulate refund
    appointment.cancellationReason = reason;
    appointment.cancelledBy = "user";
    await appointment.save();

    // 3. Send Cancellation Email
    const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric'
    });

    sendEmail({
      to: session.user.email,
      slug: "booking-cancelled",
      data: {
        name: session.user.name,
        expertName: appointment.expertId?.name || "Expert",
        date: formattedDate,
        time: appointment.appointmentTime,
        link: `${process.env.APP_URL}/experts` // Link to find new expert
      },
    });

    revalidatePath("/appointments");
    return { success: true, message: "Appointment cancelled." };

  } catch (error) {
    console.error("CancelAction Error:", error);
    return { success: false, message: "Cancellation failed." };
  }
}

// --- Private Helpers ---

function generateMeetingLink() {
  return `${process.env.APP_URL}/video-call/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}