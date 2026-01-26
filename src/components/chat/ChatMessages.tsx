/*
 * File: src/components/chat/ChatMessages.js
 * SR-DEV: Modular component for rendering chat history and managing scroll.
 * Features: Date grouping, media rendering, scroll-to-bottom, professional bubble design.
 */

"use client";

import { useEffect, useRef, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import ProfileImage from '@/components/ProfileImage';
import { format, isToday, isYesterday } from 'date-fns';
import { Check, CheckCheck, Clock, Play, Pause, FileText, Image as ImageIcon } from 'lucide-react';

// --- HELPER: Date Formatting ---
const formatMessageTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return format(date, "h:mm a");
};

const formatHeaderDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
};

// --- SUB-COMPONENT: Status Indicator ---
const MessageStatus = ({ isOwn, status, readByCount }: { isOwn: boolean; status: string; readByCount: number }) => {
  if (!isOwn) return null;

  const Icon = status === 'sending' ? Clock : readByCount > 1 ? CheckCheck : Check;
  const color = readByCount > 1 ? 'text-blue-400' : 'text-zinc-300';
  
  return <Icon className={cn("w-3 h-3", color)} />;
};

// --- SUB-COMPONENT: Audio Player (Reused from File 71) ---
const VoiceMessagePlayer = ({ src, isOwn }: { src: string; isOwn: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={cn("flex items-center gap-3 p-2 rounded-xl min-w-[160px]", isOwn ? "bg-blue-600" : "bg-zinc-100 dark:bg-zinc-800")}>
      <button 
          onClick={togglePlay} 
          className={cn("p-2 rounded-full transition-colors", isOwn ? "bg-white/20 hover:bg-white/30 text-white" : "bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white")}
          aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
      </button>
      <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
         <div className={cn("h-full transition-all duration-500", isPlaying ? "w-full bg-white animate-pulse" : "w-0")} />
      </div>
      <audio 
        ref={audioRef} 
        src={src} 
        onEnded={() => setIsPlaying(false)} 
        className="hidden" 
      />
    </div>
  );
};

// --- CORE COMPONENT ---

export default function ChatMessages({ messages, activeConversation, currentUser, isTyping }: { 
  messages: any[]; 
  activeConversation: any; 
  currentUser: any; 
  isTyping: boolean; 
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const expert = activeConversation?.expertId;

  // Scroll to bottom whenever messages change (or typing status changes)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Group messages by date for visual separation
  const messagesByDate = useMemo(() => {
    const groups: { date: string; messages: any[] }[] = [];
    messages.forEach((message, i) => {
      const dateString = formatHeaderDate(message.createdAt);
      if (i === 0 || formatHeaderDate(messages[i-1].createdAt) !== dateString) {
        groups.push({ date: dateString, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });
    return groups;
  }, [messages]);

  return (
    <div ref={chatAreaRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
      
      {messagesByDate.map((group, i) => (
        <div key={i}>
          {/* Date Separator */}
          <div className="flex justify-center mb-6">
            <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-500 text-[10px] px-3 py-1 rounded-full font-medium uppercase tracking-wide shadow-sm">
              {group.date}
            </span>
          </div>

          {/* Messages within the date group */}
          {group.messages.map((msg) => {
            const isOwn = msg.senderModel === "User";
            const isExpert = msg.senderModel === "Expert";
            const senderImage = isOwn ? currentUser.image : expert?.profilePicture;
            const senderName = isOwn ? currentUser.name : expert?.name;
            
            // Determine content rendering
            let content;
            if (msg.contentType === 'text') {
                content = <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>;
            } else if (msg.contentType === 'image') {
                content = <img src={msg.content} alt="Attachment" className="rounded-lg max-w-xs max-h-64 object-cover mb-1 cursor-pointer hover:opacity-90 transition-opacity" />;
            } else if (msg.contentType === 'audio') {
                content = <VoiceMessagePlayer src={msg.content} isOwn={isOwn} />;
            } else if (msg.contentType === 'pdf') {
                content = <a href={msg.content} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:underline"><FileText className="w-5 h-5" /> View Document</a>;
            } else {
                content = <p className="text-sm italic text-red-400">Unsupported media.</p>;
            }

            // Grouping logic: Check if the previous message was from the same sender
            const isFirstInGroup = i === 0 || msg.senderModel !== group.messages[i - 1].senderModel;

            return (
              <div key={msg._id} className={cn("flex gap-3 max-w-[80%] mb-1", isOwn ? "ml-auto flex-row-reverse" : "mr-auto")}>
                
                {/* Avatar (Hidden if not first in group) */}
                <div className={cn("h-8 w-8 mt-auto shrink-0 transition-opacity duration-150", isFirstInGroup ? 'opacity-100' : 'opacity-0')}>
                   <ProfileImage name={senderName} src={senderImage} sizeClass="h-8 w-8" />
                </div>
                
                {/* Bubble */}
                <div className="flex flex-col max-w-full">
                    <div className={cn(
                      "p-3 shadow-md relative min-w-[120px] max-w-full break-words",
                      // Bubble styling
                      isOwn 
                        ? "bg-blue-600 text-white rounded-t-2xl rounded-bl-2xl rounded-br-md" 
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-t-2xl rounded-br-2xl rounded-tl-md border border-zinc-200 dark:border-zinc-700",
                      // Margin adjustment for grouped messages
                      !isFirstInGroup && "mt-0.5"
                    )}>
                      {content}

                      {/* Meta (Time & Status) */}
                      <div className={cn("flex items-center justify-end gap-1 mt-1", isOwn ? "text-blue-100" : "text-zinc-400")}>
                        <span className="text-[10px]">{formatMessageTime(msg.createdAt)}</span>
                        <MessageStatus isOwn={isOwn} status={msg.status} readByCount={msg.readBy?.length} />
                      </div>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      
      {/* Typing Indicator */}
      {isTyping && (
         <div className="flex items-center gap-3 animate-in fade-in duration-300">
            <ProfileImage name={expert?.name} src={expert?.profilePicture} sizeClass="h-8 w-8" />
            <div className="text-sm text-zinc-500 dark:text-zinc-400 p-3 rounded-2xl rounded-bl-none bg-zinc-100 dark:bg-zinc-800">
                {expert?.name} is typing...
            </div>
         </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}