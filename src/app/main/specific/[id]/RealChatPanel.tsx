"use client";

/**
 * RealChatPanel — real-time socket-based chat embedded inside dialogs.
 * Works in both main page MessageDialog and detail page chat.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import {
  Send,
  Loader2,
  Paperclip,
  Mic,
  Square,
  FileText,
  CheckCheck,
  Check,
  MessageSquare,
  Video,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import Image from "next/image";
import { offersApi } from "@/lib/offersApi";
import OfferCard from "@/components/chat/OfferCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const TOKEN_KEY = "client_access_token";
const USER_KEY = "client_user";

// ── helpers ────────────────────────────────────────────────────────────────

const formatTime = (d: any) => {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const isSameDay = (d1: any, d2: any) => {
  if (!d1 || !d2) return false;
  return (
    new Date(d1).setHours(0, 0, 0, 0) === new Date(d2).setHours(0, 0, 0, 0)
  );
};

const formatDateHeader = (d: any) => {
  if (!d) return "";
  const date = new Date(d);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ── types ──────────────────────────────────────────────────────────────────

type Msg = {
  _id: string;
  conversationId: string | null;
  sender: string;
  senderModel?: string;
  content: string;
  contentType?: "text" | "image" | "video" | "pdf" | "audio" | "offer";
  payload?: any;
  createdAt: string;
  readBy: string[];
  status?: "sending" | "sent";
  isDeleted?: boolean;
};

export type RealChatPanelProps = {
  /** ID of the expert to chat with */
  expertId?: string;
  /** Expert's display name (shown in header) */
  expertName?: string;
  /** Expert's profile picture URL */
  expertAvatar?: string;
  /** Optional pre-populated conversation ID (skips /expert/start) */
  conversationId?: string;
  /** CSS height override for the messages scroll area, e.g. "h-72" */
  messagesHeightClass?: string;
};

// ── component ──────────────────────────────────────────────────────────────

