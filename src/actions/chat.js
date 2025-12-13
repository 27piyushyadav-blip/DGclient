/*
 * File: src/actions/chat.js
 * FIXED for new User + ExpertProfile Architecture
 */

"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";

import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

import ExpertProfile from "@/models/ExpertProfile";  // NEW
import User from "@/models/User";                   // Identity model


/* -----------------------------------------------------
 * 1. Start or Return Conversation
 * ----------------------------------------------------- */
export async function findOrCreateConversation(expertProfileId) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, message: "Unauthorized" };

  try {
    await connectToDatabase();

    /* -----------------------------------------
     * Convert Profile ID → Expert User ID
     * ----------------------------------------- */
    let expertUserId = expertProfileId;

    const profile = await ExpertProfile.findById(expertProfileId).select("user");
    if (profile?.user) {
      expertUserId = profile.user.toString();
    }

    /* -----------------------------------------
     * Create or Return Conversation (User ↔ User)
     * ----------------------------------------- */
    const conversation = await Conversation.findOneAndUpdate(
      {
        userId: session.user.id,      // Client User ID
        expertId: expertUserId,       // Expert USER ID
      },
      {
        $setOnInsert: {
          userId: session.user.id,
          expertId: expertUserId,
          userUnreadCount: 0,
          expertUnreadCount: 0,
          isActive: true,
        },
      },
      { new: true, upsert: true }
    );

    return {
      success: true,
      conversationId: conversation._id.toString(),
    };
  } catch (err) {
    console.error("[ChatAction] Create Error:", err);
    return { success: false, message: "Failed to start chat." };
  }
}


/* -----------------------------------------------------
 * 2. Get Inbox List
 * ----------------------------------------------------- */
export async function getConversations() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  try {
    await connectToDatabase();

    // Fetch all conversations where current user is the client
    const conversations = await Conversation.find({
      userId: session.user.id,
    })
      .populate({
        path: "expertId",
        model: User, // FIXED: populate from the User model
        select: "name image isOnline lastSeen",
      })
      .sort({ lastMessageAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(conversations));
  } catch (err) {
    console.error("[ChatAction] GetConversations Error:", err);
    return [];
  }
}


/* -----------------------------------------------------
 * 3. Get Messages in a Conversation
 * ----------------------------------------------------- */
export async function getMessages(conversationId) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  try {
    await connectToDatabase();

    // Check ownership (security)
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: session.user.id,
    });

    if (!conversation) {
      console.warn(
        `[ChatAction] Unauthorized access attempt by ${session.user.id} to chat ${conversationId}`
      );
      return [];
    }

    // Fetch messages with reply context
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate({
        path: "replyTo",
        model: Message,
        select: "content contentType senderModel",
      })
      .lean();

    return JSON.parse(JSON.stringify(messages));
  } catch (err) {
    console.error("[ChatAction] GetMessages Error:", err);
    return [];
  }
}
