/*
 * File: src/app/video-call/[id]/page.js
 * ROLE: Video Call Client with Whiteboard
 * FEATURES:
 * - WebRTC Video Call
 * - Socket.io Whiteboard Sync
 * - Canvas Drawing
 * - Expert Watermark (VISIBLE ONLY WHILE DRAWING)
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import io from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";

/* ----------------------------------------
 * Watermark Config
 * -------------------------------------- */
const EXPERT_WATERMARK_URL = "https://github.com/shadcn.png";
const WATERMARK_OFFSET = 12;
const WATERMARK_SIZE = 32;
const WATERMARK_HIDE_DELAY = 300; // ms
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export default function VideoCallPage() {
  const { id: meetingId } = useParams();
  const router = useRouter();

  // ---------------- REFS ----------------
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const peerRef = useRef(null);
  const socketRef = useRef(null);
  const iceQueueRef = useRef([]);

  // Watermark state (ref-based = no re-render storms)
  const watermarkRef = useRef(null);
  const watermarkHideTimerRef = useRef(null);

  // ---------------- STATE ----------------
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [, forceRender] = useState(0); // used ONLY to refresh watermark overlay

  // ---------------- INIT ----------------
  useEffect(() => {
    if (!meetingId || socketRef.current) return;

    const processIceQueue = async () => {
      while (iceQueueRef.current.length && peerRef.current) {
        await peerRef.current.addIceCandidate(
          new RTCIceCandidate(iceQueueRef.current.shift())
        );
      }
    };

    const init = async () => {
      try {
        await fetch("/api/socket").catch(() => {});

        const socket = io(undefined, {
          path: "/api/socket_io",
          transports: ["websocket", "polling"],
        });

        socketRef.current = socket;
        socket.emit("join-video", meetingId);

        // ---------- MEDIA ----------
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;

        // ---------- PEER ----------
        const peer = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        peerRef.current = peer;
        stream.getTracks().forEach((t) => peer.addTrack(t, stream));

        peer.ontrack = (e) => {
          remoteVideoRef.current.srcObject = e.streams[0];
          setConnectionStatus("Connected");
        };

        peer.onicecandidate = (e) =>
          e.candidate &&
          socket.emit("ice-candidate", {
            candidate: e.candidate,
            roomId: meetingId,
          });

        socket.emit("client-ready", meetingId);

        socket.on("user-connected", async () => {
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          socket.emit("offer", { offer, roomId: meetingId });
        });

        socket.on("offer", async ({ offer }) => {
          await peer.setRemoteDescription(offer);
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit("answer", { answer, roomId: meetingId });
          processIceQueue();
        });

        socket.on("answer", async ({ answer }) => {
          await peer.setRemoteDescription(answer);
          processIceQueue();
        });

        socket.on("ice-candidate", ({ candidate }) =>
          peer.remoteDescription
            ? peer.addIceCandidate(new RTCIceCandidate(candidate))
            : iceQueueRef.current.push(candidate)
        );

        /* ---------- WHITEBOARD ---------- */
        socket.on("wb-draw", drawOnCanvas);

        socket.on("wb-clear", () => {
          const c = canvasRef.current;
          if (!c) return;

          const ctx = c.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, c.width, c.height);

          watermarkRef.current = null;
          forceRender((v) => v + 1);
        });
      } catch {
        setConnectionStatus("Camera/Mic blocked");
      }
    };

    init();

    return () => {
      socketRef.current?.disconnect();
      localVideoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
      peerRef.current?.close();
    };
  }, [meetingId]);

  // ---------------- DRAW ----------------
  const drawOnCanvas = ({ x0, y0, x1, y1, color, width }) => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(x0 * c.width, y0 * c.height);
    ctx.lineTo(x1 * c.width, y1 * c.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.stroke();

    // SHOW watermark while drawing
    watermarkRef.current = { x: x1, y: y1 };
    forceRender((v) => v + 1);

    // Reset hide timer
    if (watermarkHideTimerRef.current) {
      clearTimeout(watermarkHideTimerRef.current);
    }

    // Hide watermark when drawing stops
    watermarkHideTimerRef.current = setTimeout(() => {
      watermarkRef.current = null;
      forceRender((v) => v + 1);
    }, WATERMARK_HIDE_DELAY);
  };

  // ---------------- RESIZE ----------------
  useEffect(() => {
    const resize = () => {
      if (!canvasRef.current || !containerRef.current) return;

      const temp = document.createElement("canvas");
      temp.width = canvasRef.current.width;
      temp.height = canvasRef.current.height;
      temp.getContext("2d").drawImage(canvasRef.current, 0, 0);

      canvasRef.current.width = containerRef.current.offsetWidth;
      canvasRef.current.height = containerRef.current.offsetHeight;

      const ctx = canvasRef.current.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(temp, 0, 0);
    };

    window.addEventListener("resize", resize);
    setTimeout(resize, 100);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const wm = watermarkRef.current;
  const c = canvasRef.current;

  // ---------------- UI ----------------
  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] bg-zinc-950 overflow-hidden">
      {/* WHITEBOARD */}
      <div ref={containerRef} className="flex-1 relative bg-white">
        <canvas ref={canvasRef} className="w-full h-full touch-none" />

        {wm && c && (
          <img
            src={EXPERT_WATERMARK_URL}
            alt="Expert Watermark"
            className="absolute pointer-events-none z-50 rounded-full border shadow-md"
            style={{
              width: WATERMARK_SIZE,
              height: WATERMARK_SIZE,
              left: clamp(
                wm.x * c.width + WATERMARK_OFFSET,
                0,
                c.width - WATERMARK_SIZE
              ),
              top: clamp(
                wm.y * c.height + WATERMARK_OFFSET,
                0,
                c.height - WATERMARK_SIZE
              ),
            }}
          />
        )}
      </div>

      {/* VIDEO PANEL */}
      <div className="w-full lg:w-96 bg-zinc-900 flex flex-col border-l border-zinc-800">
        <div className="flex-1 relative bg-black">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {connectionStatus !== "Connected" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <Loader2 className="animate-spin text-zinc-400" />
            </div>
          )}
        </div>

        <div className="flex-1 relative bg-zinc-800">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "w-full h-full object-cover",
              isVideoOff && "opacity-0"
            )}
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center">
              <VideoOff className="text-zinc-400" />
            </div>
          )}
        </div>

        <div className="p-4 flex justify-center gap-3 border-t border-zinc-800">
          <Button
            size="icon"
            variant={isMuted ? "destructive" : "secondary"}
            onClick={() => {
              const t =
                localVideoRef.current?.srcObject?.getAudioTracks()[0];
              if (!t) return;
              t.enabled = !t.enabled;
              setIsMuted(!t.enabled);
            }}
          >
            {isMuted ? <MicOff /> : <Mic />}
          </Button>

          <Button
            size="icon"
            variant={isVideoOff ? "destructive" : "secondary"}
            onClick={() => {
              const t =
                localVideoRef.current?.srcObject?.getVideoTracks()[0];
              if (!t) return;
              t.enabled = !t.enabled;
              setIsVideoOff(!t.enabled);
            }}
          >
            {isVideoOff ? <VideoOff /> : <Video />}
          </Button>

          <Button variant="destructive" onClick={() => router.back()}>
            <PhoneOff className="mr-2" /> End
          </Button>
        </div>
      </div>
    </div>
  );
}
