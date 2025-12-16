/*
 * File: src/components/video/Whiteboard.js
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pen, Eraser, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

/* ----------------------------------------
 * Config
 * -------------------------------------- */

const COLORS = [
  { id: "black", hex: "#000000" },
  { id: "red", hex: "#ef4444" },
  { id: "blue", hex: "#3b82f6" },
  { id: "green", hex: "#22c55e" },
];

const EXPERT_WATERMARK_URL = "https://github.com/shadcn.png";
const WATERMARK_OFFSET = 12;
const WATERMARK_SIZE = 32;

/* ----------------------------------------
 * Helpers
 * -------------------------------------- */

const captureCanvasDataURL = (canvas) => {
  if (!canvas) return null;

  const temp = document.createElement("canvas");
  temp.width = canvas.width;
  temp.height = canvas.height;

  const ctx = temp.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, temp.width, temp.height);
  ctx.drawImage(canvas, 0, 0);

  return temp.toDataURL("image/png");
};

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/* ----------------------------------------
 * Component
 * -------------------------------------- */

export default function Whiteboard({ socket, roomId, canvasRef }) {
  const localCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const watermarkRef = useRef(null);

  // FIX: Use state for dimensions so updates trigger a re-render
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const [activeColor, setActiveColor] = useState("#000000");
  const [isEraser, setIsEraser] = useState(false);
  const [watermarkPos, setWatermarkPos] = useState(null);

  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  /* ----------------------------------------
   * Expose API to parent
   * -------------------------------------- */
  useEffect(() => {
    if (!canvasRef) return;

    canvasRef.current = {
      element: localCanvasRef.current,
      getWhiteboardDataURL: () =>
        captureCanvasDataURL(localCanvasRef.current),
    };
  }, [canvasRef]);

  /* ----------------------------------------
   * Socket Listeners
   * -------------------------------------- */
  useEffect(() => {
    if (!socket) return;

    const onDraw = ({ x0, y0, x1, y1, color, width }) => {
      const canvas = localCanvasRef.current;
      if (!canvas) return;

      drawLine(
        x0 * canvas.width,
        y0 * canvas.height,
        x1 * canvas.width,
        y1 * canvas.height,
        color,
        width,
        false
      );

      // Remote stroke → watermark follows
      setWatermarkPos({ x: x1, y: y1 });
    };

    const onClear = () => {
      clearCanvas(false);
      setWatermarkPos(null);
    };

    const onRequestState = ({ requesterId }) => {
      const image = captureCanvasDataURL(localCanvasRef.current);
      socket.emit("wb-send-state", { roomId, image, requesterId });
    };

    const onUpdateState = ({ image }) => {
      const canvas = localCanvasRef.current;
      if (!canvas) return;

      const img = new Image();
      img.onload = () => {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = image;
    };

    socket.on("wb-draw", onDraw);
    socket.on("wb-clear", onClear);
    socket.on("wb-request-state", onRequestState);
    socket.on("wb-update-state", onUpdateState);

    socket.emit("wb-request-state", roomId);

    return () => {
      socket.off("wb-draw", onDraw);
      socket.off("wb-clear", onClear);
      socket.off("wb-request-state", onRequestState);
      socket.off("wb-update-state", onUpdateState);
    };
  }, [socket, roomId]);

  /* ----------------------------------------
   * Resize Handling
   * -------------------------------------- */
  useEffect(() => {
    const canvas = localCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const temp = document.createElement("canvas");
      temp.width = canvas.width;
      temp.height = canvas.height;
      temp.getContext("2d").drawImage(canvas, 0, 0);

      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;

      // FIX: Update state instead of ref
      setCanvasSize({
        width: canvas.width,
        height: canvas.height,
      });

      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(temp, 0, 0, canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // This runs whenever the watermark position or canvas size changes

    
    if (watermarkPos) {
      const { width, height } = canvasSize;
      
      const calculatedLeft = clamp(
        watermarkPos.x * width + WATERMARK_OFFSET,
        0,
        width - WATERMARK_SIZE
      );
      
      const calculatedTop = clamp(
        watermarkPos.y * height + WATERMARK_OFFSET,
        0,
        height - WATERMARK_SIZE
      );

      console.group("🔍 Watermark Debugger");
      console.log("State:", { watermarkPos, canvasSize });
      console.log("Calculated Position (px):", { left: calculatedLeft, top: calculatedTop });
      
      // Check if the element actually exists in the DOM
      if (watermarkRef.current) {
        console.log("✅ DOM Element found:", watermarkRef.current);
        // You can right-click the output above in Chrome Console -> "Reveal in Elements panel"
      } else {
        console.warn("⚠️ DOM Element is missing! (Check if width > 0 condition is met)");
      }
      
      console.groupEnd();
    }
  }, [watermarkPos, canvasSize]);

  /* ----------------------------------------
   * Drawing Logic
   * -------------------------------------- */
  const drawLine = (x0, y0, x1, y1, color, width, emit = true) => {
    const canvas = localCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.closePath();

    if (emit) {
      setWatermarkPos({
        x: x1 / canvas.width,
        y: y1 / canvas.height,
      });

      if (socket) {
        socket.emit("wb-draw", {
          roomId,
          x0: x0 / canvas.width,
          y0: y0 / canvas.height,
          x1: x1 / canvas.width,
          y1: y1 / canvas.height,
          color,
          width,
        });
      }
    }
  };

  const startDrawing = (e) => {
    const canvas = localCanvasRef.current;
    if (!canvas) return;

    isDrawing.current = true;

    const rect = canvas.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;

    lastX.current = x - rect.left;
    lastY.current = y - rect.top;
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    e.preventDefault();

    const canvas = localCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;

    const cx = x - rect.left;
    const cy = y - rect.top;

    drawLine(
      lastX.current,
      lastY.current,
      cx,
      cy,
      isEraser ? "#ffffff" : activeColor,
      isEraser ? 20 : 3,
      true
    );

    lastX.current = cx;
    lastY.current = cy;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = (emit = true) => {
    const canvas = localCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (emit && socket) socket.emit("wb-clear", roomId);
  };

  const handleDownload = () => {
    const dataURL = captureCanvasDataURL(localCanvasRef.current);
    if (!dataURL) return;

    const link = document.createElement("a");
    link.download = `mindnamo-whiteboard-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  /* ----------------------------------------
   * Render
   * -------------------------------------- */
  const { width, height } = canvasSize; // Reading from state now

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-white rounded-lg overflow-hidden shadow-inner cursor-crosshair"
    >
      <canvas
        ref={localCanvasRef}
        className="block touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      {/* Watermark */}
      {watermarkPos && width > 0 && (
        <img
          ref={watermarkRef} /* 2. Attach the ref here */
          id="debug-watermark-img" /* 3. ID for easy querySelector access */
          src={EXPERT_WATERMARK_URL}
          alt="Expert Watermark"
          className="absolute w-8 h-8 rounded-full border-2 border-indigo-500 shadow-md opacity-80 z-50 pointer-events-none"
          style={{
            left: clamp(
              watermarkPos.x * width + WATERMARK_OFFSET,
              0,
              width - WATERMARK_SIZE
            ),
            top: clamp(
              watermarkPos.y * height + WATERMARK_OFFSET,
              0,
              height - WATERMARK_SIZE
            ),
          }}
          // 4. Add error handling to see if the image itself is broken
          onError={(e) => console.error("❌ Watermark image failed to load:", e.target.src)}
        />
      )}

      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white border shadow-lg rounded-full p-2 flex items-center gap-2 z-30">
        <div className="flex gap-1 pr-2 border-r">
          {COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveColor(c.hex);
                setIsEraser(false);
              }}
              className={cn(
                "w-6 h-6 rounded-full border-2",
                activeColor === c.hex && !isEraser
                  ? "border-black scale-110"
                  : "border-transparent"
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        <Button size="icon" onClick={() => setIsEraser(false)}>
          <Pen className="w-4 h-4" />
        </Button>
        <Button size="icon" onClick={() => setIsEraser(true)}>
          <Eraser className="w-4 h-4" />
        </Button>
        <Button size="icon" onClick={() => clearCanvas(true)}>
          <Trash2 className="w-4 h-4 text-red-600" />
        </Button>
        <Button size="icon" onClick={handleDownload}>
          <Download className="w-4 h-4" />
        </Button>
      </div>

      <div className="absolute bottom-4 left-4 text-[10px] text-black/50">
        Synced • {roomId}
      </div>
    </div>
  );
}