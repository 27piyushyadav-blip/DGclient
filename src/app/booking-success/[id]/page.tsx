"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProfileImage from "@/components/ProfileImage";
import {
  CheckCircle2,
  Calendar,
  Clock,
  Video,
  MapPin,
  ArrowRight,
  Home,
  Loader2,
  Check,
  CreditCard,
  CalendarPlus,
  FileText,
  Download,
} from "lucide-react";
import { getBookingDetailsApi, getPublicBookingDetailsApi } from "@/lib/bookingsApi";
import { useAuth } from "@/contexts/AuthContext";

// ─── Receipt HTML builder (mirrors the Velvetbook email template) ────────────
function buildReceiptHtml(r: {
  invoiceNumber: string;
  date: string;
  bookingId: string;
  type: string;
  customerName: string;
  customerEmail: string;
  orgName: string;
  orgAddress?: string;
  orgPhone?: string;
  orgEmail?: string;
  services: Array<{ name: string; price: number; quantity: number }>;
  subtotal: number;
  tax: number;
  discount: number;
  amount: number;
}) {
  const isRefund = r.type === "refund";
  const accentColor = isRefund ? "#10b981" : "#4f46e5";
  const statusLabel = isRefund ? "REFUNDED" : "PAID";
  const statusBg = isRefund ? "#d1fae5" : "#e0e7ff";
  const statusFg = isRefund ? "#065f46" : "#3730a3";
  const typeLabel = isRefund
    ? "Refund / Credit"
    : r.type === "edit_service"
    ? "Service Change"
    : "New Purchase";

  const rowsHtml = r.services
    .map(
      (svc, idx) => `
      <tr style="border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;">
        <td style="padding:12px 0;text-align:left;">${idx + 1}</td>
        <td style="padding:12px 0;text-align:left;font-weight:500;color:#0f172a;">${svc.name}</td>
        <td style="padding:12px 0;text-align:right;">${svc.quantity}</td>
        <td style="padding:12px 0;text-align:right;">${Number(svc.price).toFixed(2)}</td>
        <td style="padding:12px 0;text-align:right;">18%</td>
        <td style="padding:12px 0;text-align:right;font-weight:600;color:#0f172a;">
          ${(Number(svc.price) * svc.quantity).toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Payment Receipt – ${r.invoiceNumber}</title>
  <style>
    @media print {
      html,body { margin:0; padding:0; }
      .no-print { display:none; }
    }
    body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
           background:#f8fafc;padding:40px 10px;color:#1e293b;line-height:1.5; }
  </style>
</head>
<body>
<div style="max-width:700px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.03);">
  <!-- accent bar -->
  <div style="background:${accentColor};height:8px;"></div>

  <div style="padding:40px 32px;">
    <!-- Header -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:30px;">
      <tr>
        <td style="vertical-align:top;">
          <h1 style="margin:0;font-size:26px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:-.025em;">${r.orgName}</h1>
          <p style="margin:4px 0 0;font-size:12px;color:#64748b;">Powered by Velvetbook</p>
        </td>
        <td style="vertical-align:top;text-align:right;">
          <h2 style="margin:0;font-size:24px;font-weight:800;color:${accentColor};text-transform:uppercase;letter-spacing:.05em;">
            ${isRefund ? "CREDIT NOTE" : "INVOICE"}
          </h2>
          <p style="margin:6px 0 0;font-size:13px;color:#475569;"><strong>Invoice #</strong> ${r.invoiceNumber}</p>
          <p style="margin:2px 0 0;font-size:13px;color:#64748b;"><strong>Date:</strong> ${r.date}</p>
        </td>
      </tr>
    </table>

    <!-- Billing info -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:35px;background:#fafafa;border-radius:12px;border:1px solid #f1f1f1;">
      <tr>
        <!-- Bill From -->
        <td style="width:33.33%;padding:20px;vertical-align:top;border-right:1px solid #f1f1f1;">
          <p style="margin:0 0 8px;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;">BILL FROM</p>
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#1e293b;">${r.orgName}</p>
          ${r.orgAddress ? `<p style="margin:0 0 4px;font-size:12px;color:#64748b;line-height:1.4;">${r.orgAddress}</p>` : ""}
          ${r.orgPhone ? `<p style="margin:0 0 4px;font-size:12px;color:#64748b;">📞 ${r.orgPhone}</p>` : ""}
          ${r.orgEmail ? `<p style="margin:0;font-size:12px;color:#64748b;">✉️ ${r.orgEmail}</p>` : ""}
        </td>
        <!-- Bill To -->
        <td style="width:33.33%;padding:20px;vertical-align:top;border-right:1px solid #f1f1f1;">
          <p style="margin:0 0 8px;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;">BILL TO</p>
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#1e293b;">${r.customerName}</p>
          ${r.customerEmail ? `<p style="margin:0;font-size:12px;color:#64748b;">✉️ ${r.customerEmail}</p>` : ""}
        </td>
        <!-- Invoice For -->
        <td style="width:33.33%;padding:20px;vertical-align:top;">
          <p style="margin:0 0 8px;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;">INVOICE FOR</p>
          <p style="margin:0 0 4px;font-size:12px;color:#475569;">
            <strong>Booking ID:</strong> <span style="font-family:monospace;font-size:11px;">#${r.bookingId.slice(0, 8).toUpperCase()}</span>
          </p>
          <p style="margin:0 0 4px;font-size:12px;color:#475569;"><strong>Type:</strong> ${typeLabel}</p>
          <p style="margin:0;font-size:12px;color:#475569;">
            <strong>Status:</strong>
            <span style="display:inline-block;padding:2px 8px;background:${statusBg};color:${statusFg};font-size:10px;font-weight:700;border-radius:9999px;">${statusLabel}</span>
          </p>
        </td>
      </tr>
    </table>

    <!-- Items table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:30px;">
      <thead>
        <tr style="border-bottom:2px solid #e2e8f0;text-align:left;font-size:11px;font-weight:700;color:#475569;">
          <th style="padding-bottom:10px;text-align:left;width:50px;">#</th>
          <th style="padding-bottom:10px;text-align:left;">DESCRIPTION</th>
          <th style="padding-bottom:10px;text-align:right;width:60px;">QTY</th>
          <th style="padding-bottom:10px;text-align:right;width:100px;">UNIT PRICE</th>
          <th style="padding-bottom:10px;text-align:right;width:80px;">TAX (%)</th>
          <th style="padding-bottom:10px;text-align:right;width:110px;">AMOUNT</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>

    <!-- Notes + Summary -->
    <table style="width:100%;border-collapse:collapse;margin-top:10px;">
      <tr>
        <td style="width:55%;vertical-align:top;padding-right:40px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">NOTES</p>
          <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">
            Thank you for your business! This is an automatically generated receipt for your records.
          </p>
        </td>
        <td style="width:45%;vertical-align:top;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;color:#475569;">
            <tr>
              <td style="padding:6px 0;text-align:left;">Subtotal</td>
              <td style="padding:6px 0;text-align:right;font-weight:600;color:#1e293b;">${Number(r.subtotal).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;text-align:left;">Tax (GST 18%)</td>
              <td style="padding:6px 0;text-align:right;font-weight:600;color:#1e293b;">${Number(r.tax).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;text-align:left;">Discount</td>
              <td style="padding:6px 0;text-align:right;font-weight:600;color:#10b981;">-${Number(r.discount || 0).toFixed(2)}</td>
            </tr>
            <tr style="border-top:1px solid #e2e8f0;">
              <td style="padding:12px 0 0;text-align:left;font-size:15px;font-weight:800;color:#0f172a;">TOTAL</td>
              <td style="padding:12px 0 0;text-align:right;font-size:18px;font-weight:800;color:${accentColor};">
                ${Number(r.amount).toFixed(2)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Footer contact -->
    <div style="margin-top:50px;padding-top:20px;border-top:1px solid #f1f5f9;text-align:center;font-size:12px;color:#94a3b8;">
      <p style="margin:0;">
        ${r.orgPhone ? `📞 ${r.orgPhone}  •  ` : ""}
        ${r.orgEmail ? `✉️ ${r.orgEmail}  •  ` : ""}
        ${r.orgName}
      </p>
      <p style="margin:4px 0 0;">This transaction is securely processed in accordance with our terms of service.</p>
    </div>
  </div>
</div>
</body>
</html>`;
}

// ─── Trigger print-to-PDF in a hidden iframe ─────────────────────────────────
function downloadReceiptAsPdf(html: string, filename: string) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "-9999px";
  iframe.style.left = "-9999px";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();

  // Give styles time to load then trigger print dialog
  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => document.body.removeChild(iframe), 2000);
      }
    }, 300);
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !id) return;

    async function loadDetails() {
      // 1. Try public/unauthenticated fetch first (works for voice bookings)
      try {
        const res = await getPublicBookingDetailsApi(id);
        setBookingDetails(res);
        setLoading(false);
        return;
      } catch (publicErr) {
        // Not a public booking, so we check authentication
        if (!isAuthenticated) {
          router.push("/login");
          return;
        }

        // 2. If authenticated, try the standard endpoint
        try {
          const res = await getBookingDetailsApi(id);
          setBookingDetails(res);
        } catch (authErr: any) {
          console.error("Failed to load booking details:", authErr);
          setError("Could not load booking details.");
        } finally {
          setLoading(false);
        }
      }
    }

    loadDetails();
  }, [id, isAuthenticated, authLoading, router]);

  // ── Download receipt handler ─────────────────────────────────────────────
  const handleDownloadReceipt = useCallback(async () => {
    if (receiptLoading) return;
    setReceiptLoading(true);
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(
        `${apiBase}/bookings/public/${id}/receipt`
      );
      if (!res.ok) throw new Error("Failed to fetch receipt data");
      const data = await res.json();
      const html = buildReceiptHtml(data);
      downloadReceiptAsPdf(html, `payment-receipt-${id.slice(0, 8)}.pdf`);
    } catch (err) {
      console.error("Receipt download failed:", err);
      alert("Could not generate receipt. Please try again.");
    } finally {
      setReceiptLoading(false);
    }
  }, [id, receiptLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-zinc-50 dark:bg-zinc-950 px-4">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-4">{error || "Booking not found."}</p>
          <Link href="/">
            <Button variant="outline" className="text-black bg-white">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Support both nested structure and flat structure safely
  const booking = bookingDetails.booking || bookingDetails;
  const expert = bookingDetails.expert || bookingDetails.expertInfo || booking.expert || null;
  const expertProfile = bookingDetails.expertProfile || bookingDetails.expertProfileInfo || booking.expertProfile || null;
  const organization = bookingDetails.organization || bookingDetails.organizationInfo || booking.organization || null;

  const expertName = expert?.name || "Expert";
  const expertProfilePicture = expert?.avatar || expert?.image || expert?.profilePicture || null;
  const expertSpecialization = expertProfile?.specialization || expert?.specialization || expert?.role || "Specialist";

  const isVideo = booking.consultationType === "online" || booking.consultationType === "Video Call";

  let isVoiceBooking = false;
  try {
    if (booking.notes) {
      const parsed = JSON.parse(booking.notes);
      isVoiceBooking = !!parsed.isVoiceCallBooking;
    }
  } catch (e) {}

  let formattedDate = "N/A";
  let formattedShortDate = "N/A";
  let formattedTime = "N/A";

  if (booking.scheduledDate) {
    const bookingDate = new Date(booking.scheduledDate);
    if (!isNaN(bookingDate.getTime())) {
      formattedDate = bookingDate.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      formattedShortDate = bookingDate.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      formattedTime = bookingDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  const serviceName = booking.service || "Service";
  const serviceImage =
    booking.serviceImage ||
    expertProfilePicture ||
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop";
  const amount = booking.amount ?? 0;
  const durationMinutes = booking.duration || 30;
  const experienceText = expert?.experienceYears
    ? `${expert.experienceYears}+ Years Exp.`
    : expertSpecialization;
  const locationName = organization?.name || (isVideo ? "Online Session" : "Clinic Visit");
  const locationAddress = organization?.address || organization?.location || organization?.city || "";
  const paymentLabel = booking.paymentMethod || booking.paymentMethodLabel || "Card payment";
  const bookingRef = `#${String(booking._id || booking.id || id).toUpperCase()}`;

  const addToGoogleCalendar = () => {
    const formatGoogleCalendarDate = (date: Date) =>
      date
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}Z$/, "Z");

    const start = new Date(booking.scheduledDate || "2026-06-18T04:30:00.000Z");
    const end = new Date(start.getTime() + (booking.duration || 60) * 60 * 1000);

    const dates = `${formatGoogleCalendarDate(start)}/${formatGoogleCalendarDate(end)}`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(serviceName)}&dates=${dates}&details=${encodeURIComponent(`${serviceName} with ${expertName}`)}&location=${encodeURIComponent(locationAddress || locationName)}&sf=true&output=xml`;

    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
      {/* ── Desktop Card ── */}
      <div className="hidden md:block w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-500">

        {/* Success Header */}
        <div className="bg-green-600 p-8 text-center text-white">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-green-100">
            Your session has been scheduled. A confirmation email is on its way.
          </p>
        </div>

        {/* Appointment Details */}
        <div className="p-8 space-y-8">

          {/* Expert Info */}
          <div className="flex items-center gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <ProfileImage
              src={expertProfilePicture}
              name={expertName}
              sizeClass="w-16 h-16"
              textClass="text-xl"
            />
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">Appointment with</p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{expertName}</h3>
              <p className="text-sm text-primary font-medium">{expertSpecialization}</p>
            </div>
          </div>

          {/* Session Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              <Calendar className="w-5 h-5 text-zinc-500 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase">Date</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              <Clock className="w-5 h-5 text-zinc-500 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase">Time</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{formattedTime}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              {isVideo ? <Video className="w-5 h-5 text-zinc-500 mt-0.5" /> : <MapPin className="w-5 h-5 text-zinc-500 mt-0.5" />}
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase">Type</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {isVideo ? "Video Call" : `In-Person (${organization?.name || "Clinic Visit"})`}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {isVoiceBooking ? (
              <>
                <Button
                  id="download-receipt-btn-desktop"
                  className="w-full h-12 text-base bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-md rounded-xl"
                  onClick={handleDownloadReceipt}
                  disabled={receiptLoading}
                >
                  {receiptLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {receiptLoading ? "Generating…" : "Download Payment Receipt"}
                </Button>
                <Link href="/">
                  <Button variant="outline" className="w-full h-12 border-zinc-200 dark:border-zinc-700 bg-white text-black hover:bg-slate-50 hover:text-black">
                    <Home className="w-4 h-4 mr-2" /> Back to Home
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/appointments">
                  <Button className="w-full h-12 text-base bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900">
                    View My Appointments <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full h-12 border-zinc-200 dark:border-zinc-700 bg-white text-black hover:bg-slate-50 hover:text-black">
                    <Home className="w-4 h-4 mr-2" /> Back to Home
                  </Button>
                </Link>
              </>
            )}
          </div>

        </div>
      </div>

      {/* ── Mobile View ── */}
      <div className="block md:hidden fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-zinc-950 pb-10">

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">

          {/* Success indicator */}
          <div className="flex flex-col items-center pt-4 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/30">
              <Check className="h-9 w-9 text-white" strokeWidth={3} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Your booking is confirmed!</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">We look forward to seeing you.</p>
          </div>

          {/* Details card */}
          <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">

            {/* Service */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-16 w-16 shrink-0 rounded-xl bg-cover bg-center bg-slate-200"
                  style={{ backgroundImage: `url('${serviceImage}')` }}
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{serviceName}</h3>
                  <div className="mt-1 flex items-center gap-1 text-slate-500 dark:text-zinc-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{durationMinutes} min</span>
                  </div>
                </div>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">${amount}</span>
            </div>

            <div className="my-4 border-t border-slate-100 dark:border-zinc-800" />

            {/* Barber */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Barber</span>
              <div className="flex items-center gap-2">
                <ProfileImage
                  src={expertProfilePicture}
                  name={expertName}
                  sizeClass="w-8 h-8"
                  textClass="text-xs"
                />
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{expertName}</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{experienceText}</p>
                </div>
              </div>
            </div>

            <div className="my-4 border-t border-slate-100 dark:border-zinc-800" />

            {/* Date & Time */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Date &amp; Time</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-zinc-300">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {formattedShortDate}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-zinc-300">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {formattedTime}
                </span>
              </div>
            </div>

            <div className="my-4 border-t border-slate-100 dark:border-zinc-800" />

            {/* Location */}
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Location</span>
              <div className="flex items-start gap-1.5 text-right">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-zinc-200">{locationName}</p>
                  {locationAddress ? (
                    <p className="text-xs text-slate-400 dark:text-zinc-500">{locationAddress}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="my-4 border-t border-slate-100 dark:border-zinc-800" />

            {/* Payment */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Payment</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-zinc-300">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                  {paymentLabel}
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">${amount}</span>
              </div>
            </div>

            <div className="my-4 border-t border-slate-100 dark:border-zinc-800" />

            {/* Booking ID */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Booking ID</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200 w-[175px]">{bookingRef}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex gap-3">
            {isVoiceBooking ? (
              <>
                <button
                  id="download-receipt-btn-mobile"
                  type="button"
                  onClick={handleDownloadReceipt}
                  disabled={receiptLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 disabled:opacity-60"
                >
                  {receiptLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {receiptLoading ? "Generating…" : "Download Payment Receipt"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white py-3 text-sm font-semibold text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  Back to Home
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={addToGoogleCalendar}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white py-3 text-sm font-semibold text-blue-600 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Add to Calendar
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/appointments")}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25"
                >
                  View My Bookings
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}