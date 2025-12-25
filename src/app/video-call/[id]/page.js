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

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import io from "socket.io-client";
import {
  Loader2,
  Volume2,
  VolumeX,
  ShieldCheck,
  Pin,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

import Whiteboard from "@/components/video/Whiteboard";
import VideoControls from "@/components/video/VideoControls";
import ProfileImage from "@/components/ProfileImage";
import { getMeetingSession } from "@/actions/video";

export default function VideoCallPage() {
  const { id: meetingId } = useParams();
  const router = useRouter();

  /* -------------------- TIME (HYDRATION SAFE) -------------------- */
  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    const update = () =>
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);

  /* -------------------- STATE -------------------- */
  const [participants, setParticipants] = useState({
    me: { name: "You", image: null },
    other: { name: "Loading...", image: null },
  });

  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

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
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const stageLocalVideoRef = useRef(null);
  const stageRemoteVideoRef = useRef(null);

  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const iceQueue = useRef([]);

  /* -------------------- STREAM SYNC -------------------- */
  useEffect(() => {
    const ref = pinnedId === "local" ? stageLocalVideoRef : localVideoRef;
    if (localStream && ref.current) ref.current.srcObject = localStream;
  }, [localStream, pinnedId, isVideoOff]);

  useEffect(() => {
    const ref = pinnedId === "remote" ? stageRemoteVideoRef : remoteVideoRef;
    if (remoteStream && ref.current) ref.current.srcObject = remoteStream;
  }, [remoteStream, pinnedId, remoteVideoOff]);

  /* -------------------- PARTICIPANTS -------------------- */
  useEffect(() => {
    (async () => {
      const res = await getMeetingSession(meetingId);
      if (res?.success) {
        setParticipants({
          me: res.data.me,
          other: res.data.other,
        });
      }
    })();
  }, [meetingId]);

  /* -------------------- MEDIA CONTROLS -------------------- */
  const toggleVideoHandler = useCallback(() => {
    const t = localStream?.getVideoTracks()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setIsVideoOff(!t.enabled);
    socketRef.current?.emit("video-state-change", {
      roomId: meetingId,
      enabled: t.enabled,
    });
  }, [localStream, meetingId]);

  const toggleAudioHandler = useCallback(() => {
    const t = localStream?.getAudioTracks()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setIsMuted(!t.enabled);
  }, [localStream]);

  /* -------------------- WEBRTC -------------------- */
  const initializeWebRTC = useCallback(async () => {
    try {
      await fetch("/api/socket").catch(() => {});
      const socket = io(undefined, {
        path: "/api/socket_io",
        transports: ["websocket"],
      });
      socketRef.current = socket;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerRef.current = peer;

      stream.getTracks().forEach((t) => peer.addTrack(t, stream));

      peer.ontrack = (e) => {
        setRemoteStream(e.streams[0]);
        setConnectionStatus("Connected");
      };

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice-candidate", {
            candidate: e.candidate,
            roomId: meetingId,
          });
        }
      };

      socket.emit("join-video", meetingId);
      socket.emit("client-ready", meetingId);

      socket.on("user-connected", async () => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("offer", { offer, roomId: meetingId });
      });

      socket.on("offer", async ({ offer }) => {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("answer", { answer, roomId: meetingId });

        while (iceQueue.current.length) {
          peer.addIceCandidate(new RTCIceCandidate(iceQueue.current.shift()));
        }
      });

      socket.on("answer", async ({ answer }) => {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on("ice-candidate", ({ candidate }) => {
        if (peer.remoteDescription) {
          peer.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          iceQueue.current.push(candidate);
        }
      });

      socket.on("remote-video-state", ({ enabled }) => {
        setRemoteVideoOff(!enabled);
      });
    } catch {
      setConnectionStatus("Access Denied");
    }
  }, [meetingId]);

  useEffect(() => {
    initializeWebRTC();
    navigator.mediaDevices.enumerateDevices().then((d) =>
      setCanFlipCamera(d.filter((x) => x.kind === "videoinput").length > 1)
    );
    return () => {
      socketRef.current?.disconnect();
      localStream?.getTracks().forEach((t) => t.stop());
      peerRef.current?.close();
    };
  }, [initializeWebRTC]);

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
            <video
              ref={stageRemoteVideoRef}
              autoPlay
              playsInline
              muted={isRemoteMuted}
              className={cn(
                "w-full h-full object-cover",
                remoteVideoOff && "hidden"
              )}
            />
          )}

          {pinnedId === "local" && (
            <video
              ref={stageLocalVideoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "w-full h-full object-cover",
                isVideoOff && "hidden"
              )}
            />
          )}

          <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 rounded-lg flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span className="text-[10px] font-bold uppercase hidden sm:inline">
              Secure Session
            </span>
          </div>
        </div>

        {connectionStatus !== "Connected" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 rounded-2xl m-2 lg:m-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          </div>
        )}
      </div>

      {/* ================= SIDEBAR / DRAWER ================= */}
      <div className="w-full lg:w-80 flex flex-col border-t lg:border-l border-white/5 bg-[#111] shrink-0">

        <div className="p-3 lg:p-4 grid grid-cols-2 lg:grid-cols-1 gap-3 overflow-y-auto max-h-[30vh] lg:max-h-full">

          {/* ================= REMOTE TILE ================= */}
          {pinnedId !== "remote" && (
            <div
              className={cn(
                "relative bg-zinc-900 rounded-xl overflow-hidden",
                isRemoteMinimized ? "h-14" : "aspect-video"
              )}
            >
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted={isRemoteMuted}
                className={cn(
                  "w-full h-full object-cover",
                  (remoteVideoOff || isRemoteMinimized) && "hidden"
                )}
              />

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

              <div className="absolute top-2 right-2 flex gap-2">
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
                  {isRemoteMinimized ? (
                    <Maximize2 size={16} />
                  ) : (
                    <Minimize2 size={16} />
                  )}
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
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "w-full h-full object-cover",
                  (isVideoOff || isLocalMinimized) && "hidden"
                )}
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

              <div className="absolute top-2 right-2 flex gap-2">
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
                  {isLocalMinimized ? (
                    <Maximize2 size={16} />
                  ) : (
                    <Minimize2 size={16} />
                  )}
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
          />
        </div>
      </div>
    </div>
  );
}
