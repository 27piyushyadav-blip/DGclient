/*
 * File: src/actions/booking.js
 * FINAL:
 * - ExpertProfile + User architecture
 * - Availability + leave validation
 * - Prevent double booking
 * - Secure video-call meetingId (crypto UUID)
 */

"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";

import ExpertProfile from "@/models/ExpertProfile";
import User from "@/models/User";
import Appointment from "@/models/Appointment";

import mongoose from "mongoose";
import { randomUUID } from "crypto";

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

    const dayName = formatInTimeZone(
      fullAppointmentDateTime,
      "UTC",
      "EEEE"
    );

    const expert = await ExpertProfile.findById(expertProfileId)
      .populate({
        path: "user",
        model: User,
        select: "name email image",
      })
      .lean();

    if (!expert || !expert.user) {
      return { error: "Expert not found or unavailable." };
    }

    const service = expert.services?.find(
      (s) => s.name === serviceName
    );
    if (!service) {
      return { error: "Service not found." };
    }

    const price =
      type === "Video Call"
        ? service.videoPrice
        : service.clinicPrice;

    if (price == null) {
      return { error: "This appointment type is not available." };
    }

    if (fullAppointmentDateTime < new Date()) {
      return { error: "Cannot book a past time." };
    }

    // Leave validation
    const isOnLeave = expert.leaves?.some((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return (
        fullAppointmentDateTime >= start &&
        fullAppointmentDateTime <= end
      );
    });

    if (isOnLeave) {
      return { error: "Expert is on leave on this date." };
    }

    // Availability validation
    const slot = expert.availability?.find(
      (s) => s.dayOfWeek === dayName
    );

    if (!slot) {
      return {
        error: `${expert.user.name} is not available on ${dayName}.`,
      };
    }

    const [startH, startM] = slot.startTime.split(":").map(Number);
    const [endH, endM] = slot.endTime.split(":").map(Number);
    const [apptH, apptM] = clientLocalTimeString.split(":").map(Number);

    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    const apptMin = apptH * 60 + apptM;
    const apptEndMin = apptMin + duration;

    if (apptMin < startMin || apptEndMin > endMin) {
      return {
        error: "Selected time is outside availability window.",
      };
    }

    // Double booking prevention
    const conflict = await Appointment.findOne({
      expertProfileId,
      appointmentDate: fullAppointmentDateTime,
      status: { $in: ["pending", "confirmed"] },
    });

    if (conflict) {
      return {
        error: "This slot was just booked by someone else.",
      };
    }

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
  } catch (err) {
    console.error("VALIDATION ERROR:", err);
    return { error: "Server validation failed." };
  }
}

/* -----------------------------------------------------
 * CREATE APPOINTMENT
 * ----------------------------------------------------- */
export async function createAppointmentAction(bookingData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, message: "Authentication required." };
  }

  await connectToDatabase();

  const duration = parseInt(bookingData.duration, 10);
  const fullAppointmentDateTime = parseISO(
    `${bookingData.date}T${bookingData.time}:00Z`
  );

  const validation = await validateBookingRequest(
    bookingData.expertId,
    bookingData.serviceName,
    bookingData.type,
    fullAppointmentDateTime,
    duration,
    bookingData.time
  );

  if (validation.error) {
    return { success: false, message: validation.error };
  }

  const { data } = validation;

  try {
    const appointmentId = new mongoose.Types.ObjectId();

    // Secure meeting ID for video calls
    const meetingId =
      bookingData.type === "Video Call"
        ? randomUUID()
        : undefined;

    const appt = await Appointment.create({
      _id: appointmentId,
      userId: session.user.id,
      expertId: data.expertUserId,
      expertProfileId: bookingData.expertId,

      appointmentDate: data.fullAppointmentDateTime,
      appointmentTime: bookingData.time,

      serviceName: data.serviceName,
      appointmentType: bookingData.type,
      duration: data.duration,
      price: data.price,

      status: "confirmed",
      paymentStatus: "paid",

      meetingId,
    });

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

    return {
      success: true,
      appointmentId: appt._id.toString(),
      meetingId,
    };
  } catch (err) {
    console.error("CREATE APPOINTMENT ERROR:", err);
    return { success: false, message: "Failed to create appointment." };
  }
}

/* -----------------------------------------------------
 * CANCEL APPOINTMENT
 * ----------------------------------------------------- */
export async function cancelAppointmentAction({
  appointmentId,
  reason,
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, message: "Unauthorized." };
  }

  if (!appointmentId || !reason) {
    return { success: false, message: "Missing details." };
  }

  await connectToDatabase();

  const appt = await Appointment.findOne({
    _id: appointmentId,
    userId: session.user.id,
  }).populate("expertId", "name");

  if (!appt) {
    return { success: false, message: "Appointment not found." };
  }

  if (appt.status === "cancelled") {
    return { success: false, message: "Already cancelled." };
  }

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
