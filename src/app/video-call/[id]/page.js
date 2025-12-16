/*
 * File: src/app/video-call/[id]/page.js
 * ROLE: Video Call Client with Whiteboard
 * FEATURES: WebRTC, Socket.io, Canvas API, Mobile Responsive
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import io from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VideoCallPage() {
  const params = useParams();
  const router = useRouter();

  // IMPORTANT: params.id is the secure meetingId (NOT Mongo _id)
  const meetingId = params.id;

  // ---------------- REFS ----------------
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const peerRef = useRef(null);
  const socketRef = useRef(null);
  const iceQueueRef = useRef([]);

  // ---------------- STATE ----------------
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  // ---------------- INIT ----------------
  useEffect(() => {
    if (!meetingId) return;
    if (socketRef.current) return; // prevent double init

    const processIceQueue = async () => {
      if (!peerRef.current) return;
      while (iceQueueRef.current.length) {
        const candidate = iceQueueRef.current.shift();
        try {
          await peerRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch {}
      }
    };

    const init = async () => {
      try {
        // Ensure socket server boot
        await fetch("/api/socket").catch(() => {});

        const socket = io(undefined, {
          path: "/api/socket_io",
          transports: ["websocket", "polling"],
        });

        socketRef.current = socket;

        // Join secure room
        socket.emit("join-video", meetingId);

        // Media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
        }

        // Peer
        const peer = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        peerRef.current = peer;
        stream.getTracks().forEach((t) => peer.addTrack(t, stream));

        peer.ontrack = (e) => {
          const [remoteStream] = e.streams;
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(() => {});
            setConnectionStatus("Connected");
          }
        };

        peer.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit("ice-candidate", {
              candidate: e.candidate,
              roomId: meetingId,
            });
          }
        };

        // ---------------- SIGNALING ----------------
        socket.emit("client-ready", meetingId);

        socket.on("user-connected", async () => {
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          socket.emit("offer", { offer, roomId: meetingId });
        });

        socket.on("offer", async ({ offer }) => {
          await peer.setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit("answer", { answer, roomId: meetingId });
          processIceQueue();
        });

        socket.on("answer", async ({ answer }) => {
          await peer.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          processIceQueue();
        });

        socket.on("ice-candidate", async ({ candidate }) => {
          if (peer.remoteDescription) {
            await peer.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } else {
            iceQueueRef.current.push(candidate);
          }
        });

        // ---------------- WHITEBOARD ----------------
        socket.on("wb-draw", drawOnCanvas);

        socket.on("wb-clear", () => {
          const c = canvasRef.current;
          if (!c) return;
          const ctx = c.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, c.width, c.height);
        });

        socket.on("wb-update-state", ({ image }) => {
          const img = new Image();
          img.onload = () =>
            canvasRef.current
              ?.getContext("2d")
              .drawImage(img, 0, 0);
          img.src = image;
        });

        socket.on("wb-request-state", ({ requesterId }) => {
          const c = canvasRef.current;
          if (!c) return;
          socket.emit("wb-send-state", {
            roomId: meetingId,
            requesterId,
            image: c.toDataURL(),
          });
        });
      } catch (err) {
        console.error(err);
        setConnectionStatus("Camera/Mic blocked");
        alert("Please allow camera & microphone access.");
      }
    };

    init();

    return () => {
      socketRef.current?.disconnect();
      localVideoRef.current?.srcObject
        ?.getTracks()
        .forEach((t) => t.stop());
      peerRef.current?.close();
      socketRef.current = null;
    };
  }, [meetingId]);

  // ---------------- WHITEBOARD DRAW ----------------
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
  };

  // ---------------- CANVAS RESIZE ----------------
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

  // ---------------- CONTROLS ----------------
  const toggleMute = () => {
    const track = localVideoRef.current?.srcObject?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
  };

  const toggleVideo = () => {
    const track = localVideoRef.current?.srcObject?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsVideoOff(!track.enabled);
  };

  // ---------------- UI ----------------
  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] bg-zinc-950 overflow-hidden">
      {/* WHITEBOARD */}
      <div
        ref={containerRef}
        className="flex-1 relative bg-white order-2 lg:order-1"
      >
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute top-4 left-4 bg-zinc-900/80 text-white px-3 py-1 rounded-full text-xs">
          Live Whiteboard
        </div>
      </div>

      {/* VIDEO SIDEBAR */}
      <div className="w-full lg:w-96 bg-zinc-900 flex flex-col border-l border-zinc-800">
        {/* Remote */}
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

        {/* Local */}
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

        {/* CONTROLS */}
        <div className="p-4 flex justify-center gap-3 border-t border-zinc-800">
          <Button size="icon" variant={isMuted ? "destructive" : "secondary"} onClick={toggleMute}>
            {isMuted ? <MicOff /> : <Mic />}
          </Button>

          <Button size="icon" variant={isVideoOff ? "destructive" : "secondary"} onClick={toggleVideo}>
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
