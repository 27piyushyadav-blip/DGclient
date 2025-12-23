/*
 * File: src/pages/api/socket.js
 * ROLE: Unified Socket Server (Chat + Video + Whiteboard)
 * ARCH: User ↔ User (Expert is a User with ExpertProfile)
 */

import { Server } from "socket.io";
import { connectToDatabase } from "@/lib/db";

import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";
import ExpertProfile from "@/models/ExpertProfile";
import UserProfile from "@/models/UserProfile";

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
      cors: {
        origin: [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:3002",
          "https://mindnamo.com",
          "https://admin.mindnamo.com",
        ],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.on("connection", async (socket) => {
      const { userId, role } = socket.handshake.query;

      /* =====================================================
       * PRESENCE → CONNECT
       * ===================================================== */
      if (userId) {
        socket.join(userId);

        try {
          await connectToDatabase();

          if (role === "expert") {
            await ExpertProfile.findOneAndUpdate(
              { user: userId },
              { isOnline: true, lastSeen: new Date() }
            );
          } else {
            await UserProfile.findOneAndUpdate(
              { user: userId },
              { isOnline: true, lastSeen: new Date() }
            );
          }

          socket.broadcast.emit("userStatusChanged", {
            userId: userId.toString(),
            isOnline: true,
            lastSeen: new Date().toISOString(),
          });
        } catch (err) {
          console.error("[Socket] Online status error:", err);
        }
      }

      /* =====================================================
       * CHAT → JOIN ROOM (SYNC OTHER USER STATUS)
       * ===================================================== */
      socket.on("join_room", async (conversationId) => {
        if (!conversationId) return;
        socket.join(conversationId);

        try {
          await connectToDatabase();
          const conv = await Conversation.findById(conversationId);
          if (!conv || !userId) return;

          let targetId, statusData;

          if (role === "expert") {
            targetId = conv.userId;
            statusData = await UserProfile.findOne({ user: targetId }).select(
              "isOnline lastSeen"
            );
          } else {
            targetId = conv.expertId;
            statusData = await ExpertProfile.findById(targetId).select(
              "isOnline lastSeen"
            );
          }

          if (targetId && statusData) {
            socket.emit("userStatusChanged", {
              userId: targetId.toString(),
              isOnline: statusData.isOnline || false,
              lastSeen:
                statusData.lastSeen?.toISOString() ||
                new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error("[Socket] Join sync error:", err);
        }
      });

      /* =====================================================
       * VIDEO CALL → WebRTC SIGNALING
       * ===================================================== */
      socket.on("join-video", (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit("wb-request-state", {
          requesterId: socket.id,
        });
      });

      socket.on("client-ready", (roomId) => {
        socket.to(roomId).emit("user-connected", socket.id);
      });

      socket.on("offer", (payload) => {
        socket.to(payload.roomId).emit("offer", payload);
      });

      socket.on("answer", (payload) => {
        socket.to(payload.roomId).emit("answer", payload);
      });

      socket.on("ice-candidate", (payload) => {
        socket.to(payload.roomId).emit("ice-candidate", payload);
      });

      /* =====================================================
       * WHITEBOARD
       * ===================================================== */
      // Draw relay
      socket.on("wb-draw", (data) => {
        socket.to(data.roomId).emit("wb-draw", data);
      });

      // Cursor relay (expert cursor watermark)
      socket.on("wb-cursor", (data) => {
        // data = { roomId, x, y }
        socket.to(data.roomId).emit("wb-cursor", data);
      });

      // Clear board
      socket.on("wb-clear", (roomId) => {
        socket.to(roomId).emit("wb-clear");
      });

      // ✅ FIXED: Request whiteboard state
      socket.on("wb-request-state", (roomId) => {
        socket.to(roomId).emit("wb-request-state", {
          requesterId: socket.id,
        });
      });

      // Send board snapshot to requester
      socket.on("wb-send-state", ({ image, requesterId }) => {
        io.to(requesterId).emit("wb-update-state", { image });
      });

      /* =====================================================
       * CHAT → SEND MESSAGE
       * ===================================================== */
      socket.on("send_message", async (data) => {
        const {
          conversationId,
          senderId,
          content,
          contentType,
          replyTo,
          senderModel,
        } = data;

        if (!conversationId || !senderId || !content) return;

        try {
          await connectToDatabase();
          const conversation = await Conversation.findById(conversationId);
          if (!conversation) return;

          const msg = await Message.create({
            conversationId,
            sender: senderId,
            senderModel: senderModel || "User",
            content,
            contentType: contentType || "text",
            replyTo: replyTo || null,
            readBy: [senderId],
          });

          await msg.populate("replyTo");

          const isSenderUser =
            senderId.toString() === conversation.userId.toString();

            const updatedConv = await Conversation.findByIdAndUpdate(
              conversationId,
              {
                lastMessage:
                  contentType === "text"
                    ? content
                    : contentType === "image"
                      ? "📷 Image"
                      : contentType === "audio"
                        ? "🎤 Audio"
                        : "📎 Attachment",
                lastMessageAt: msg.createdAt,
                lastMessageSender: senderId,
                $inc: {
                  userUnreadCount: isSenderUser ? 0 : 1,
                  expertUnreadCount: isSenderUser ? 1 : 0,
                },
              },
              { new: true } // 👈 THIS is the key change
            );

          io.to(conversationId).emit("receive_message", msg);
          io.to(conversation.userId.toString()).emit(
            "receiveDirectMessage",
            msg
          );
          io.to(conversation.expertId.toString()).emit(
            "receiveDirectMessage",
            msg
          );
          const convData = {
            ...updatedConv.toObject(),
            conversationId: updatedConv._id.toString(),
          };
          
          // 🔁 Sidebar sync (both sides)
          io.to(conversation.userId.toString()).emit(
            "conversationUpdated",
            convData
          );
          
          io.to(conversation.expertId.toString()).emit(
            "conversationUpdated",
            convData
          );
          
        } catch (err) {
          console.error("[Socket] send_message error:", err);
        }
      });

      /* =====================================================
       * READ RECEIPTS
       * ===================================================== */
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

          const isUser = userId.toString() === conv.userId.toString();

          await Conversation.findByIdAndUpdate(conversationId, {
            [isUser ? "userUnreadCount" : "expertUnreadCount"]: 0,
          });

          io.to(conversationId).emit("messagesRead", {
            conversationId: conversationId.toString(),
            readByUserId: userId.toString(),
          });
        } catch (err) {
          console.error("[Socket] markAsRead error:", err);
        }
      });

      /* =====================================================
       * TYPING
       * ===================================================== */
      socket.on("typing", (data) => {
        socket.to(data.conversationId).emit("typing", data);
      });

      socket.on("stopTyping", (data) => {
        socket.to(data.conversationId).emit("stopTyping", data);
      });

      /* =====================================================
       * DELETE MESSAGE
       * ===================================================== */
      socket.on("deleteMessage", async ({ conversationId, messageId }) => {
        try {
          await connectToDatabase();
          const msg = await Message.findById(messageId);
          if (!msg || msg.sender.toString() !== userId) return;

          await Message.findByIdAndUpdate(messageId, {
            isDeleted: true,
            content: "🚫 This message was deleted",
            contentType: "text",
          });

          io.to(conversationId).emit("messageDeleted", {
            messageId: messageId.toString(),
          });
        } catch (err) {
          console.error("[Socket] deleteMessage error:", err);
        }
      });

      /* =====================================================
       * PRESENCE → DISCONNECT
       * ===================================================== */
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
            await UserProfile.findOneAndUpdate(
              { user: userId },
              { isOnline: false, lastSeen: new Date() }
            );
          }

          socket.broadcast.emit("userStatusChanged", {
            userId: userId.toString(),
            isOnline: false,
            lastSeen: new Date().toISOString(),
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
