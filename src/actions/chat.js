/*
 * File: src/actions/chat.js
 * FIXED: Robust manual serialization to prevent
 * "Only plain objects can be passed to Client Components"
 *
 * Key Fixes:
 * - Explicit ObjectId → string conversion
 * - Safe date serialization
 * - replyTo population hardened
 * - User.image → profilePicture mapping preserved
 */

"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";

import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import ExpertProfile from "@/models/ExpertProfile";
import User from "@/models/User";

/* -----------------------------------------------------
 * 1. Start or Return Conversation
 * ----------------------------------------------------- */
export async function findOrCreateConversation(expertProfileId) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await connectToDatabase();

    // Resolve ExpertProfile → User ID
    let expertUserId = expertProfileId;
    const profile = await ExpertProfile.findById(expertProfileId).select("user");

    if (profile?.user) {
      expertUserId = profile.user.toString();
    }

    const conversation = await Conversation.findOneAndUpdate(
      {
        userId: session.user.id,
        expertId: expertUserId,
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
    console.error("[ChatAction] findOrCreateConversation:", err);
    return { success: false, message: "Failed to start chat." };
  }
}

/* -----------------------------------------------------
 * 2. Get Inbox Conversations
 * ----------------------------------------------------- */
export async function getConversations() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  try {
    await connectToDatabase();

    const conversations = await Conversation.find({
      userId: session.user.id,
    })
      .populate({
        path: "expertId",
        model: User,
        select: "name image isOnline lastSeen",
      })
      .sort({ lastMessageAt: -1 })
      .lean();


      // Fetch ExpertProfile IDs for all experts in the inbox
    const expertUserIds = conversations.map(c => c.expertId?._id).filter(Boolean);
    const profiles = await ExpertProfile.find({ user: { $in: expertUserIds } }).select("_id user").lean();
    
    // Create a map of User ID -> Expert Profile ID
    const profileMap = profiles.reduce((acc, p) => {
      acc[p.user.toString()] = p._id.toString();
      return acc;
    }, {});

    // Manual Serialization (critical for RSC safety)
    const plain = conversations.map((c) => ({
      ...c,
      _id: c._id.toString(),
      userId: c.userId.toString(),
      expertProfileId: c.expertId ? profileMap[c.expertId._id.toString()] : null, // ✅ Added Profile ID
      expertId: c.expertId
        ? {
            ...c.expertId,
            _id: c.expertId._id.toString(),
            profilePicture: c.expertId.image, // frontend compatibility
          }
        : null,
      lastMessageSender: c.lastMessageSender
        ? c.lastMessageSender.toString()
        : null,
      lastMessageAt: c.lastMessageAt
        ? new Date(c.lastMessageAt).toISOString()
        : null,
      createdAt: c.createdAt
        ? new Date(c.createdAt).toISOString()
        : null,
      updatedAt: c.updatedAt
        ? new Date(c.updatedAt).toISOString()
        : null,
    }));

    return JSON.parse(JSON.stringify(plain));
  } catch (err) {
    console.error("[ChatAction] getConversations:", err);
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

    // Ownership check
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: session.user.id,
    });

    if (!conversation) return [];

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate({
        path: "replyTo",
        model: Message,
        select: "content contentType senderModel",
      })
      .lean();

    // Manual Serialization (fixes ObjectId buffer issue)
    const plain = messages.map((m) => ({
      ...m,
      _id: m._id.toString(),
      conversationId: m.conversationId.toString(),
      sender: m.sender ? m.sender.toString() : null,
      replyTo: m.replyTo
        ? {
            ...m.replyTo,
            _id: m.replyTo._id.toString(),
          }
        : null,
      readBy: Array.isArray(m.readBy)
        ? m.readBy.map((id) => id.toString())
        : [],
      createdAt: m.createdAt
        ? new Date(m.createdAt).toISOString()
        : null,
      updatedAt: m.updatedAt
        ? new Date(m.updatedAt).toISOString()
        : null,
    }));

    return JSON.parse(JSON.stringify(plain));
  } catch (err) {
    console.error("[ChatAction] getMessages:", err);
    return [];
  }
}


/* -----------------------------------------------------
 * 4. Get Single Conversation (For Real-time Updates)
 * ----------------------------------------------------- */
export async function getConversationById(conversationId) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  try {
    await connectToDatabase();

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: session.user.id, // ✅ USER ownership check
    })
      .populate({
        path: "expertId",
        model: User,
        select: "name image isOnline lastSeen",
      })
      .lean();

    if (!conversation) return null;

    // Fetch the specific profile for this expert
    const profile = await ExpertProfile.findOne({ user: conversation.expertId?._id }).select("_id").lean();

    return JSON.parse(
      JSON.stringify({
        ...conversation,
        _id: conversation._id.toString(),
        userId: conversation.userId.toString(),
        expertProfileId: profile ? profile._id.toString() : null, // ✅ Added Profile ID
        expertId: conversation.expertId
          ? {
              ...conversation.expertId,
              _id: conversation.expertId._id.toString(),
              profilePicture: conversation.expertId.image,
            }
          : null,
        lastMessageSender: conversation.lastMessageSender
          ? conversation.lastMessageSender.toString()
          : null,
        lastMessageAt: conversation.lastMessageAt
          ? new Date(conversation.lastMessageAt).toISOString()
          : null,
        createdAt: conversation.createdAt
          ? new Date(conversation.createdAt).toISOString()
          : null,
        updatedAt: conversation.updatedAt
          ? new Date(conversation.updatedAt).toISOString()
          : null,
      })
    );
  } catch (err) {
    console.error("[ChatAction] getConversationById:", err);
    return null;
  }
}
