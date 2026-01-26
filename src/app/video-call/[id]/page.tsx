/*
 * File: src/app/video-call/[id]/page.js
 * ROLE: Professional Video Call Stage (Meet/Gmail Style – Mobile Responsive)
 * FEATURES:
 * - WebRTC Video Call
 * - Whiteboard Stage
 * - Pin / Unpin
 * - Minimize / Expand Tiles
 * - Mobile Grid + Desktop Sidebar
 */

"use client";

import { useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  VolumeX,
  Pin,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

import Whiteboard from "@/components/video/Whiteboard";
import VideoControls from "@/components/video/VideoControls";
import ProfileImage from "@/components/ProfileImage";

const StreamPlayer = ({ stream, muted, className }: { stream: MediaStream | null; muted: boolean; className?: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  return <video ref={videoRef} autoPlay playsInline muted={muted} className={className} />;
};

export default function VideoCallPage() {
  const params = useParams<{ id: string }>();
  const meetingId = params?.id;
  const router = useRouter();

  if (!meetingId) {
    return <div>Loading...</div>;
  }


  /* -------------------- STATE -------------------- */
  const [participants, setParticipants] = useState<{
    me: { name: string; image: string | undefined };
    other: { name: string; image: string | undefined };
  }>({
    me: { name: "You", image: undefined },
    other: { name: "Loading...", image: undefined },
  });

  const [connectionStatus, setConnectionStatus] = useState("Unavailable");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [remoteVideoOff, setRemoteVideoOff] = useState(false);
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const [canFlipCamera, setCanFlipCamera] = useState(false);

  /* ---- Layout State ---- */
  const [pinnedId, setPinnedId] = useState("whiteboard");
  const [isRemoteMinimized, setIsRemoteMinimized] = useState(false);
  const [isLocalMinimized, setIsLocalMinimized] = useState(false);

  /* -------------------- REFS -------------------- */

  const socketRef = useRef<any>(null);
  const peerRef = useRef<any>(null);

  /* -------------------- MEDIA CONTROLS -------------------- */
  const toggleVideoHandler = useCallback(() => {
    const t = localStream?.getVideoTracks()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setIsVideoOff(!t.enabled);
  }, [localStream, meetingId]);

  const toggleAudioHandler = useCallback(() => {
    const t = localStream?.getAudioTracks()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setIsMuted(!t.enabled);
  }, [localStream, meetingId]);


  const flipCamera = async () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    const currentFacing = videoTrack.getSettings().facingMode;

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentFacing === "user" ? "environment" : "user" },
      });
      const newVideoTrack = newStream.getVideoTracks()[0];

      // Replace the track in the WebRTC connection
      const sender = peerRef.current?.getSenders().find((s) => s.track?.kind === "video");
      if (sender) sender.replaceTrack(newVideoTrack);

      // Stop the old hardware track
      videoTrack.stop();

      // Update local state with the new stream (retaining original audio)
      setLocalStream(new MediaStream([newVideoTrack, ...localStream.getAudioTracks()]));
    } catch (err) {
      console.error("Flip failed", err);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100dvh-64px)] bg-[#111] overflow-hidden text-white font-inter">

      {/* ================= MAIN STAGE ================= */}
      <div className="flex-1 relative flex flex-col p-2 lg:p-4 bg-black min-h-0">
        <div className="flex-1 rounded-2xl overflow-hidden bg-black relative shadow-2xl">

          {pinnedId === "whiteboard" && (
            <div className="w-full h-full bg-white">
              <Whiteboard
                socket={socketRef.current}
                roomId={meetingId}
                expertName={participants.other.name}
                expertImage={participants.other.image}
              />
            </div>
          )}

          {pinnedId === "remote" && (
            <StreamPlayer
              stream={remoteStream}
              muted={isRemoteMuted}
              className="w-full h-full object-cover"
            />
          )}

          {pinnedId === "local" && (
            <StreamPlayer
              stream={localStream}
              muted={true}
              className={cn(
                "w-full h-full object-cover scale-x-[-1]", // Mirror for natural look
                isVideoOff && "opacity-0"
              )}
            />
          )}




          {/* ================= STAGE PROFILE FALLBACK ================= */}
          {pinnedId === "remote" && remoteVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <ProfileImage
                src={participants.other.image}
                name={participants.other.name}
                sizeClass="h-32 w-32 lg:h-40 lg:w-40"
              />
            </div>
          )}

          {pinnedId === "local" && isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <ProfileImage
                src={participants.me.image}
                name={participants.me.name}
                sizeClass="h-32 w-32 lg:h-40 lg:w-40"
              />
            </div>
          )}


          {/* ================= STAGE MUTE INDICATOR ================= */}
          {pinnedId === "local" && isMuted && (
            <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/60 flex items-center justify-center">
              <VolumeX className="w-5 h-5 text-red-400" />
            </div>
          )}

          {pinnedId === "remote" && isRemoteMuted && (
            <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/60 flex items-center justify-center">
              <VolumeX className="w-5 h-5 text-red-400" />
            </div>
          )}


          {/* ================= PINNED PERSON NAME ================= */}
          {pinnedId !== "whiteboard" && (
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 rounded-lg">
              <span className="text-xs font-semibold tracking-wide">
                {pinnedId === "remote"
                  ? participants.other.name
                  : "You"}
              </span>
            </div>
          )}


        </div>

        {connectionStatus !== "Connected" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 rounded-2xl m-2 lg:m-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          </div>
        )}
      </div>

      {/* ================= SIDEBAR / DRAWER ================= */}
      <div className="w-full lg:w-80 flex flex-col justify-between border-t lg:border-l border-white/5 bg-[#111] shrink-0">

        <div className="p-3 lg:p-4 grid grid-cols-2 lg:grid-cols-1 gap-3 overflow-y-auto max-h-[30vh] lg:max-h-full">

          {/* ================= WHITEBOARD ACCESS TILE ================= */}
          {pinnedId !== "whiteboard" && (
            <div
              onClick={() => setPinnedId("whiteboard")}
              className="relative cursor-pointer bg-zinc-900 hover:bg-zinc-800 transition rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-white/10"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="text-lg font-bold">🧾</span>
                </div>
                <span className="text-sm font-semibold">Whiteboard</span>
                <span className="text-[10px] text-white/60">
                  Click to return
                </span>
              </div>
            </div>
          )}


          {/* ================= REMOTE TILE ================= */}
          {pinnedId !== "remote" && (
            <div
              className={cn(
                "relative bg-zinc-900 rounded-xl overflow-hidden",
                isRemoteMinimized ? "h-14" : "aspect-video"
              )}
            >
              {!isRemoteMinimized && (
                <StreamPlayer
                  stream={remoteStream}
                  muted={isRemoteMuted}
                  className="w-full h-full object-cover"
                />
              )}

              {/* BIG AVATAR ONLY WHEN VIDEO OFF & NOT MINIMIZED */}
              {remoteVideoOff && !isRemoteMinimized && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                  <ProfileImage
                    src={participants.other.image}
                    name={participants.other.name}
                    sizeClass="h-16 w-16 lg:h-20 lg:w-20"
                  />
                </div>
              )}

              {/* COMPACT ROW WHEN MINIMIZED */}
              {isRemoteMinimized && (
                <div className="absolute inset-0 flex items-center gap-2 px-3 bg-zinc-800">
                  <ProfileImage
                    src={participants.other.image}
                    name={participants.other.name}
                    sizeClass="h-8 w-8"
                  />
                  <span className="text-sm font-semibold truncate">
                    {participants.other.name}
                  </span>
                </div>
              )}

              {!isRemoteMinimized && (
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] font-semibold">
                  {participants.other.name}
                </div>
              )}

              <div className="absolute bottom-2 right-2 flex gap-2">
                {isRemoteMuted && (
                  <div className="h-9 w-9 rounded-full bg-black/60 flex items-center justify-center">
                    <VolumeX className="w-4 h-4 text-red-400" />
                  </div>
                )}

                <button
                  onClick={() => setPinnedId("remote")}
                  className="h-9 w-9 rounded-full bg-black/60 flex items-center justify-center"
                >
                  <Pin size={16} />
                </button>

                <button
                  onClick={() => setIsRemoteMinimized(!isRemoteMinimized)}
                  className="h-9 w-9 rounded-full bg-black/60 flex items-center justify-center"
                >
                  {isRemoteMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
              </div>

            </div>
          )}

          {/* ================= LOCAL TILE ================= */}
          {pinnedId !== "local" && (
            <div
              className={cn(
                "relative bg-zinc-900 rounded-xl overflow-hidden",
                isLocalMinimized ? "h-14" : "aspect-video"
              )}
            >

              <StreamPlayer
                stream={localStream}
                muted={true}
                className={cn("w-full h-full object-cover scale-x-[-1]", isVideoOff && "opacity-0")}
              />

              {isVideoOff && !isLocalMinimized && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                  <ProfileImage
                    src={participants.me.image}
                    name={participants.me.name}
                    sizeClass="h-16 w-16 lg:h-20 lg:w-20"
                  />
                </div>
              )}

              {isLocalMinimized && (
                <div className="absolute inset-0 flex items-center gap-2 px-3 bg-zinc-800">
                  <ProfileImage
                    src={participants.me.image}
                    name={participants.me.name}
                    sizeClass="h-8 w-8"
                  />
                  <span className="text-sm font-semibold truncate">You</span>
                </div>
              )}

              {!isLocalMinimized && (
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] font-semibold">
                  You
                </div>
              )}

              <div className="absolute bottom-2 right-2 flex gap-2">
                {isMuted && (
                  <div className="h-9 w-9 rounded-full bg-black/60 flex items-center justify-center">
                    <VolumeX className="w-4 h-4 text-red-400" />
                  </div>
                )}

                <button
                  onClick={() => setPinnedId("local")}
                  className="h-9 w-9 rounded-full bg-black/60 flex items-center justify-center"
                >
                  <Pin size={16} />
                </button>

                <button
                  onClick={() => setIsLocalMinimized(!isLocalMinimized)}
                  className="h-9 w-9 rounded-full bg-black/60 flex items-center justify-center"
                >
                  {isLocalMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
              </div>

            </div>
          )}
        </div>

        <div className="p-4 lg:p-6 bg-zinc-950 border-t border-white/5 flex justify-center">
          <VideoControls
            isVideoOff={isVideoOff}
            isMuted={isMuted}
            showFlip={canFlipCamera}
            onToggleVideo={toggleVideoHandler}
            onToggleAudio={toggleAudioHandler}
            onEndCall={() => router.back()}
            onFlipCamera={flipCamera}
          />
        </div>
      </div>
    </div>
  );
}
