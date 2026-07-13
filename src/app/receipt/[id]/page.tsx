"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPublicBookingDetailsApi } from "@/lib/bookingsApi";
import { Loader2, Printer, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReceiptPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    async function loadBooking() {
      setLoading(true);
      setError("");
      try {
        const details = await getPublicBookingDetailsApi(id);
        setBookingDetails(details);
      } catch (err: any) {
        console.error("Failed to load booking details:", err);
        setError(err.message || "Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [id]);

  useEffect(() => {
    if (bookingDetails && typeof window !== "undefined") {
      document.title = "Payment Receipt";
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("print") === "true") {
        const timer = setTimeout(() => {
          window.print();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [bookingDetails]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-sm text-zinc-500 font-medium">Loading receipt details...</p>
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
        <p className="text-red-500 font-semibold mb-2">Error Loading Receipt</p>
        <p className="text-sm text-zinc-500">{error || "Could not find booking details."}</p>
      </div>
    );
  }

  const { booking, organization } = bookingDetails;
  const custom = organization?.invoiceCustomization || {};

  // Custom configurations
  const brandLogo = custom.logoUrl || organization?.logoUrl || organization?.logo || "";
  const customBrandName = custom.brandName || organization?.name || "ONESERVICE";
  const accentColor = custom.color || "#4f46e5";
  const receiptBgColor = custom.backgroundColor || "#ffffff";
  const customTextSize = custom.textSize || "medium";

  // Resolve client name, email, phone from metadata or fallback
  let customerEmail = "";
  let customerName = "Valued Customer";
  let customerPhone = "";
  let customerNotes = "";

  let parsedNotes: any = null;
  try {
    if (booking.notes) {
      parsedNotes = JSON.parse(booking.notes);
    }
  } catch (e) {}

  if (parsedNotes) {
    customerEmail = parsedNotes.customerEmail || "";
    customerName = parsedNotes.customerName || "Valued Customer";
    customerPhone = parsedNotes.customerPhone || "";
    customerNotes = parsedNotes.customerNotes || "";
  }

  // Resolve services
  let services = parsedNotes?.services;
  if (!services || !Array.isArray(services) || services.length === 0) {
    services = [{ name: booking.service, price: Number(booking.amount), quantity: 1 }];
  }

  const subtotal = Number(booking.amount) || 0;
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const totalAmount = subtotal + tax;

  const dateFormatted = new Date(booking.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Sizing Class Map
  const previewTextClass = 
    customTextSize === "small" 
      ? "text-[11px]" 
      : customTextSize === "large" 
      ? "text-sm" 
      : "text-xs";
  
  const tablePaddingClass = 
    customTextSize === "small" 
      ? "py-2" 
      : customTextSize === "large" 
      ? "py-5" 
      : "py-4";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex flex-col items-center justify-center font-sans antialiased text-zinc-800 dark:text-zinc-200">
      
      {/* Stylesheet specifically to format browser-print option into isolating only the Invoice Sheet */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .print-hide {
            display: none !important;
          }
          .print-shadow-none {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
          .receipt-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            background-color: ${receiptBgColor} !important;
          }
        }
      `}</style>

      {/* Actions bar at the top */}
      <div className="w-full max-w-[700px] mb-4 flex justify-between items-center print-hide">
        <Link href={`/booking-success/${booking.id}`}>
          <Button variant="outline" size="sm" className="text-zinc-500 hover:text-zinc-950 dark:hover:text-white gap-1 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl">
            Back
          </Button>
        </Link>
        <Button onClick={handlePrint} style={{ backgroundColor: accentColor }} className="hover:opacity-90 text-white gap-2 font-semibold px-4 rounded-xl">
          <Printer className="w-4 h-4" /> Print / Save PDF
        </Button>
      </div>

      {/* Invoice container matching Velvetbook reference visual */}
      <div 
        style={{ backgroundColor: receiptBgColor }} 
        className={`receipt-container w-full max-w-[700px] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden p-8 md:p-12 relative ${previewTextClass}`}
      >
        {/* Top Accent Line */}
        <div style={{ backgroundColor: accentColor }} className="absolute top-0 left-0 right-0 h-1.5"></div>
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
          {/* Header Left: Branding & Info */}
          <div className="flex-1 space-y-3">
            {brandLogo && (
              <img 
                src={brandLogo} 
                alt="Brand Logo" 
                className="max-h-16 object-contain rounded-lg max-w-[150px] block" 
              />
            )}
            <h2 style={{ color: accentColor }} className="text-3xl font-extrabold tracking-tight uppercase">
              {customBrandName}
            </h2>
            <div className="text-xs text-zinc-500 space-y-1">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                {organization?.addressLine1 || organization?.location || "wall street, newyork city"}
              </p>
              {(organization?.phone || organization?.phoneNumber) && (
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  {organization.phone || organization.phoneNumber}
                </p>
              )}
              {(organization?.officialEmail || organization?.email) && (
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  {organization.officialEmail || organization.email}
                </p>
              )}
            </div>
          </div>
          
          {/* Header Right: Meta & Bill To */}
          <div className="w-full md:w-64 flex flex-col items-start md:items-end text-left md:text-right gap-4">
            <div>
              <h1 style={{ color: accentColor }} className="text-3xl font-black tracking-wider leading-none">
                INVOICE
              </h1>
              <div className="text-xs text-zinc-500 space-y-1 mt-2">
                <p><strong>Invoice No.</strong> : INV-{String(booking.id).slice(0, 8).toUpperCase()}</p>
                <p><strong>Invoice Date</strong> : {dateFormatted}</p>
                <p className="flex items-center md:justify-end gap-1">
                  <strong>Status</strong> : 
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/30">
                    PAID
                  </span>
                </p>
              </div>
            </div>

            {/* Bill To Card */}
            <div className="w-full text-left bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
              <p className="text-[9px] font-extrabold text-zinc-400 tracking-wider uppercase mb-1.5">BILL TO</p>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white">{customerName}</h3>
              {customerEmail && (
                <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{customerEmail}</p>
              )}
              {customerPhone && (
                <p className="text-[11px] text-zinc-500 mt-0.5">{customerPhone}</p>
              )}
              {customerNotes && (
                <p className="text-[10px] text-zinc-400 italic mt-1.5 line-clamp-2">Notes: {customerNotes}</p>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ backgroundColor: accentColor }} className="text-[10px] font-extrabold text-white tracking-wider uppercase">
                <th className="p-3 text-left w-10 rounded-l-lg">#</th>
                <th className="p-3 text-left">DESCRIPTION</th>
                <th className="p-3 text-right w-12">QTY</th>
                <th className="p-3 text-right w-28">UNIT PRICE</th>
                <th className="p-3 text-right w-20">TAX (%)</th>
                <th className="p-3 text-right w-28 rounded-r-lg">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {services.map((svc: any, idx: number) => (
                <tr key={idx} className="text-zinc-700 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-800/40">
                  <td className={`${tablePaddingClass} px-3 text-left font-medium text-zinc-400`}>{String(idx + 1).padStart(2, '0')}</td>
                  <td className={`${tablePaddingClass} px-3 text-left font-semibold text-zinc-950 dark:text-white`}>{svc.name || booking.service}</td>
                  <td className={`${tablePaddingClass} px-3 text-right`}>{svc.quantity || 1}</td>
                  <td className={`${tablePaddingClass} px-3 text-right`}>${Number(svc.price || booking.amount).toFixed(2)}</td>
                  <td className={`${tablePaddingClass} px-3 text-right`}>18%</td>
                  <td className={`${tablePaddingClass} px-3 text-right font-semibold text-zinc-950 dark:text-white`}>
                    ${(Number(svc.price || booking.amount) * (svc.quantity || 1)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes & Summary Block */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-6">
          {/* Bottom Left: Payment Information & Thank You */}
          <div className="w-full md:w-7/12 space-y-4">
            <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-300">
              <p className="text-[9px] font-extrabold text-zinc-400 tracking-wider uppercase mb-2">PAYMENT INFORMATION</p>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr>
                    <td className="py-1 text-zinc-400 font-medium">Account Name</td>
                    <td className="py-1 font-bold text-zinc-950 dark:text-white">: {customBrandName} Pty Ltd</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-zinc-400 font-medium">BSB / Bank</td>
                    <td className="py-1 font-bold text-zinc-950 dark:text-white">: 123-456 (Wellness Bank)</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-zinc-400 font-medium">Account No.</td>
                    <td className="py-1 font-bold text-zinc-950 dark:text-white">: 9876 5432 1098</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-zinc-400 font-medium">Reference</td>
                    <td className="py-1 font-bold text-zinc-950 dark:text-white">: INV-{String(booking.id).slice(0, 8).toUpperCase()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="space-y-1">
              <p style={{ color: accentColor }} className="text-xl font-bold font-serif italic">
                Thank You! ❤️
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                We appreciate your trust in our services. We look forward to serving you again.
              </p>
            </div>
          </div>

          {/* Bottom Right: Summary Calculations */}
          <div className="w-full md:w-1/3 space-y-3">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Subtotal</span>
              <span className="font-semibold text-zinc-900 dark:text-white">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Tax (GST 18%)</span>
              <span className="font-semibold text-zinc-900 dark:text-white">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Discount</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">-$0.00</span>
            </div>
            
            {/* Highlighted total block */}
            <div 
              style={{ backgroundColor: accentColor }} 
              className="p-4 rounded-xl text-white flex justify-between items-baseline shadow-sm"
            >
              <span className="text-xs font-bold uppercase tracking-wider">TOTAL AMOUNT</span>
              <span className="text-xl font-extrabold">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Contact Details & Core Badges */}
        <div className="mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center space-y-6">
          {/* Core Badges Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <div>🌿 Natural & Safe</div>
            <div>✨ Hygienic & Clean</div>
            <div>⏰ On-time Service</div>
            <div>❤️ Customer Care</div>
          </div>

          <div className="text-[11px] text-zinc-400 space-y-1">
            <p>This transaction is securely processed in accordance with our terms of service.</p>
            <p>Powered by <strong>Velvetbook</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
