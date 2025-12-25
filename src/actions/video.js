/*
 * File: src/actions/video.js
 * SR-DEV: Server Action for video session logic.
 * Primary Use: Saving the final state of the collaborative whiteboard.
 */

"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Appointment from "@/models/Appointment";
import { revalidatePath } from "next/cache";

/**
 * @name saveWhiteboardData
 * @description Securely saves the final whiteboard content/URL to the appointment.
 * * @param {string} appointmentId - The ID of the current session.
 * @param {string} whiteboardUrl - The final URL of the saved whiteboard image/data.
 */
export async function saveWhiteboardData(appointmentId, whiteboardUrl) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return { success: false, message: "Authentication required." };
  }
  
  if (!appointmentId || !whiteboardUrl) {
    return { success: false, message: "Missing appointment ID or data." };
  }
  
  try {
    await connectToDatabase();

    // 1. Find and Verify Ownership
    // Security Check: Ensure the user is either the User or the Expert for this appointment.
    const appointment = await Appointment.findOne({
        _id: appointmentId,
        $or: [{ userId: session.user.id }, { expertId: session.user.id }]
    });

    if (!appointment) {
        return { success: false, message: "Appointment not found or unauthorized." };
    }

    // 2. Update the record
    appointment.whiteboardUrl = whiteboardUrl;
    // Optionally set status to 'completed' here if this action marks the end of the session.
    // appointment.status = 'completed'; 
    await appointment.save();

    // 3. Revalidate the appointments page to show the new 'Download Notes' button
    revalidatePath("/appointments");

    return { success: true, message: "Whiteboard data saved successfully." };

  } catch (error) {
    console.error("[SaveWhiteboardData] Error:", error);
    return { success: false, message: "Failed to save whiteboard data." };
  }
}


/**
 * @name getMeetingSession
 * @description Fetches appointment details by meetingId to display actual names/images.
 */
export async function getMeetingSession(meetingId) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, message: "Unauthorized" };

  try {
    await connectToDatabase();

    // Find and populate participants
    const appt = await Appointment.findOne({ meetingId })
      .populate("userId", "name image")
      .populate("expertId", "name image")
      .lean();

    if (!appt) return { success: false, message: "Meeting not found." };

    const isExpert = session.user.id === appt.expertId._id.toString();
    
    // Prepare the response data
    const responseData = {
      success: true,
      data: {
        me: isExpert ? appt.expertId : appt.userId,
        other: isExpert ? appt.userId : appt.expertId,
        appointmentId: appt._id.toString(),
      }
    };

    // CRITICAL: Convert ObjectIds and Dates to plain strings to avoid hydration/serialization errors
    return JSON.parse(JSON.stringify(responseData));

  } catch (error) {
    console.error("Fetch Meeting Error:", error);
    return { success: false, message: "Failed to load session data." };
  }
}