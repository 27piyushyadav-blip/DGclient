/*
 * File: src/components/video/VideoControls.js
 * ROLE: Icon-Only Media Controls (Sidebar Optimized)
 */

"use client";

import { Mic, MicOff, Video, VideoOff, PhoneOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VideoControls({ 
  isVideoOff, 
  isMuted, 
  showFlip, 
  onToggleVideo, 
  onToggleAudio, 
  onEndCall,
  onFlipCamera
}) {
  return (
    <div className="flex items-center gap-4">
      {/* Microphone Button */}
      <button
        onClick={onToggleAudio}
        className={cn(
          "h-11 w-11 rounded-full flex items-center justify-center border border-white/10 transition-all duration-200 shadow-xl",
          isMuted ? "bg-red-500 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
        )}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      {/* Video Button */}
      <button
        onClick={onToggleVideo}
        className={cn(
          "h-11 w-11 rounded-full flex items-center justify-center border border-white/10 transition-all duration-200 shadow-xl",
          isVideoOff ? "bg-red-500 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
        )}
        title={isVideoOff ? "Camera On" : "Camera Off"}
      >
        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
      </button>

      {/* Flip Camera (Shown contextually) */}
      {showFlip && (
        <button
        onClick={onFlipCamera}
          className="h-11 w-11 rounded-full flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-white/10 shadow-xl"
          title="Flip Camera"
        >
          <RefreshCw size={20} />
        </button>
      )}

      {/* Red "Leave Call" Button */}
      <button
        onClick={onEndCall}
        className="h-11 w-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
        title="Leave Session"
      >
        <PhoneOff size={20} fill="currentColor" />
      </button>
    </div>
  );
}