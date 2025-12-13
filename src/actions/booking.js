/*
 * File: src/actions/booking.js
 * FIXED: Migration to ExpertProfile + User architecture
 *       + Correct availability/leaves logic
 *       + Correct expertId / expertProfileId mapping
 */

"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";

import ExpertProfile from "@/models/ExpertProfile";   // FIXED: Use Profile instead of Expert
import User from "@/models/User";
import Appointment from "@/models/Appointment";

import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/nodemailer";
import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

/* -----------------------------------------------------
 * VALIDATION
 * ----------------------------------------------------- */
async function validateBookingRequest(
  expertProfileId,
  serviceName,
  type,
  fullAppointmentDateTime,
  duration,
  clientLocalTimeString
) {
  try {
    await connectToDatabase();

    // Extract day name (Mon, Tue...)
    const dayName = formatInTimeZone(fullAppointmentDateTime, "UTC", "EEEE");

    // 1. Fetch ExpertProfile + Linked User (identity)
    const expert = await ExpertProfile.findById(expertProfileId)
      .populate({
        path: "user",
        model: User,
        select: "name email image",
      })
      .lean();

    if (!expert || !expert.user)
      return { error: "Expert not found or unavailable." };

    // 2. Validate Service
    const service = expert.services?.find((s) => s.name === serviceName);
    if (!service) return { error: "Service not found." };

    const price =
      type === "Video Call" ? service.videoPrice : service.clinicPrice;

    if (price == null)
      return { error: "This appointment type is not available." };

    // 3. Reject Past Dates
    if (fullAppointmentDateTime < new Date())
      return { error: "Cannot book a past time." };

    // 4. Validate Leave Ranges
    const isOnLeave = expert.leaves?.some((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return (
        fullAppointmentDateTime.getTime() >= start.getTime() &&
        fullAppointmentDateTime.getTime() <= end.getTime()
      );
    });

    if (isOnLeave) return { error: "Expert is on leave on this date." };

    // 5. Validate Availability
    const slot = expert.availability?.find(
      (s) => s.dayOfWeek === dayName
    );

    if (!slot)
      return { error: `${expert.user.name} is not available on ${dayName}.` };

    const [startH, startM] = slot.startTime.split(":").map(Number);
    const [endH, endM] = slot.endTime.split(":").map(Number);

    const [apptH, apptM] = clientLocalTimeString.split(":").map(Number);

    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    const apptMin = apptH * 60 + apptM;
    const apptEndMin = apptMin + duration;

    if (apptMin < startMin || apptEndMin > endMin)
      return { error: "Selected time is outside availability window." };

    // 6. Prevent Double Booking
    const conflict = await Appointment.findOne({
      expertProfileId,
      appointmentDate: fullAppointmentDateTime,
      status: { $in: ["pending", "confirmed"] },
    });

    if (conflict) return { error: "This slot was just booked by someone else." };

    // SUCCESS
    return {
      success: true,
      data: {
        expertUserId: expert.user._id,
        expertProfileId,
        expertName: expert.user.name,
        expertImage: expert.user.image,
        serviceName: service.name,
        duration: service.duration,
        price,
        fullAppointmentDateTime,
        time: clientLocalTimeString,
      },
    };
  } catch (e) {
    console.error("VALIDATION ERROR:", e);
    return { error: "Server validation failed." };
  }
}

/* -----------------------------------------------------
 * CREATE APPOINTMENT
 * ----------------------------------------------------- */
export async function createAppointmentAction(bookingData) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return { success: false, message: "Authentication required." };

  await connectToDatabase();

  const duration = parseInt(bookingData.duration, 10);
  const fullAppointmentDateTime = parseISO(
    `${bookingData.date}T${bookingData.time}:00Z`
  );

  const validation = await validateBookingRequest(
    bookingData.expertId, // Profile ID from URL
    bookingData.serviceName,
    bookingData.type,
    fullAppointmentDateTime,
    duration,
    bookingData.time
  );

  if (validation.error)
    return { success: false, message: validation.error };

  const { data } = validation;

  try {
    const appt = await Appointment.create({
      userId: session.user.id,
      expertId: data.expertUserId, // USER ID (identity)
      expertProfileId: bookingData.expertId, // PROFILE ID

      appointmentDate: data.fullAppointmentDateTime,
      appointmentTime: bookingData.time,

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

    // EMAIL
    const formattedDate = formatInTimeZone(
      data.fullAppointmentDateTime,
      bookingData.timezone,
      "EEEE, d MMMM"
    );
    const formattedTime = formatInTimeZone(
      data.fullAppointmentDateTime,
      bookingData.timezone,
      "hh:mm a zzzz"
    );

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
        link: `${process.env.APP_URL}/appointments`,
      },
    });

    revalidatePath("/appointments");

    return { success: true, appointmentId: appt._id.toString() };
  } catch (e) {
    console.error("CREATE APPOINTMENT ERROR:", e);
    return { success: false, message: "Failed to create appointment." };
  }
}

/* -----------------------------------------------------
 * CANCEL APPOINTMENT
 * ----------------------------------------------------- */
export async function cancelAppointmentAction({ appointmentId, reason }) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return { success: false, message: "Unauthorized." };

  if (!appointmentId || !reason)
    return { success: false, message: "Missing details." };

  await connectToDatabase();

  const appt = await Appointment.findOne({
    _id: appointmentId,
    userId: session.user.id,
  }).populate("expertId", "name");

  if (!appt) return { success: false, message: "Appointment not found." };

  if (appt.status === "cancelled")
    return { success: false, message: "Already cancelled." };

  appt.status = "cancelled";
  appt.paymentStatus = "refunded";
  appt.cancellationReason = reason;
  appt.cancelledBy = "user";
  await appt.save();

  sendEmail({
    to: session.user.email,
    slug: "booking-cancelled",
    data: {
      name: session.user.name,
      expertName: appt.expertId?.name,
      date: appt.appointmentDate.toDateString(),
      time: appt.appointmentTime,
      link: `${process.env.APP_URL}/experts`,
    },
  });

  revalidatePath("/appointments");

  return { success: true, message: "Appointment cancelled." };
}