export default function RealChatPanel({
  expertId,
  expertName = "Expert",
  expertAvatar,
  conversationId: initialConversationId,
  messagesHeightClass = "h-[22rem]",
}: RealChatPanelProps) {
  console.log("[RealChatPanel] Component mounted with expertId:", expertId);

  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId || null
  );
  const [messages, setMessages] = useState<Msg[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const conversationIdRef = useRef<string | null>(conversationId);
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // ── current user from localStorage ────────────────────────────────────

  const currentUser = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
      console.log("[RealChatPanel] Current user from localStorage:", user);
      
      // If id is missing, empty, or not a UUID, try to extract the real database UUID from client_access_token JWT
      const token = localStorage.getItem("client_access_token") || localStorage.getItem("access_token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const tokenUserId = payload.sub || payload.userId;
          if (tokenUserId) {
            console.log("[RealChatPanel] Successfully extracted real user UUID from JWT:", tokenUserId);
            if (user) {
              user.id = tokenUserId;
            } else {
              return { id: tokenUserId };
            }
          }
        } catch (jwtErr) {
          console.error("[RealChatPanel] Failed to extract sub from JWT token:", jwtErr);
        }
      }
      
      // Fallback: Use _id if available, fallback to email if id is empty
      if (user && !user.id && user.email) {
        user.id = user.email; // Use email as fallback ID
        console.log("[RealChatPanel] Using email as user ID:", user.email);
      }
      
      return user;
    } catch {
      console.log("[RealChatPanel] Error parsing user from localStorage");
      return null;
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ── scroll to bottom ──────────────────────────────────────────────────

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ── start / find conversation ─────────────────────────────────────────

  useEffect(() => {
    if (initialConversationId) {
      setConversationId(initialConversationId);
      return;
    }
    if (!expertId) {
      console.log("[RealChatPanel] No expertId provided");
      return;
    }

    const start = async () => {
      setIsStarting(true);
      try {
        console.log("[RealChatPanel] Starting conversation with expertId:", expertId);
        const result = await apiClient<any>(
          `${API_BASE}/chat/expert/start`,
          {
            method: "POST",
            body: JSON.stringify({ expertId }),
          }
        );
        console.log("[RealChatPanel] Conversation start result:", result);
        const cid = result._id || result.id || result.conversationId;
        console.log("[RealChatPanel] Conversation ID:", cid);
        setConversationId(cid);
      } catch (err) {
        console.error("[RealChatPanel] Failed to start conversation:", err);
      } finally {
        setIsStarting(false);
      }
    };

    void start();
  }, [expertId, initialConversationId]);

  // ── socket connection ─────────────────────────────────────────────────

  useEffect(() => {
    // Check for token (try both possible keys)
    let token =
      typeof window !== "undefined"
        ? localStorage.getItem("client_access_token") ||
          localStorage.getItem("access_token")
        : null;

    if (!token) {
      console.log("[RealChatPanel] No token found, skipping socket connection");
      return;
    }

    console.log("[RealChatPanel] Connecting to socket at:", `${API_BASE}/chat`);
    console.log("[RealChatPanel] Token for socket:", token ? token.substring(0, 20) + "..." : "none");

    const s = io(`${API_BASE}/chat`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => {
      console.log("[RealChatPanel] Socket connected:", s.id);
    });
    s.on("disconnect", () => {
      console.log("[RealChatPanel] Socket disconnected");
    });
    s.on("connect_error", (err) =>
      console.error("[RealChatPanel] Socket error:", err.message)
    );

    socketRef.current = s;
    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, []);

  // ── fetch messages when conversation ID resolves ──────────────────────

  useEffect(() => {
    if (!conversationId) return;

    console.log("[RealChatPanel] Joining conversation:", conversationId);

    socketRef.current?.emit("join-conversation", {
      conversationId,
    });

    const fetchMessages = async () => {
      setIsMessagesLoading(true);
      try {
        console.log("[RealChatPanel] Fetching messages for conversation:", conversationId);
        const data = await apiClient<any>(
          `${API_BASE}/chat/${conversationId}/messages?page=1&limit=100`
        );
        console.log("[RealChatPanel] Fetched messages:", data);
        setMessages(data.messages || []);

        // mark as read
        setTimeout(() => {
          socketRef.current?.emit("mark-read", { conversationId });
          console.log("[RealChatPanel] Marked messages as read for conversation:", conversationId);
        }, 800);
      } catch (err) {
        console.error("[RealChatPanel] Failed to fetch messages:", err);
        setMessages([]);
      } finally {
        setIsMessagesLoading(false);
      }
    };

    void fetchMessages();

    return () => {
      socketRef.current?.emit("leave-conversation", { conversationId });
    };
  }, [conversationId]);

  // ── socket event: new message ─────────────────────────────────────────

  const handleNewMessage = useCallback(
    (message: any) => {
      console.log("[RealChatPanel] handleNewMessage called with:", message);
      console.log("[RealChatPanel] currentUser:", currentUser);
      console.log("[RealChatPanel] currentUser.id:", currentUser?.id);
      console.log("[RealChatPanel] message.sender:", message.sender);
      console.log("[RealChatPanel] message.status:", message.status);

      if (message.conversationId !== conversationIdRef.current) return;

      setMessages((prev) => {
        console.log("[RealChatPanel] Current messages count:", prev.length);
        console.log("[RealChatPanel] Looking for message to update...");

        // Replace optimistic message if this is a confirmation
        if (currentUser && message.sender === currentUser.id && message.status === 'sent') {
          const idx = prev.findIndex(m => m.status === "sending" && m.content === message.content);
          console.log("[RealChatPanel] Found optimistic message index:", idx);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...message, status: "sent" };
            console.log("[RealChatPanel] Updated optimistic message status to sent:", updated[idx]);
            return updated;
          }
        }

        // Prevent duplicates
        if (prev.some((m) => m._id === message._id)) {
          console.log("[RealChatPanel] Preventing duplicate message");
          return prev;
        }

        // Don't add message if it's from the current user (to avoid echo)
        if (message.sender === currentUser?.id) {
          console.log("[RealChatPanel] Skipping message from current user to avoid echo");
          return prev;
        }

        console.log("[RealChatPanel] Adding new message to list");

        // Mark as read immediately if chat is open and message is from expert
        if (message.sender !== currentUser?.id) {
          socketRef.current?.emit("mark-read", {
            conversationId: conversationIdRef.current,
          });
          console.log("[RealChatPanel] Real-time mark-read emitted for incoming message");
        }

        return [...prev, message];
      });
      setIsTyping(false);
    },
    [currentUser]
  );

  const handleMessageSent = useCallback((message: any) => {
    console.log("[RealChatPanel] handleMessageSent called with:", message);
    console.log("[RealChatPanel] currentUser.id:", currentUser?.id);
    console.log("[RealChatPanel] message.sender:", message.sender);

    if (message.conversationId !== conversationIdRef.current) return;
    setMessages((prev) => {
      console.log("[RealChatPanel] Looking for message to update status...");

      // Find and update the optimistic message by content (more reliable)
      const idx = prev.findIndex(m =>
        m.status === "sending" &&
        m.content === message.content &&
        m.conversationId === message.conversationId
      );
      console.log("[RealChatPanel] Found message index for status update:", idx);
      if (idx !== -1) {
        // Check if the message is already being updated to prevent duplicates
        const existingMessage = prev[idx];
        if (existingMessage.status === "sent") {
          console.log("[RealChatPanel] Message already updated, skipping duplicate");
          return prev;
        }

        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...message, status: "sent" };
        console.log("[RealChatPanel] Updated message status to sent via message-sent:", updated[idx]);
        return updated;
      }
      return prev;
    });
  }, [currentUser]);

  const handleTypingEvent = useCallback((data: any) => {
    if (
      data.conversationId === conversationIdRef.current &&
      data.typerId !== currentUser?.id
    ) {
      setIsTyping(data.isTyping);
    }
  }, [currentUser]);

  const handleMessagesRead = useCallback((data: any) => {
    if (data.conversationId !== conversationIdRef.current) return;
    setMessages((prev) =>
      prev.map((msg) =>
        msg.sender === currentUser?.id && !msg.readBy.includes(data.readByUserId)
          ? { ...msg, readBy: [...msg.readBy, data.readByUserId] }
          : msg
      )
    );
  }, [currentUser]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const handleOfferUpdated = (data: any) => {
      console.log("🔥 [RealChatPanel] offer-updated received:", data);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.contentType === 'offer' && msg.payload?.id === data.offerId
            ? { ...msg, payload: { ...msg.payload, status: data.status } }
            : msg
        )
      );
    };

    s.on("new-message", handleNewMessage);
    s.on("message-sent", handleMessageSent);
    s.on("user-typing", handleTypingEvent);
    s.on("messages-read", handleMessagesRead);
    s.on("offer-updated", handleOfferUpdated);
    return () => {
      s.off("new-message", handleNewMessage);
      s.off("message-sent", handleMessageSent);
      s.off("user-typing", handleTypingEvent);
      s.off("messages-read", handleMessagesRead);
      s.off("offer-updated", handleOfferUpdated);
    };
  }, [handleNewMessage, handleMessageSent, handleTypingEvent, handleMessagesRead]);

  const handleAcceptOffer = useCallback(async (offerId: string) => {
    try {
      const response = await offersApi.acceptOffer(offerId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.contentType === 'offer' && msg.payload?.id === offerId
            ? { ...msg, payload: response.offer }
            : msg
        )
      );
    } catch (error) {
      console.error('Error accepting offer:', error);
    }
  }, []);

  const handleDeclineOffer = useCallback(async (offerId: string) => {
    try {
      const response = await offersApi.declineOffer(offerId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.contentType === 'offer' && msg.payload?.id === offerId
            ? { ...msg, payload: response.offer }
            : msg
        )
      );
    } catch (error) {
      console.error('Error declining offer:', error);
    }
  }, []);

  const handlePayForOffer = useCallback(async (offerId: string) => {
    try {
      const response = await offersApi.payForOffer(offerId);
      if (response.paymentUrl) {
        window.open(response.paymentUrl, '_blank');
      }
      setMessages((prev) =>
        prev.map((msg) =>
          msg.contentType === 'offer' && msg.payload?.id === offerId
            ? { ...msg, payload: response.offer }
            : msg
        )
      );
    } catch (error) {
      console.error('Error paying for offer:', error);
    }
  }, []);

  // ── send message ──────────────────────────────────────────────────────

  const handleSend = (e?: React.FormEvent, customContent?: string, customType: Msg["contentType"] = "text") => {
    e?.preventDefault();
    const content = customContent || newMessage;
    if (!content.trim() || !currentUser?.id || !conversationId) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic: Msg = {
      _id: tempId,
      conversationId,
      sender: currentUser.id,
      senderModel: currentUser.role === 'expert' ? 'Expert' : 'User',
      content,
      contentType: customType,
      createdAt: new Date().toISOString(),
      readBy: [currentUser.id],
      status: "sending",
    };

    setMessages((prev) => [...prev, optimistic]);

    socketRef.current?.emit("send-message", {
      conversationId,
      content,
      contentType: customType,
      recipientId: expertId,
    });

    if (!customContent) setNewMessage("");
    inputRef.current?.focus();
  };

  // ── typing indicator ─────────────────────────────────────────────────

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (socketRef.current && conversationId && expertId) {
      socketRef.current.emit("typing-start", {
        conversationId,
        recipientId: expertId,
      });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("typing-stop", {
          conversationId,
          recipientId: expertId,
        });
      }, 2000);
    }
  };

  // ── file upload ───────────────────────────────────────────────────────

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: Msg["contentType"]
  ) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await apiClient<any>(`${API_BASE}/chat/upload`, {
        method: "POST",
        body: fd,
      });
      if (res.fileUrl) handleSend(undefined, res.fileUrl, type);
    } catch (err) {
      console.error("[RealChatPanel] Upload failed:", err);
    }
    e.target.value = "";
  };

  // ── voice recording ───────────────────────────────────────────────────

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "voice.webm", { type: "audio/webm" });
        const fd = new FormData();
        fd.append("file", file);
        try {
          const res = await apiClient<any>(`${API_BASE}/chat/upload`, {
            method: "POST",
            body: fd,
          });
          if (res.fileUrl) handleSend(undefined, res.fileUrl, "audio");
        } catch (err) {
          console.error("[RealChatPanel] Audio upload failed:", err);
        }
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(
        () => setRecordingTime((p) => p + 1),
        1000
      );
    } catch (err) {
      console.error("[RealChatPanel] Recording failed:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const fmtRecTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // ── group messages by date ────────────────────────────────────────────

  const grouped: Record<string, Msg[]> = {};
  messages.forEach((m) => {
    const d = formatDateHeader(m.createdAt);
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(m);
  });

  // ── loading states ────────────────────────────────────────────────────

  if (isStarting) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm">Connecting to chat...</p>
      </div>
    );
  }

  if (!conversationId && !expertId) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-zinc-400">
        <MessageSquare className="h-8 w-8 opacity-40" />
        <p className="text-sm">No expert selected</p>
      </div>
    );
  }

  // ── render ────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      {/* Messages scroll area */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-y-auto ${messagesHeightClass} px-4 py-3 space-y-1 bg-zinc-50/70`}
      >
        {isMessagesLoading ? (
          <div className="flex items-center justify-center h-full py-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-zinc-400">
            <MessageSquare className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm">
              No messages yet. Say hi to {expertName}!
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, msgs]) => (
            <div key={date} className="mb-4">
              {/* Date separator */}
              <div className="flex justify-center my-3">
                <span className="bg-white text-zinc-500 text-[11px] font-medium px-3 py-1 rounded-full border border-zinc-200 shadow-sm">
                  {date}
                </span>
              </div>

              {msgs.map((msg, i) => {
                const isSender =
                  msg.sender === currentUser?.id ||
                  (currentUser?.email &&
                    msg.sender === currentUser.email) ||
                  (currentUser?.uuid &&
                    msg.sender === currentUser.uuid);
                const isFirst =
                  i === 0 || msgs[i - 1].sender !== msg.sender;
                const isSending = msg.status === "sending";
                const isRead = msg.readBy?.some(
                  (id: string) => id !== currentUser?.id
                );

                if (msg.contentType === "offer" && msg.payload) {
                  return (
                    <div
                      key={msg._id}
                      className={`flex w-full ${isFirst ? "mt-3" : "mt-1"}`}
                    >
                      <div
                        className={`flex w-full ${
                          isSender ? "justify-end" : "justify-start"
                        }`}
                      >
                        {/* Avatar for received messages */}
                        {!isSender && isFirst && (
                          <div className="w-7 h-7 rounded-full overflow-hidden mr-2 mt-1 shrink-0 bg-gradient-to-br from-indigo-400 to-purple-500">
                            {expertAvatar ? (
                              <Image
                                src={expertAvatar}
                                alt={expertName}
                                width={28}
                                height={28}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                {expertName[0]}
                              </div>
                            )}
                          </div>
                        )}
                        {!isSender && !isFirst && (
                          <div className="w-7 mr-2 shrink-0" />
                        )}
                        
                        <div className="w-[320px] max-w-full my-1">
                          <OfferCard
                            payload={msg.payload}
                            isOwn={isSender}
                            onAccept={handleAcceptOffer}
                            onDecline={handleDeclineOffer}
                            onPay={handlePayForOffer}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg._id}
                    className={`flex w-full ${isFirst ? "mt-3" : "mt-1"}`}
                  >
                    <div
                      className={`flex w-full ${
                        isSender ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Avatar for received messages */}
                      {!isSender && isFirst && (
                        <div className="w-7 h-7 rounded-full overflow-hidden mr-2 mt-1 shrink-0 bg-gradient-to-br from-indigo-400 to-purple-500">
                          {expertAvatar ? (
                            <Image
                              src={expertAvatar}
                              alt={expertName}
                              width={28}
                              height={28}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                              {expertName[0]}
                            </div>
                          )}
                        </div>
                      )}
                      {!isSender && !isFirst && (
                        <div className="w-7 mr-2 shrink-0" />
                      )}

                      <div
                        className={`px-3.5 py-2.5 pb-5 relative shadow-sm max-w-[75%] rounded-2xl text-sm leading-relaxed ${
                          isSender
                            ? "bg-indigo-600 text-white rounded-tr-md"
                            : "bg-white text-zinc-900 border border-zinc-200 rounded-tl-md"
                        } ${!isFirst && isSender ? "rounded-tr-md" : ""} ${
                          !isFirst && !isSender ? "rounded-tl-md" : ""
                        }`}
                      >
                        {msg.isDeleted ? (
                          <p className="italic opacity-60 text-xs">
                            🚫 Message deleted
                          </p>
                        ) : msg.contentType === "image" ? (
                          <img
                            src={msg.content}
                            alt="Shared"
                            className="rounded-lg max-w-[220px] max-h-[260px] object-cover cursor-pointer"
                            onClick={() =>
                              window.open(msg.content, "_blank")
                            }
                          />
                        ) : msg.contentType === "video" ? (
                          <video
                            src={msg.content}
                            controls
                            className="rounded-lg max-w-[280px]"
                          />
                        ) : msg.contentType === "audio" ? (
                          <audio
                            src={msg.content}
                            controls
                            className="h-8 min-w-[180px]"
                          />
                        ) : msg.contentType === "pdf" ? (
                          <div className="flex items-center gap-2 p-1 bg-black/5 rounded-lg">
                            <FileText className="h-6 w-6 text-red-500 shrink-0" />
                            <div>
                              <p className="text-xs font-medium">Document</p>
                              <button
                                className="text-[10px] text-blue-500"
                                onClick={() =>
                                  window.open(msg.content, "_blank")
                                }
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap break-words pr-12">
                            {msg.content}
                          </p>
                        )}

                        {/* timestamp + status */}
                        <div className="absolute right-2.5 bottom-1 flex items-center gap-0.5">
                          <span
                            className={`text-[10px] ${
                              isSender ? "text-white/60" : "text-zinc-400"
                            }`}
                          >
                            {isMounted ? formatTime(msg.createdAt) : ""}
                          </span>
                          {isSender && isSending && (
                            <Loader2 className="h-2.5 w-2.5 text-white/60 animate-spin ml-0.5" />
                          )}
                          {isSender && !isSending && (
                            isRead ? (
                              <CheckCheck className="h-3 w-3 text-blue-300 ml-0.5" />
                            ) : (
                              <Check className="h-3 w-3 text-white/60 ml-0.5" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 mt-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs">
              {expertName[0]}
            </div>
            <div className="bg-white border border-zinc-200 rounded-2xl rounded-tl-md px-3 py-2 shadow-sm text-xs text-zinc-500 animate-pulse">
              {expertName} is typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-zinc-200 bg-white p-3">
        {/* media attach row */}
        <div className="flex items-center gap-1 mb-2">
          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "image")}
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 rounded-full transition-colors"
            title="Send image"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            type="file"
            ref={videoInputRef}
            className="hidden"
            accept="video/*"
            onChange={(e) => handleFileUpload(e, "video")}
          />
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 rounded-full transition-colors"
            title="Send video"
          >
            <Video className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-2 py-1"
        >
          {isRecording ? (
            <div className="flex-1 flex items-center justify-between px-1 py-1.5">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-medium text-red-500">
                  Recording… {fmtRecTime(recordingTime)}
                </span>
              </div>
              <button
                type="button"
                onClick={stopRecording}
                className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
              >
                <Square className="h-3 w-3 fill-red-500" /> STOP &amp; SEND
              </button>
            </div>
          ) : (
            <>
              <input
                ref={inputRef}
                value={newMessage}
                onChange={handleTyping}
                placeholder="Write a message…"
                className="flex-1 bg-transparent border-none text-sm px-2 py-2 focus:outline-none placeholder:text-zinc-400 text-zinc-900"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                type="button"
                onClick={startRecording}
                className="p-1.5 text-zinc-400 hover:text-indigo-600 transition-colors"
                title="Voice message"
              >
                <Mic className="h-4 w-4" />
              </button>
            </>
          )}

          {!isRecording && (
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className={`p-1.5 rounded-lg transition-all shrink-0 ${
                newMessage.trim()
                  ? "text-indigo-600 hover:bg-indigo-50"
                  : "text-zinc-300 cursor-not-allowed"
              }`}
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
