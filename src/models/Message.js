/*
 * File: src/models/Message.js
 * SR-DEV: Enhanced Message Schema for Audio/Files/Replies
 */

import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    
    // Polymorphic Sender (User or Expert)
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "senderModel",
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["User", "Expert"], // Expert refers to the User role 'expert'
    },

    // Rich Content
    content: {
      type: String,
      required: true,
      trim: true,
    },
    contentType: {
      type: String,
      enum: ["text", "image", "audio", "pdf"],
      default: "text",
    },
    
    // Features
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    
    readBy: [{
      type: Schema.Types.ObjectId,
    }],

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    minimize: true,
  }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);