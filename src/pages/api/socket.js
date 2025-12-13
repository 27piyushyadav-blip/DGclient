/*
 * File: src/pages/api/socket.js
 * Updated for new architecture (User + ExpertProfile)
 */

import { Server } from "socket.io";
import { connectToDatabase } from "@/lib/db";

import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";
import ExpertProfile from "@/models/ExpertProfile"; // NEW — replaces old Expert model

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req, res) => {

  if (!res.socket.server.io) {
    console.log("🚀 Starting Socket.io Server…");

    const io = new Server(res.socket.server, {
      path: "/api/socket_io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", async (socket) => {
      /* -------------------------------------------------------
       * 1. USER ONLINE STATUS HANDLING
       * ------------------------------------------------------- */
      const { userId, role } = socket.handshake.query;

      if (userId) {
        socket.join(userId); // Join personal room by USER ID

        try {
          await connectToDatabase();

          if (role === "expert") {
            // ExpertProfile stores status
            await ExpertProfile.findOneAndUpdate(
              { user: userId },
              { isOnline: true, lastSeen: new Date() }
            );
          } else {
            // Normal user online logic (if using UserProfile)
            await User.findByIdAndUpdate(userId, {
              isOnline: true,
              lastSeen: new Date(),
            });
          }

          socket.broadcast.emit("userStatusChanged", {
            userId,
            isOnline: true,
            lastSeen: new Date(),
          });
        } catch (err) {
          console.error("Online Status Error:", err);
        }
      }

      /* -------------------------------------------------------
       * 2. JOIN CHAT ROOM (conversationId)
       * ------------------------------------------------------- */
      socket.on("joinRoom", (conversationId) => {
        socket.join(conversationId);
      });

      /* -------------------------------------------------------
       * 3. SEND MESSAGE
       * ------------------------------------------------------- */
      socket.on("sendMessage", async (data) => {
        const {
          conversationId,
          senderId,
          receiverId,
          senderModel,
          content,
          contentType,
          replyTo,
        } = data;

        if (!conversationId || !senderId || !content) return;

        try {
          await connectToDatabase();

          // Save message
          const msg = await Message.create({
            conversationId,
            sender: senderId,
            senderModel,
            content,
            contentType: contentType || "text",
            replyTo: replyTo || null,
            readBy: [senderId],
          });

          const populated = await Message.findById(msg._id)
            .populate("replyTo")
            .lean();

          // Preview text for left inbox
          let preview = content;
          if (contentType === "image") preview = "📷 Image";
          else if (contentType === "audio") preview = "🎤 Audio Message";
          else if (contentType === "pdf") preview = "📄 Document";

          // Determine who should receive unread increment
          const isSenderUser = senderModel === "User";

          await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: preview,
            lastMessageAt: populated.createdAt,
            lastMessageSender: senderId,
            $inc: {
              userUnreadCount: isSenderUser ? 0 : 1,
              expertUnreadCount: isSenderUser ? 1 : 0,
            },
          });

          // Emit to room (conversation)
          io.to(conversationId).emit("receiveMessage", populated);

          // Update conversation list UI
          io.to(conversationId).emit("conversationUpdated", {
            conversationId,
            lastMessage: preview,
            lastMessageAt: populated.createdAt,
            lastMessageSender: senderId,
          });

          // Deliver message to the receiver's UserID room
          io.to(receiverId).emit("receiveDirectMessage", populated);
        } catch (err) {
          console.error("sendMessage Error:", err);
        }
      });

      /* -------------------------------------------------------
       * 4. MARK AS READ
       * ------------------------------------------------------- */
      socket.on("markAsRead", async ({ conversationId, userId }) => {
        if (!conversationId || !userId) return;

        try {
          await connectToDatabase();

          await Message.updateMany(
            {
              conversationId,
              sender: { $ne: userId },
              readBy: { $ne: userId },
            },
            { $addToSet: { readBy: userId } }
          );

          const conv = await Conversation.findById(conversationId);
          if (conv) {
            const isUser = userId.toString() === conv.userId.toString();
            await Conversation.findByIdAndUpdate(conversationId, {
              [isUser ? "userUnreadCount" : "expertUnreadCount"]: 0,
            });
          }

          io.to(conversationId).emit("messagesRead", {
            conversationId,
            readByUserId: userId,
          });
        } catch (err) {
          console.error("markAsRead Error:", err);
        }
      });

      /* -------------------------------------------------------
       * 5. TYPING INDICATORS
       * ------------------------------------------------------- */
      socket.on("typing", (d) => socket.to(d.conversationId).emit("typing", d));
      socket.on("stopTyping", (d) =>
        socket.to(d.conversationId).emit("stopTyping", d)
      );

      /* -------------------------------------------------------
       * 6. DISCONNECT — Update Online Status
       * ------------------------------------------------------- */
      socket.on("disconnect", async () => {
        if (!userId) return;

        try {
          await connectToDatabase();

          if (role === "expert") {
            await ExpertProfile.findOneAndUpdate(
              { user: userId },
              { isOnline: false, lastSeen: new Date() }
            );
          } else {
            await User.findByIdAndUpdate(userId, {
              isOnline: false,
              lastSeen: new Date(),
            });
          }

          socket.broadcast.emit("userStatusChanged", {
            userId,
            isOnline: false,
            lastSeen: new Date(),
          });
        } catch (err) {
          console.error("Disconnect Error:", err);
        }
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
