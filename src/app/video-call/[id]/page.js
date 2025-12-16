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
  const appointmentId = params.id;

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null); // To track whiteboard container size
  
  const peerRef = useRef(null);
  const socketRef = useRef(null);
  const iceQueueRef = useRef([]);

  // State for UI toggles
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  useEffect(() => {
    if (!appointmentId) return;
    
    // Prevent double init
    if (socketRef.current) return;

    const init = async () => {
      try {
         // Ensure socket server is running
         await fetch("/api/socket").catch(() => {});
         
         const newSocket = io(undefined, { 
             path: "/api/socket_io",
             transports: ["websocket", "polling"]
         });
         socketRef.current = newSocket;

         // 1. Join Room
         newSocket.emit("join-video", appointmentId);

         // 2. Get Media
         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
         if (localVideoRef.current) {
             localVideoRef.current.srcObject = stream;
             localVideoRef.current.muted = true; // Mute self locally to avoid feedback
         }

         // 3. Setup Peer
         const peer = new RTCPeerConnection({
             iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
         });
         peerRef.current = peer;

         stream.getTracks().forEach(track => peer.addTrack(track, stream));

         peer.ontrack = (event) => {
             const [remoteStream] = event.streams;
             if (remoteVideoRef.current) {
                 remoteVideoRef.current.srcObject = remoteStream;
                 remoteVideoRef.current.play().catch(() => {});
                 setConnectionStatus("Connected");
             }
         };

         peer.onicecandidate = (event) => {
             if (event.candidate) {
                 newSocket.emit("ice-candidate", { candidate: event.candidate, roomId: appointmentId });
             }
         };

         // 4. Signaling Events
         newSocket.emit("client-ready", appointmentId);

         newSocket.on("user-connected", async () => {
             console.log("Peer connected, creating offer...");
             const offer = await peer.createOffer();
             await peer.setLocalDescription(offer);
             newSocket.emit("offer", { offer, roomId: appointmentId });
         });

         newSocket.on("offer", async ({ offer }) => {
             console.log("Received offer");
             await peer.setRemoteDescription(new RTCSessionDescription(offer));
             const answer = await peer.createAnswer();
             await peer.setLocalDescription(answer);
             newSocket.emit("answer", { answer, roomId: appointmentId });
             processIceQueue();
         });

         newSocket.on("answer", async ({ answer }) => {
             console.log("Received answer");
             await peer.setRemoteDescription(new RTCSessionDescription(answer));
             processIceQueue();
         });

         newSocket.on("ice-candidate", async ({ candidate }) => {
             if (peer.remoteDescription) {
                 await peer.addIceCandidate(new RTCIceCandidate(candidate));
             } else {
                 iceQueueRef.current.push(candidate);
             }
         });

         // 5. Whiteboard Events
         newSocket.on("wb-draw", drawOnCanvas);
         
         newSocket.on("wb-clear", () => {
             const canvas = canvasRef.current;
             if (canvas) {
                 const ctx = canvas.getContext("2d");
                 ctx.fillStyle = "#ffffff";
                 ctx.fillRect(0, 0, canvas.width, canvas.height);
             }
         });
         
         // Receive sync data from expert
         newSocket.on("wb-update-state", ({ image }) => {
             const img = new Image();
             img.onload = () => canvasRef.current?.getContext("2d").drawImage(img, 0, 0);
             img.src = image;
         });

         // Provide sync data if requested
         newSocket.on("wb-request-state", ({ requesterId }) => {
             const canvas = canvasRef.current;
             if (canvas) {
                 const image = canvas.toDataURL();
                 newSocket.emit("wb-send-state", { roomId: appointmentId, image, requesterId });
             }
         });

      } catch (err) {
          console.error("Init Failed:", err);
          setConnectionStatus("Failed to access camera/mic");
          alert("Failed to access camera/mic. Please allow permissions.");
      }
    };

    const processIceQueue = async () => {
        if (!peerRef.current) return;
        while (iceQueueRef.current.length > 0) {
            const candidate = iceQueueRef.current.shift();
            try { await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) {}
        }
    };

    init();

    return () => {
        if (socketRef.current) socketRef.current.disconnect();
        if (localVideoRef.current?.srcObject) {
            localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        if (peerRef.current) peerRef.current.close();
        socketRef.current = null;
    };
  }, [appointmentId]);

  // --- WHITEBOARD LOGIC ---
  const drawOnCanvas = ({ x0, y0, x1, y1, color, width }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.beginPath();
    ctx.moveTo(x0 * w, y0 * h);
    ctx.lineTo(x1 * w, y1 * h);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  // Handle Resize
  useEffect(() => {
      const handleResize = () => {
          if(canvasRef.current && containerRef.current) {
              // Save current content
              const tempCanvas = document.createElement('canvas');
              const tempCtx = tempCanvas.getContext('2d');
              tempCanvas.width = canvasRef.current.width;
              tempCanvas.height = canvasRef.current.height;
              tempCtx.drawImage(canvasRef.current, 0, 0);

              // Resize
              canvasRef.current.width = containerRef.current.offsetWidth;
              canvasRef.current.height = containerRef.current.offsetHeight;
              
              // Restore content & Background
              const ctx = canvasRef.current.getContext("2d");
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              ctx.drawImage(tempCanvas, 0, 0, canvasRef.current.width, canvasRef.current.height);
          }
      };

      window.addEventListener("resize", handleResize);
      // Initial sizing with a small delay to ensure layout is ready
      setTimeout(handleResize, 100);
      
      return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- CONTROLS ---
  const toggleMute = () => {
      if (localVideoRef.current?.srcObject) {
          const audioTrack = localVideoRef.current.srcObject.getAudioTracks()[0];
          if (audioTrack) {
              audioTrack.enabled = !audioTrack.enabled;
              setIsMuted(!audioTrack.enabled);
          }
      }
  };

  const toggleVideo = () => {
      if (localVideoRef.current?.srcObject) {
          const videoTrack = localVideoRef.current.srcObject.getVideoTracks()[0];
          if (videoTrack) {
              videoTrack.enabled = !videoTrack.enabled;
              setIsVideoOff(!videoTrack.enabled);
          }
      }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] bg-zinc-950 overflow-hidden">
      
      {/* 1. WHITEBOARD AREA 
        - Desktop: Left side, takes remaining space
        - Mobile: Bottom side, takes remaining space
      */}
      <div ref={containerRef} className="flex-1 relative bg-white cursor-crosshair order-2 lg:order-1 overflow-hidden">
        <canvas 
            ref={canvasRef} 
            className="block w-full h-full"
            // Note: Users usually View Only in this setup, but you can add touch listeners here if they are allowed to draw
        />
        <div className="absolute top-4 left-4 bg-zinc-900/80 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-medium pointer-events-none shadow-lg border border-zinc-800">
          Live Whiteboard
        </div>
      </div>

      {/* 2. VIDEO SIDEBAR 
        - Desktop: Right side, fixed width (w-80)
        - Mobile: Top side, fixed height (h-auto), scrollable if needed
      */}
      <div className="w-full lg:w-96 bg-zinc-900 flex flex-row lg:flex-col border-b lg:border-b-0 lg:border-l border-zinc-800 order-1 lg:order-2 shrink-0 z-10 shadow-xl">
        
        {/* Remote Video (Expert) */}
        <div className="flex-1 lg:h-1/2 relative bg-zinc-950 border-r lg:border-r-0 lg:border-b border-zinc-800 overflow-hidden group">
           <video 
             ref={remoteVideoRef} 
             autoPlay 
             playsInline 
             className="w-full h-full object-cover bg-black" 
           />
           <div className="absolute top-0 left-0 w-full p-2 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
             <p className="text-white text-xs font-medium">Expert</p>
           </div>
           
           {/* Status Overlay if not connected */}
           {connectionStatus !== "Connected" && (
             <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/90 z-10">
               <div className="flex flex-col items-center gap-2">
                 <Loader2 className="h-6 w-6 text-zinc-500 animate-spin" />
                 <p className="text-zinc-500 text-xs">{connectionStatus}</p>
               </div>
             </div>
           )}
        </div>

        {/* Local Video (You) */}
        <div className="flex-1 lg:h-1/2 relative bg-zinc-900 overflow-hidden group">
           <video 
             ref={localVideoRef} 
             autoPlay 
             playsInline 
             muted 
             className={cn("w-full h-full object-cover transition-opacity", isVideoOff ? "opacity-0" : "opacity-100")} 
           />
           {isVideoOff && (
             <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                <div className="h-12 w-12 rounded-full bg-zinc-700 flex items-center justify-center">
                    <VideoOff className="h-5 w-5 text-zinc-400" />
                </div>
             </div>
           )}
           <div className="absolute top-0 left-0 w-full p-2 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
             <p className="text-white text-xs font-medium">You</p>
           </div>
        </div>

        {/* Controls (Desktop: Bottom of Sidebar, Mobile: Fixed/Floating or Inline) */}
        <div className="lg:absolute lg:bottom-0 lg:left-0 lg:w-full p-4 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 flex items-center justify-center gap-3">
           <Button 
             size="icon" 
             variant={isMuted ? "destructive" : "secondary"} 
             className="rounded-full h-10 w-10"
             onClick={toggleMute}
           >
             {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
           </Button>
           
           <Button 
             size="icon" 
             variant={isVideoOff ? "destructive" : "secondary"}
             className="rounded-full h-10 w-10"
             onClick={toggleVideo}
           >
             {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
           </Button>

           <Button 
             variant="destructive" 
             className="rounded-full px-6 bg-red-600 hover:bg-red-700 text-white"
             onClick={() => router.back()} // Or window.close() if popped out
           >
             <PhoneOff className="h-4 w-4 mr-2" /> End
           </Button>
        </div>
      </div>
    </div>
  );
}