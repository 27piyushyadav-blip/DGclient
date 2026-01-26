/*
 * File: src/components/video/Whiteboard.js
 * ROLE: Professional A4 Whiteboard with Letterhead & Auto-Hiding Expert Watermark.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

/* ----------------------------------------
 * Constants & Local Helpers
 * -------------------------------------- */
const EXPERT_WATERMARK_DEFAULT = "https://github.com/shadcn.png";
const WATERMARK_SIZE = 32;
const WATERMARK_OFFSET = 12;
const A4_RATIO = 1.4142; // Height-to-Width ratio
const HIDE_DELAY = 1000; // ms before watermark disappears

// ✅ Local clamp to avoid build/runtime errors
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export default function Whiteboard({
  socket,
  roomId,
  expertName = "Expert Consultant",
  expertImage = "",
}: {
  socket: any;
  roomId: string;
  expertName?: string;
  expertImage?: string;
}) {
  const localCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  /* -------------------- STATE -------------------- */
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [watermarkPos, setWatermarkPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* ----------------------------------------
   * Auto-Hide Logic (Expert stops drawing)
   * -------------------------------------- */
  const resetHideTimer = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setWatermarkPos(null);
    }, HIDE_DELAY);
  };

  /* ----------------------------------------
   * Letterhead Engine (Professional Branding)
   * -------------------------------------- */
  const drawLetterhead = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const margin = w * 0.05;
    const headerHeight = h * 0.12;

    // Header background
    ctx.fillStyle = "#fcfcfc";
    ctx.fillRect(0, 0, w, headerHeight);

    // Accent line
    ctx.fillStyle = "#6366f1";
    ctx.fillRect(0, headerHeight - 3, w, 3);

    // Expert Name
    ctx.textAlign = "left";
    ctx.fillStyle = "#1e293b";
    ctx.font = `bold ${Math.max(14, w * 0.035)}px sans-serif`;
    ctx.fillText(expertName.toUpperCase(), margin, headerHeight * 0.45);

    // Subtitle
    ctx.fillStyle = "#64748b";
    ctx.font = `${Math.max(10, w * 0.02)}px sans-serif`;
    ctx.fillText(
      "MINDNAMO CERTIFIED CONSULTATION",
      margin,
      headerHeight * 0.7
    );

    // Metadata
    ctx.textAlign = "right";
    ctx.font = `italic ${Math.max(10, w * 0.018)}px sans-serif`;
    ctx.fillText(`Sheet: ${currentPage}`, w - margin, headerHeight * 0.45);
    ctx.fillText(
      new Date().toLocaleDateString(),
      w - margin,
      headerHeight * 0.7
    );
  };

  /* ----------------------------------------
   * Canvas Helpers
   * -------------------------------------- */
  const clearCanvasUI = () => {
    const canvas = localCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawLetterhead(ctx, canvas.width, canvas.height);
  };

  /* ----------------------------------------
   * Socket Listeners
   * -------------------------------------- */
  useEffect(() => {
    if (!socket || !localCanvasRef.current) return;

    const canvas = localCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const onDraw = ({ x0, y0, x1, y1, color, width }) => {
      ctx.beginPath();
      ctx.moveTo(x0 * canvas.width, y0 * canvas.height);
      ctx.lineTo(x1 * canvas.width, y1 * canvas.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.stroke();

      // Watermark follows draw
      setWatermarkPos({ x: x1, y: y1 });
      resetHideTimer();
    };

    const onPageChange = ({ page, total }) => {
      setCurrentPage(page);
      setTotalPages(total || totalPages);
      clearCanvasUI();
    };

    socket.on("wb-draw", onDraw);
    socket.on("wb-page-change", onPageChange);
    socket.on("wb-clear", clearCanvasUI);

    return () => {
      socket.off("wb-draw", onDraw);
      socket.off("wb-page-change", onPageChange);
      socket.off("wb-clear", clearCanvasUI);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [socket, expertName, currentPage, totalPages]);

  /* ----------------------------------------
   * Resize Handling (A4 Constraint)
   * -------------------------------------- */
  useEffect(() => {
    if (!containerRef.current || !localCanvasRef.current) return;

    const handleResize = () => {
      const container = containerRef.current;
      const canvas = localCanvasRef.current;
      if (!container || !canvas) return;

      let w = container.offsetWidth - 40;
      let h = w * A4_RATIO;

      if (h > container.offsetHeight - 40) {
        h = container.offsetHeight - 40;
        w = h / A4_RATIO;
      }

      canvas.width = w;
      canvas.height = h;
      setCanvasSize({ width: w, height: h });
      clearCanvasUI();
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);
    handleResize();

    return () => observer.disconnect();
  }, []);

  /* ----------------------------------------
   * Export
   * -------------------------------------- */
  const handleDownload = () => {
    const canvas = localCanvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement("a");
    link.download = `Consultation-Note-P${currentPage}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const { width, height } = canvasSize;

  /* ----------------------------------------
   * UI
   * -------------------------------------- */
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 overflow-hidden"
    >
      {/* A4 Canvas */}
      <div className="relative shadow-2xl bg-white border border-zinc-200">
        <canvas ref={localCanvasRef} className="block pointer-events-none" />

        {/* Auto-Hiding Expert Watermark */}
        {watermarkPos && width > 0 && (
          <div
            className="absolute z-50 pointer-events-none transition-all duration-75 ease-out animate-in fade-in"
            style={{
              width: WATERMARK_SIZE,
              height: WATERMARK_SIZE,
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
          >
            <img
              src={expertImage || EXPERT_WATERMARK_DEFAULT}
              alt="Expert"
              /* aspect-square + object-cover + rounded-full = Perfect Circle */
              className="w-full h-full aspect-square object-cover rounded-full border-2 border-indigo-500 shadow-lg bg-white"
            />
            {/* Removed the "is writing..." text badge logic here */}
          </div>
        )}
      </div>

      {/* Overlays */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-full px-5 py-2.5 flex items-center gap-6">
          <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-400">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </div>
          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-900 dark:text-zinc-100">
            <FileText className="w-4 h-4 text-indigo-500" />
            Sheet {currentPage} of {totalPages}
          </div>
        </div>

        <Button
          size="icon"
          variant="secondary"
          className="rounded-full shadow-lg h-11 w-11 bg-white hover:bg-zinc-50 border border-zinc-200"
          onClick={handleDownload}
        >
          <Download className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
