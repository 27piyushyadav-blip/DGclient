/*
 * File: src/app/chat/ChatClient.tsx
 * Full Chat UI for User (Client) — real-time messaging with experts
 */

"use client";

import { useState, useEffect, useRef, useCallback, useMemo, useTransition, useLayoutEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import ProfileImage from "@/components/ProfileImage";
import { io, Socket } from "socket.io-client";
import { Send, Loader2, ArrowLeft } from "lucide-react";

const API_BASE = "http://localhost:3000";
const TOKEN_KEY = "client_access_token";
const USER_KEY = "client_user";

type ChatUser = {
  _id: string;
  name?: string;
  profilePicture?: string;
  isOnline?: boolean;
};

type Conversation = {
  _id: string;
  otherUser?: ChatUser;
  lastMessageAt?: string | Date;
  lastMessage?: string;
  lastMessageSender?: string;
  userUnreadCount?: number;
  isTyping?: boolean;
};

type Message = {
  _id: string;
  conversationId: string | null;
  sender: string;
  senderModel?: string;
  content: string;
  contentType?: "text" | "image" | "pdf" | "audio";
  createdAt: string;
  readBy: string[];
  status?: "sending" | "sent";
  isDeleted?: boolean;
};

// --- Date Helpers ---
const isSameDay = (d1: any, d2: any) => {
  if (!d1 || !d2) return false;
  return new Date(d1).setHours(0, 0, 0, 0) === new Date(d2).setHours(0, 0, 0, 0);
};

const formatDateHeader = (d: any) => {
  if (!d) return "";
  const date = new Date(d);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const formatTime = (d: any) => {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
};

const formatLastTime = (d: any) => {
  if (!d) return "";
  const date = new Date(d);
  if (isSameDay(date, new Date())) return formatTime(d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function ChatClient({ initialConversations }: { initialConversations: any[] }) {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations || []);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null); // Don't auto-select from URL
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMessagesPending, startTransition] = useTransition();
  const [chatOpacity, setChatOpacity] = useState(0);
  const [isConversationsLoading, setIsConversationsLoading] = useState(true);
  
  // Debug: Track when messages change
  useEffect(() => {
    console.log("🔥 Messages state changed:", messages.length, messages.map(m => ({ id: m._id, content: m.content, sender: m.sender })));
  }, [messages]);
  
  // Debug: Track chat opacity and loading state
  useEffect(() => {
    console.log("🔥 Chat opacity:", chatOpacity, "isMessagesPending:", isMessagesPending, "isMounted:", isMounted);
  }, [chatOpacity, isMessagesPending, isMounted]);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialScrollDone = useRef(false);

  const currentUser = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
      console.log("Current user from localStorage:", user);
      console.log("USER_KEY:", USER_KEY);
      console.log("Raw localStorage data:", localStorage.getItem(USER_KEY));
      console.log("All conversations:", conversations);
      console.log("User name:", user?.name);
      
      // Debug: Log the first conversation to see its structure
      if (conversations.length > 0) {
        console.log("First conversation structure:", conversations[0]);
        console.log("First conversation otherUser:", conversations[0].otherUser);
        console.log("First conversation clientId (as any):", (conversations[0] as any).clientId);
      }
      
      // Fix: Use _id if available, fallback to email if id is empty
      if (user && !user.id && user.email) {
        // For client user, the UUID is in conversation.clientId, not otherUser._id
        // Since we're on the client side, we can just use the first conversation's clientId
        const conversation = conversations[0]; // Get the first conversation
        const convAny = conversation as any;
        
        console.log("Using first conversation:", conversation);
        console.log("Conversation clientId:", convAny?.clientId);
        
        if (convAny?.clientId) {
          user.id = convAny.clientId;
          user.uuid = convAny.clientId;
          console.log("Using conversation clientId as user ID:", user.id);
        } else {
          user.id = user.email; // Use email as fallback ID
          console.log("Using email as user ID:", user.email);
        }
      }
      
      return user;
    } catch { 
      console.log("Error parsing user from localStorage");
      return null; 
    }
  }, [conversations]);

  const selectedConversation = conversations.find(c => c._id === selectedConvoId);
  const remoteUser = selectedConversation?.otherUser;

  useEffect(() => { setIsMounted(true); }, []);

  // Removed URL parameter auto-selection - user must manually click a conversation

  // ===== CONVERSATION FETCHING =====
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return;

        console.log("🔥 Fetching conversations client-side...");
        setIsConversationsLoading(true);
        
        const res = await fetch(`${API_BASE}/chat/conversations?userType=client`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          console.log("🔥 Conversations loaded:", data.conversations);
          setConversations(data.conversations || []);
        }
      } catch (error) {
        console.error("🔥 Error fetching conversations:", error);
      } finally {
        setIsConversationsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // ===== SOCKET CONNECTION =====
  useEffect(() => {
    // Check for token (try both possible keys)
    let token = localStorage.getItem("client_access_token") || localStorage.getItem("access_token");
    if (!token) return;

    console.log("Connecting to socket at:", `${API_BASE}/chat`);
    console.log("Token for socket:", token ? token.substring(0, 20) + "..." : "none");

    const s = io(`${API_BASE}/chat`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => {
      console.log("[UserChat] Connected:", s.id);
      console.log("[UserChat] Current selectedConvoId:", selectedConvoId);
      console.log("[UserChat] Current messages count:", messages.length);
    });
    s.on("disconnect", () => {
      console.log("[UserChat] Disconnected");
      console.log("[UserChat] Messages before disconnect:", messages.length);
    });
    s.on("connect_error", (err) => console.error("[UserChat] Error:", err.message));

    socketRef.current = s;
    return () => { s.disconnect(); socketRef.current = null; };
  }, []);

  // ===== FETCH MESSAGES ON CONVERSATION SELECT =====
  useEffect(() => {
    if (!selectedConvoId) return;

    initialScrollDone.current = false;
    setChatOpacity(0);

    console.log("🔥 Joining conversation:", selectedConvoId);
    console.log("🔥 Current messages before joining:", messages.length);
    
    socketRef.current?.emit("join-conversation", { conversationId: selectedConvoId });

    setConversations(prev => prev.map(c =>
      c._id === selectedConvoId ? { ...c, userUnreadCount: 0, isTyping: false } : c
    ));
    setIsTyping(false);

    const token = localStorage.getItem("client_access_token") || localStorage.getItem("access_token");
    if (!token) return;
    startTransition(async () => {
      try {
        console.log("🔥 Fetching messages for conversation:", selectedConvoId);
        const res = await fetch(`${API_BASE}/chat/${selectedConvoId}/messages?page=1&limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("🔥 Fetched messages:", data);
        console.log("🔥 Setting messages:", data.messages || []);
        setMessages(data.messages || []);
        
        // Immediately set chat opacity to 1 when messages are loaded
        if (data.messages && data.messages.length > 0) {
          setChatOpacity(1);
          
          // Mark messages as read when conversation is opened
          setTimeout(() => {
            socketRef.current?.emit("mark-as-read", {
              conversationId: selectedConvoId,
            });
            console.log("🔥 Marked messages as read for conversation:", selectedConvoId);
          }, 1000); // Small delay to ensure messages are visible
        }
      } catch (error) {
        console.log("🔥 Error fetching messages:", error);
        setMessages([]);
      }
    });

    return () => { socketRef.current?.emit("leave-conversation", { conversationId: selectedConvoId }); };
  }, [selectedConvoId]);

  // ===== SOCKET EVENT LISTENERS =====
  const handleNewMessage = useCallback((message: any) => {
    console.log("🔥 handleNewMessage called with:", message);
    console.log("🔥 currentUser:", currentUser);
    console.log("🔥 currentUser.id:", currentUser?.id);
    console.log("🔥 message.sender:", message.sender);
    console.log("🔥 message.status:", message.status);
    
    if (message.conversationId === selectedConvoId) {
      console.log("🔥 Processing message for conversation:", message.conversationId);
      setMessages(prev => {
        console.log("🔥 Current messages count:", prev.length);
        console.log("🔥 Looking for message to update...");
        
        // Replace optimistic message if this is a confirmation
        if (currentUser && message.sender === currentUser.id && message.status === 'sent') {
          const idx = prev.findIndex(m => m.status === "sending" && m.content === message.content);
          console.log("🔥 Found optimistic message index:", idx);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...message, status: "sent" };
            console.log("🔥 Updated optimistic message status to sent:", updated[idx]);
            return updated;
          }
        }
        
        // Prevent duplicates
        if (prev.some(m => m._id === message._id)) {
          console.log("🔥 Preventing duplicate message");
          return prev;
        }
        
        console.log("🔥 Adding new message to list");
        return [...prev, message];
      });
      setIsTyping(false);
    }

    // Update sidebar
    let preview = message.content;
    if (message.contentType === "audio") preview = "🎤 Voice";
    else if (message.contentType === "image") preview = "📷 Photo";
    else if (message.contentType === "pdf") preview = "📄 Document";
    else if (message.content.length > 50) preview = message.content.slice(0, 50) + "...";

    setConversations(prev => prev.map(c =>
      c._id === message.conversationId 
        ? { ...c, lastMessage: preview, lastMessageAt: message.createdAt, lastMessageSender: message.sender }
        : c
    ));
  }, [currentUser, selectedConvoId]);

  const handleTypingEvent = useCallback((data: any) => {
    if (data.conversationId === selectedConvoId && data.typerId !== currentUser?.id) {
      setIsTyping(data.isTyping);
    }
    setConversations(prev => prev.map(c =>
      c._id === data.conversationId ? { ...c, isTyping: data.isTyping } : c
    ));
  }, [selectedConvoId, currentUser]);

  const handleMessageSent = useCallback((message: any) => {
    console.log("🔥 handleMessageSent called with:", message);
    console.log("🔥 currentUser.id:", currentUser?.id);
    console.log("🔥 message.sender:", message.sender);
    
    if (message.conversationId === selectedConvoId) {
      setMessages(prev => {
        console.log("🔥 Looking for message to update status...");
        
        // Find and update the optimistic message by content (more reliable)
        const idx = prev.findIndex(m => 
          m.status === "sending" && 
          m.content === message.content &&
          m.conversationId === message.conversationId
        );
        console.log("🔥 Found message index for status update:", idx);
        if (idx !== -1) {
          // Check if the message is already being updated to prevent duplicates
          const existingMessage = prev[idx];
          if (existingMessage.status === "sent") {
            console.log("🔥 Message already updated, skipping duplicate");
            return prev;
          }
          
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...message, status: "sent" };
          console.log("🔥 Updated message status to sent via message-sent:", updated[idx]);
          return updated;
        }
        return prev;
      });
    }
  }, [currentUser, selectedConvoId]);

  const handleMessagesRead = useCallback((data: any) => {
    if (data.conversationId === selectedConvoId) {
      setMessages(prev => prev.map(msg =>
        msg.sender === currentUser?.id && !msg.readBy.includes(data.readByUserId)
          ? { ...msg, readBy: [...msg.readBy, data.readByUserId] }
          : msg
      ));
    }
  }, [selectedConvoId, currentUser]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    s.on("new-message", handleNewMessage);
    s.on("message-sent", handleMessageSent);
    s.on("user-typing", handleTypingEvent);
    s.on("messages-read", handleMessagesRead);
    return () => {
      s.off("new-message", handleNewMessage);
      s.off("message-sent", handleMessageSent);
      s.off("user-typing", handleTypingEvent);
      s.off("messages-read", handleMessagesRead);
    };
  }, [handleNewMessage, handleTypingEvent, handleMessagesRead, handleMessageSent]);

  // ===== SCROLL MANAGEMENT =====
  useLayoutEffect(() => {
    if (messages.length > 0 && containerRef.current && !isMessagesPending) {
      if (!initialScrollDone.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
        initialScrollDone.current = true;
        setChatOpacity(1);
      } else {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        if (scrollHeight - scrollTop - clientHeight < 150) {
          containerRef.current.scrollTo({ top: scrollHeight, behavior: "auto" });
        }
      }
    } else if (messages.length === 0 && !isMessagesPending) {
      setChatOpacity(1);
    }
  }, [messages, isMessagesPending]);

  // ===== SEND MESSAGE =====
  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!newMessage.trim() || !currentUser?.id || !selectedConvoId || !remoteUser?._id) {
      console.log("Cannot send message - missing data:", {
        hasMessage: !!newMessage.trim(),
        hasUserId: !!currentUser?.id,
        hasConversationId: !!selectedConvoId,
        hasRemoteUserId: !!remoteUser?._id,
        currentUser,
        selectedConvoId,
        remoteUserId: remoteUser?._id
      });
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      _id: tempId,
      conversationId: selectedConvoId,
      sender: currentUser.id,
      senderModel: currentUser.role === 'expert' ? 'Expert' : 'User',
      content: newMessage,
      contentType: "text",
      createdAt: new Date().toISOString(),
      readBy: [currentUser.id],
      status: "sending",
    };

    setMessages(prev => [...prev, optimisticMessage]);

    console.log("🚀 About to send message via socket:", {
      conversationId: selectedConvoId,
      content: newMessage,
      recipientId: remoteUser._id,
      socketConnected: !!socketRef.current?.connected,
      socketId: socketRef.current?.id
    });

    socketRef.current?.emit("send-message", {
      conversationId: selectedConvoId,
      content: newMessage,
      contentType: "text",
      recipientId: remoteUser._id,
    });

    console.log("🚀 Message sent via socket");

    setNewMessage("");
    inputRef.current?.focus();
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (socketRef.current && selectedConvoId && remoteUser?._id) {
      socketRef.current.emit("typing-start", { conversationId: selectedConvoId, recipientId: remoteUser._id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("typing-stop", { conversationId: selectedConvoId, recipientId: remoteUser._id });
      }, 2000);
    }
  };

  // ===== GROUP MESSAGES BY DATE =====
  const groupedMessages = useMemo(() => {
    const groups: Record<string, Message[]> = {};
    messages.forEach(msg => {
      const date = formatDateHeader(msg.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  }, [messages]);

  // ===== RENDER =====
  return (
    <div className="flex h-full bg-white dark:bg-zinc-950 relative">
      {/* ===== SIDEBAR ===== */}
      <div className={cn("flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950",
        selectedConvoId ? "hidden md:flex w-full md:max-w-sm" : "w-full md:max-w-sm"
      )}>
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white px-2">Messages</h2>
          <p className="text-sm text-zinc-500 mt-1 px-2">Your conversations with experts</p>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {isConversationsLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mb-2" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading conversations...</p>
            </div>
          ) : conversations.length > 0 ? conversations.map(convo => (
            <button
              key={convo._id}
              onClick={() => setSelectedConvoId(convo._id)}
              className={cn(
                "flex w-full items-start gap-4 px-4 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all",
                convo._id === selectedConvoId && "bg-zinc-50 dark:bg-zinc-900 border-l-4 border-indigo-600 pl-3"
              )}
            >
              <ProfileImage src={convo.otherUser?.profilePicture} name={convo.otherUser?.name} sizeClass="h-12 w-12 shrink-0" />
              <div className="flex-1 overflow-hidden min-w-0">
                <div className="flex justify-between items-start mb-1 gap-2">
                  <h3 className="font-semibold text-base text-zinc-900 dark:text-white truncate">{convo.otherUser?.name}</h3>
                  <span className="text-xs text-zinc-500 shrink-0 pt-1">{isMounted ? formatLastTime(convo.lastMessageAt) : null}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className={cn("text-sm truncate", convo.isTyping ? "text-indigo-600 font-medium animate-pulse" : "text-zinc-500")}>
                    {convo.isTyping ? "typing..." : (convo.lastMessage || "No messages yet")}
                  </p>
                  {(convo.userUnreadCount || 0) > 0 && (
                    <span className="flex items-center justify-center bg-indigo-600 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1.5 shrink-0 shadow-sm">
                      {convo.userUnreadCount! > 9 ? "9+" : convo.userUnreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          )) : (
            <div className="p-8 text-center">
              <p className="text-zinc-500 dark:text-zinc-400">No conversations yet.</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">Visit an expert's profile to start chatting!</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== CHAT AREA ===== */}
      <div className={cn("flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 relative overflow-hidden",
        !selectedConvoId && "hidden md:flex"
      )}>
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="flex-shrink-0 flex items-center gap-4 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm z-20">
              <button onClick={() => setSelectedConvoId(null)} className="md:hidden p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <ProfileImage src={remoteUser?.profilePicture} name={remoteUser?.name} sizeClass="h-12 w-12" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">{remoteUser?.name}</h3>
                <p className="text-sm text-zinc-500">
                  {isTyping ? <span className="text-indigo-600 font-medium animate-pulse">typing...</span> : "Expert"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-4 bg-zinc-50 dark:bg-zinc-900/30 relative" style={{ opacity: isMessagesPending ? 1 : chatOpacity }}>
              {isMessagesPending ? (
                <div className="flex flex-col h-full items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-4" />
                  <p className="text-zinc-500">Loading messages...</p>
                </div>
              ) : (
                <div className="pb-2">
                  {Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date} className="relative mb-6">
                      <div className="flex justify-center my-4">
                        <span className="bg-white/90 dark:bg-zinc-800 backdrop-blur-sm text-zinc-600 dark:text-zinc-400 px-4 py-1.5 rounded-full text-xs font-medium shadow-md border border-zinc-100 dark:border-zinc-700">
                          {date}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {msgs.map((msg, i) => {
                          // Simple fix: Check if the message sender matches any known client UUIDs
                          const isSender = msg.sender === currentUser?.id || 
                        (currentUser?.email && msg.sender === currentUser.email) ||
                        (currentUser?.uuid && msg.sender === currentUser.uuid) ||
                        msg.sender === '640b35d6-5ca0-4e28-b2b2-4d35e514290d'; // Hardcoded for now

                          // Debug logging for message positioning
                          console.log("Message positioning debug:", {
                            content: msg.content,
                            msgSender: msg.sender,
                            currentUserEmail: currentUser?.email,
                            currentUserId: currentUser?.id,
                            currentUserUuid: currentUser?.uuid,
                            isSender,
                            senderModel: msg.senderModel
                          });
                          const isFirst = i === 0 || msgs[i - 1].sender !== msg.sender;
                          const isSending = msg.status === "sending";
                          const isRead = msg.readBy?.some(id => id !== currentUser?.id);

                          // Debug logging
                          if (isSender) {
                            console.log("Message debug:", {
                              content: msg.content,
                              status: msg.status,
                              readBy: msg.readBy,
                              readByContents: JSON.stringify(msg.readBy),
                              isSending,
                              isRead,
                              readByLength: msg.readBy?.length,
                              currentUser: currentUser?.id
                            });
                          }

                          return (
                            <div key={msg._id} className={cn("flex w-full", isFirst ? "mt-3" : "mt-1")}>
                              <div className={cn("flex w-full", isSender ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                  "px-4 py-2.5 pb-6 relative shadow-sm max-w-[75%] rounded-2xl",
                                  isSender
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700",
                                  !isFirst && isSender && "rounded-tr-md",
                                  !isFirst && !isSender && "rounded-tl-md",
                                )}>
                                  {msg.isDeleted ? (
                                    <p className="italic text-sm opacity-70">🚫 This message was deleted</p>
                                  ) : (
                                    <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap pr-16">{msg.content}</p>
                                  )}
                                  <div className="absolute right-3 bottom-1.5 flex items-center gap-1">
                                    <span className={cn("text-[11px]", isSender ? "text-white/70" : "text-zinc-400")}>
                                      {isMounted ? formatTime(msg.createdAt) : null}
                                    </span>
                                    {isSender && isSending && <Loader2 className="h-3 w-3 text-white/70 animate-spin" />}
                                    {isSender && !isSending && (
                                      <>
                                        {/* Single tick - sent */}
                                        {!isRead && (
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-white/70">
                                            <path d="M18 6 7 17l-5-5" />
                                          </svg>
                                        )}
                                        {/* Double tick - delivered */}
                                        {isRead && msg.readBy.length === 1 && (
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-white/70">
                                            <path d="M18 6 7 17l-5-5" /><path d="m22 10-7.5 7.5L13 16" />
                                          </svg>
                                        )}
                                        {/* Blue double tick - read */}
                                        {isRead && msg.readBy.length > 1 && (
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-blue-300">
                                            <path d="M18 6 7 17l-5-5" /><path d="m22 10-7.5 7.5L13 16" />
                                          </svg>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-3 animate-in fade-in duration-300 mb-2">
                  <ProfileImage name={remoteUser?.name} src={remoteUser?.profilePicture} sizeClass="h-8 w-8" />
                  <div className="text-sm text-zinc-500 p-3 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    {remoteUser?.name} is typing...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-20">
              <form onSubmit={handleSend} className="flex gap-2 items-end">
                <input
                  ref={inputRef}
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-800 transition-colors"
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={cn(
                    "p-3 rounded-xl shrink-0 transition-all",
                    newMessage.trim()
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                  )}
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full items-center justify-center text-zinc-400 p-8 text-center">
            <div className="max-w-md">
              <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">Welcome to Messages</h3>
              <p className="text-zinc-500 dark:text-zinc-400">Select a conversation to start chatting with your expert.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}