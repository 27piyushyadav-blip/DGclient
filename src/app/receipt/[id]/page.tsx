"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPublicBookingDetailsApi } from "@/lib/bookingsApi";
import { Loader2, Printer } from "lucide-react";
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
        <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-semibold px-4 rounded-xl">
          <Printer className="w-4 h-4" /> Print / Save PDF
        </Button>
      </div>

      {/* Invoice container matching Velvetbook/Email visual */}
      <div className="receipt-container w-full max-w-[700px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden p-8 md:p-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white uppercase">
              {organization?.name || "ONESERVICE"}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Powered by Velvetbook</p>
          </div>
          <div className="text-left md:text-right">
            <h1 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider">
              INVOICE
            </h1>
            <p className="text-xs text-zinc-500 font-semibold mt-1">
              Invoice # INV-{String(booking.id).slice(0, 8).toUpperCase()}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Date: {dateFormatted}
            </p>
          </div>
        </div>

        {/* Three Column Billing Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 mb-8 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
          {/* BILL FROM */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold text-zinc-400 tracking-wider uppercase">BILL FROM</p>
            <p className="text-xs font-bold text-zinc-900 dark:text-white">{organization?.name || "ONESERVICE"}</p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {organization?.addressLine1 || organization?.location || "wall street, newyork city"}
            </p>
            {(organization?.phone || organization?.phoneNumber) && (
              <p className="text-xs text-zinc-500">Phone: {organization.phone || organization.phoneNumber}</p>
            )}
            {(organization?.officialEmail || organization?.email) && (
              <p className="text-xs text-zinc-500">Email: {organization.officialEmail || organization.email}</p>
            )}
          </div>

          {/* BILL TO */}
          <div className="space-y-1.5 md:border-l md:border-zinc-200 dark:md:border-zinc-800 md:pl-6">
            <p className="text-[10px] font-extrabold text-zinc-400 tracking-wider uppercase">BILL TO</p>
            <p className="text-xs font-bold text-zinc-900 dark:text-white">{customerName}</p>
            {customerPhone && (
              <p className="text-xs text-zinc-500">Phone: {customerPhone}</p>
            )}
            {customerEmail && (
              <p className="text-xs text-zinc-500">Email: {customerEmail}</p>
            )}
            {customerNotes && (
              <p className="text-xs text-zinc-400 italic">Notes: {customerNotes}</p>
            )}
          </div>

          {/* INVOICE FOR */}
          <div className="space-y-1.5 md:border-l md:border-zinc-200 dark:md:border-zinc-800 md:pl-6">
            <p className="text-[10px] font-extrabold text-zinc-400 tracking-wider uppercase">INVOICE FOR</p>
            <div className="text-xs text-zinc-500 space-y-1">
              <p><strong>Booking ID:</strong> #{String(booking.id).slice(0, 8).toUpperCase()}</p>
              <p><strong>Type:</strong> New Purchase</p>
              <div className="flex items-center gap-1.5 mt-1">
                <strong>Status:</strong>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/30">
                  PAID
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-extrabold text-zinc-400 tracking-wider uppercase">
                <th className="pb-3 text-left w-10">#</th>
                <th className="pb-3 text-left">DESCRIPTION</th>
                <th className="pb-3 text-right w-12">QTY</th>
                <th className="pb-3 text-right w-28">UNIT PRICE</th>
                <th className="pb-3 text-right w-20">TAX (%)</th>
                <th className="pb-3 text-right w-28">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {services.map((svc: any, idx: number) => (
                <tr key={idx} className="text-xs text-zinc-700 dark:text-zinc-300">
                  <td className="py-4 text-left font-medium text-zinc-400">{idx + 1}</td>
                  <td className="py-4 text-left font-semibold text-zinc-900 dark:text-white">{svc.name || booking.service}</td>
                  <td className="py-4 text-right">{svc.quantity || 1}</td>
                  <td className="py-4 text-right">${Number(svc.price || booking.amount).toFixed(2)}</td>
                  <td className="py-4 text-right">18%</td>
                  <td className="py-4 text-right font-semibold text-zinc-900 dark:text-white">
                    ${(Number(svc.price || booking.amount) * (svc.quantity || 1)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes & Summary Block */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          {/* Notes */}
          <div className="w-full md:w-1/2 space-y-2">
            <p className="text-[10px] font-extrabold text-zinc-400 tracking-wider uppercase">NOTES</p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Thank you for your business! This is an automatically generated receipt for your records. If you have any questions or concerns regarding this transaction, please feel free to reach out to us.
            </p>
          </div>

          {/* Summary */}
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
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-zinc-900 dark:text-white">TOTAL</span>
              <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Contact Details */}
        <div className="mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center text-[11px] text-zinc-400 space-y-1">
          <p>
            {organization?.phone && `📞 ${organization.phone}  •  `}
            {organization?.officialEmail && `✉️ ${organization.officialEmail}  •  `}
            {organization?.name || "ONESERVICE"}
          </p>
          <p>This transaction is securely processed in accordance with our terms of service.</p>
        </div>

      </div>
    </div>
  );
}
