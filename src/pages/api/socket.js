/*
 * File: src/pages/api/socket.js
 * SR-DEV: Production Socket Server (Premium Chat)
 * Architecture: User ↔ User (Expert is a User with ExpertProfile)
 * FIXED:
 * - Initial online status sync on join_room
 * - Prevents late-join "Offline" bug
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

      /* -------------------------------------------------
       * USER CONNECT → ONLINE STATUS
       * ------------------------------------------------- */
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
            await User.findByIdAndUpdate(userId, {
              isOnline: true,
              lastSeen: new Date(),
            });
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

      /* -------------------------------------------------
       * JOIN CONVERSATION (FIXED: SYNC STATUS ON JOIN)
       * ------------------------------------------------- */
      socket.on("join_room", async (conversationId) => {
        if (!conversationId) return;
        socket.join(conversationId);

        // ✅ FIX: Immediately fetch and emit the OTHER party's status to the joiner.
        // This ensures that if the other user is ALREADY online, the UI updates immediately.
        try {
          await connectToDatabase();
          const conv = await Conversation.findById(conversationId);
          
          if (conv && userId) {
            let targetId = null;
            let statusData = null;

            // Determine who the "other" person is based on the joiner's role
            if (role === 'expert') {
              // Joiner is Expert -> They are talking to a USER
              targetId = conv.userId;
              statusData = await User.findById(targetId).select('isOnline lastSeen');
            } else {
              // Joiner is User -> They are talking to an EXPERT
              targetId = conv.expertId;
              statusData = await ExpertProfile.findById(targetId).select('isOnline lastSeen');
            }

            if (targetId && statusData) {
              // Emit ONLY to the client who just joined (socket.emit, not broadcast)
              socket.emit("userStatusChanged", {
                userId: targetId.toString(),
                isOnline: statusData.isOnline || false,
                lastSeen: statusData.lastSeen ? statusData.lastSeen.toISOString() : new Date().toISOString()
              });
            }
          }
        } catch (err) {
          console.error("[Socket] Join Sync Error:", err);
        }
      });

      /* -------------------------------------------------
       * SEND MESSAGE
       * ------------------------------------------------- */
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

          let preview = content;
          if (contentType === "image") preview = "📷 Image";
          else if (contentType === "audio") preview = "🎤 Audio Message";
          else if (contentType === "pdf") preview = "📄 Document";

          const isSenderUser =
            senderId.toString() === conversation.userId.toString();

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

          /* Normalize message object */
          const msgObj = msg.toObject();
          msgObj._id = msgObj._id.toString();
          msgObj.sender = msgObj.sender.toString();
          msgObj.conversationId = msgObj.conversationId.toString();
          msgObj.readBy = msgObj.readBy.map((id) => id.toString());

          if (msgObj.replyTo?._id) {
            msgObj.replyTo._id = msgObj.replyTo._id.toString();
          }

          msgObj.createdAt = msgObj.createdAt.toISOString();
          msgObj.updatedAt = msgObj.updatedAt.toISOString();

          /* Message stream */
          io.to(conversationId).emit("receive_message", msgObj);

          /* Sidebar updates */
          io.to(conversation.userId.toString()).emit(
            "receiveDirectMessage",
            msgObj
          );
          io.to(conversation.expertId.toString()).emit(
            "receiveDirectMessage",
            msgObj
          );
        } catch (err) {
          console.error("[Socket] send_message error:", err);
        }
      });

      /* -------------------------------------------------
       * READ RECEIPTS
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
            conversationId: conversationId.toString(),
            readByUserId: userId.toString(),
          });
        } catch (err) {
          console.error("[Socket] markAsRead error:", err);
        }
      });

      socket.on("getUserPresence", async ({ userId }) => {
        try {
          if (!userId) return;
      
          const user = await User.findById(userId)
            .select("isOnline lastSeen")
            .lean();
      
          if (!user) return;
      
          // 🔑 Send presence ONLY to requester
          socket.emit("userPresence", {
            userId,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
          });
        } catch (err) {
          console.error("getUserPresence error:", err);
        }
      });

      /* -------------------------------------------------
       * TYPING
       * ------------------------------------------------- */
      socket.on("typing", (data) =>
        socket.to(data.conversationId).emit("typing", data)
      );

      socket.on("stopTyping", (data) =>
        socket.to(data.conversationId).emit("stopTyping", data)
      );

      /* -------------------------------------------------
       * DELETE MESSAGE (OWNERSHIP GUARDED)
       * ------------------------------------------------- */
      socket.on("deleteMessage", async ({ conversationId, messageId }) => {
        try {
          await connectToDatabase();

          const msg = await Message.findById(messageId);
          if (!msg) return;

          if (msg.sender.toString() !== userId) return;

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

      /* -------------------------------------------------
       * DISCONNECT → OFFLINE
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
