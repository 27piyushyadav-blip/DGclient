/*
 * File: src/models/Conversation.js
 * SR-DEV: Enhanced Conversation Schema for Premium Chat
 * Architecture: User ↔ User (Expert is a User with ExpertProfile)
 */

import mongoose, { Schema } from "mongoose";

const ConversationSchema = new Schema(
  {
    // -------------------- PARTICIPANTS --------------------
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expertId: {
      type: Schema.Types.ObjectId,
      ref: "User", // ✅ Expert is now also a User
      required: true,
      index: true,
    },

    // -------------------- PREVIEW / INBOX META --------------------
    lastMessage: {
      type: String,
      default: null,
      trim: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastMessageSender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lastMessageStatus: {
      type: String,
      enum: ["sending", "sent", "delivered", "read"],
      default: "sent",
    },

    // -------------------- UNREAD COUNTERS --------------------
    userUnreadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expertUnreadCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------- STATE --------------------
    isActive: {
      type: Boolean,
      default: true,
    },
    isArchivedByUser: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// -------------------- INDEXES --------------------

// One conversation per User–Expert pair
ConversationSchema.index(
  { userId: 1, expertId: 1 },
  { unique: true }
);

// Fast inbox sorting
ConversationSchema.index({ lastMessageAt: -1 });

export default mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);
