/*
 * File: src/app/api/cron/reminders/route.js
 * FIXED FOR USER ↔ PROFILE SPLIT
 * - expertId now refers to User
 * - expertProfileId not needed here
 * - idempotent Redis check preserved
 * - correct 10-minute reminder logic preserved
 */

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { sendEmail } from "@/lib/nodemailer";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";

// Redis for idempotency
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();
    const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);

    // Allow +/- 1 day range to account for timezone shifts
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - 1);

    const dayEnd = new Date(now);
    dayEnd.setDate(dayEnd.getDate() + 1);

    // Fetch only confirmed appointments
    const appointments = await Appointment.find({
      status: "confirmed",
      appointmentDate: { $gte: dayStart, $lte: dayEnd }
    })
      .populate("userId", "name email")
      .populate("expertId", "name email"); // <-- NOW VALID (expertId = User)

    let sentCount = 0;

    for (const appt of appointments) {
      if (!appt.userId || !appt.expertId) continue;

      // Reconstruct full UTC datetime
      const [H, M] = appt.appointmentTime.split(":").map(Number);
      const fullDate = new Date(appt.appointmentDate);
      fullDate.setUTCHours(H, M, 0, 0);

      const diffMs = fullDate - now;
      const diffMins = diffMs / 1000 / 60;

      // Reminder window: 5–15 minutes before the session
      if (diffMins < 5 || diffMins > 15) continue;

      // Idempotency check: Skip if already sent
      const redisKey = `reminder:${appt._id}`;
      const alreadySent = await redis.get(redisKey);
      if (alreadySent) continue;

      // Send client reminder
      await sendEmail({
        to: appt.userId.email,
        slug: "session-reminder",
        data: {
          name: appt.userId.name,
          expertName: appt.expertId.name,
          time: appt.appointmentTime,
          link: appt.meetingLink || `${process.env.APP_URL}/appointments`
        }
      });

      // Send expert reminder
      await sendEmail({
        to: appt.expertId.email,
        slug: "session-reminder-expert",
        data: {
          name: appt.expertId.name,
          clientName: appt.userId.name,
          time: appt.appointmentTime,
          link: appt.meetingLink || `${process.env.APP_URL}/appointments`
        }
      });

      // Mark as sent (expires in 24 hours)
      await redis.set(redisKey, "sent", { ex: 86400 });
      sentCount++;
    }

    return NextResponse.json({
      success: true,
      totalAppointments: appointments.length,
      remindersSent: sentCount,
    });

  } catch (error) {
    console.error("[Cron Reminder Error]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
