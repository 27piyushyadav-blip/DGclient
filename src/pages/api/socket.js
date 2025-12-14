/*
 * File: src/pages/api/socket.js
 * SR-DEV: Production Socket Server (Premium Chat)
 * Architecture: User ↔ User (Expert is a User with ExpertProfile)
 * Supports: User App + Admin/Expert App
 */

import { Server } from "socket.io";
import { connectToDatabase } from "@/lib/db";

import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";
import ExpertProfile from "@/models/ExpertProfile";

/* -------------------------------------------------------
 * Next.js API Config
 * ------------------------------------------------------- */
export const config = {
  api: {
    bodyParser: false,
  },
};

/* -------------------------------------------------------
 * Socket.IO Handler
 * ------------------------------------------------------- */
const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log("🚀 Socket.IO server starting…");

    const io = new Server(res.socket.server, {
      path: "/api/socket_io",
      addTrailingSlash: false,

      // ✅ MULTI-APP CORS CONFIG
      cors: {
        origin: [
          "http://localhost:3000", // User App
          "http://localhost:3001", // Admin / Expert App
          "https://mindnamo.com", // User Production
          "https://admin.mindnamo.com", // Admin Production
        ],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    /* ---------------------------------------------------
     * SOCKET CONNECTION
     * --------------------------------------------------- */
    io.on("connection", async (socket) => {
      const { userId, role } = socket.handshake.query;

      /* -------------------------------------------------
       * 1. USER CONNECTED → ONLINE STATUS
       * ------------------------------------------------- */
      if (userId) {
        socket.join(userId); // personal room

        try {
          await connectToDatabase();

          if (role === "expert") {
            await ExpertProfile.findOneAndUpdate(
              { user: userId },
              { isOnline: true, lastSeen: new Date() }
            );
          } else {
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
          console.error("[Socket] Online status error:", err);
        }
      }

      /* -------------------------------------------------
       * 2. JOIN CONVERSATION ROOM
       * ------------------------------------------------- */
      socket.on("join_room", (conversationId) => {
        socket.join(conversationId);
      });

      /* -------------------------------------------------
       * 3. SEND MESSAGE
       * ------------------------------------------------- */
      socket.on("send_message", async (data) => {
        const {
          conversationId,
          senderId,
          receiverId,
          content,
          type,
          replyTo,
        } = data;

        if (!conversationId || !senderId || !content) return;

        try {
          await connectToDatabase();

          // Save message
          const msg = await Message.create({
            conversationId,
            sender: senderId,
            senderModel: "User", // unified model
            content,
            contentType: type || "text",
            replyTo: replyTo || null,
            readBy: [senderId],
          });

          await msg.populate("replyTo");

          // Message preview
          let preview = content;
          if (type === "image") preview = "📷 Image";
          else if (type === "audio") preview = "🎤 Audio Message";
          else if (type === "pdf") preview = "📄 Document";

          const conversation = await Conversation.findById(conversationId);
          if (!conversation) return;

          const isSenderUser =
            senderId.toString() === conversation.userId.toString();

          // Update conversation metadata
          await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: preview,
            lastMessageAt: msg.createdAt,
            lastMessageSender: senderId,
            lastMessageStatus: "sent",
            $inc: {
              userUnreadCount: isSenderUser ? 0 : 1,
              expertUnreadCount: isSenderUser ? 1 : 0,
            },
          });

          // Emit message to room
          io.to(conversationId).emit("receive_message", msg);

          // Sidebar preview update
          io.to(conversationId).emit("conversationUpdated", {
            conversationId,
            lastMessage: preview,
            lastMessageAt: msg.createdAt,
            lastMessageSender: senderId,
          });

          // Direct notification
          if (receiverId) {
            io.to(receiverId).emit("receiveDirectMessage", msg);
          }
        } catch (err) {
          console.error("[Socket] send_message error:", err);
        }
      });

      /* -------------------------------------------------
       * 4. READ RECEIPTS
       * ------------------------------------------------- */
      socket.on("markAsRead", async ({ conversationId, userId }) => {
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
          if (!conv) return;

          const isUser =
            userId.toString() === conv.userId.toString();

          await Conversation.findByIdAndUpdate(conversationId, {
            [isUser ? "userUnreadCount" : "expertUnreadCount"]: 0,
          });

          io.to(conversationId).emit("messagesRead", {
            conversationId,
            readByUserId: userId,
          });
        } catch (err) {
          console.error("[Socket] markAsRead error:", err);
        }
      });

      /* -------------------------------------------------
       * 5. TYPING INDICATORS
       * ------------------------------------------------- */
      socket.on("typing", (data) => {
        socket.to(data.conversationId).emit("typing", data);
      });

      socket.on("stopTyping", (data) => {
        socket.to(data.conversationId).emit("stopTyping", data);
      });

      /* -------------------------------------------------
       * 6. DELETE MESSAGE
       * ------------------------------------------------- */
      socket.on("deleteMessage", async ({ conversationId, messageId }) => {
        try {
          await Message.findByIdAndUpdate(messageId, {
            isDeleted: true,
            content: "🚫 This message was deleted",
          });

          io.to(conversationId).emit("messageDeleted", { messageId });
        } catch (err) {
          console.error("[Socket] deleteMessage error:", err);
        }
      });

      /* -------------------------------------------------
       * 7. DISCONNECT → OFFLINE STATUS
       * ------------------------------------------------- */
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
          console.error("[Socket] disconnect error:", err);
        }
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
