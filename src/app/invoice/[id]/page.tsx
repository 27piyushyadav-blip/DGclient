"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProfileImage from "@/components/ProfileImage";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  getPublicBookingDetailsApi,
  payPublicBookingApi,
  getPublicBookingPaymentIntentApi,
} from "@/lib/bookingsApi";

import {
  Loader2,
  Lock,
  ArrowLeft,
  Printer,
  Download,
  CheckCircle2,
  Building2,
  Calendar,
  Clock,
  CreditCard,
  Check,
  User,
  Shield,
  FileText
} from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_51TnWxJRtWyTHe4oWLtVB6KsLFXU5PkBtaMFRqqrxknuQnDtmZKBIeiNSlz6RlgEsePc5hth4OBQl103LM25DLX1200hT6dOjHM");

export default function InvoicePage() {
  return (
    <Elements stripe={stripePromise}>
      <InvoicePageContent />
    </Elements>
  );
}

function InvoicePageContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  // Payment Form State
  const [cardholderName, setCardholderName] = useState("");
  const stripe = useStripe();
  const elements = useElements();
  
  // Payment Validation States
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
      const isPaid = bookingDetails.booking?.paymentStatus === "paid";
      document.title = isPaid ? "Payment Receipt" : "Invoice";

      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("print") === "true") {
        const timer = setTimeout(() => {
          window.print();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [bookingDetails]);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardholderName.trim()) {
      setFormErrors({ cardholderName: "Cardholder name is required" });
      return;
    }
    setFormErrors({});

    if (!stripe || !elements) {
      setError("Stripe payment client is not loaded yet.");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        // 1. Fetch public payment intent from backend
        const intentResult = await getPublicBookingPaymentIntentApi(id);
        const clientSecret = intentResult.clientSecret;
        const paymentIntentId = intentResult.paymentIntentId;

        if (!clientSecret) {
          throw new Error("Could not retrieve client secret from backend payment intent endpoint");
        }

        if (clientSecret.startsWith("pi_mock_secret_")) {
          console.log("Mock Stripe payment intent detected, bypassing SDK confirmation");
        } else {
          // 2. Confirm card payment with Stripe Elements
          const cardNumEl = elements.getElement(CardNumberElement);
          if (!cardNumEl) {
            throw new Error("Stripe elements not fully loaded");
          }

          const stripeResult = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardNumEl,
              billing_details: {
                name: cardholderName,
              },
            },
          });

          if (stripeResult.error) {
            throw new Error(stripeResult.error.message || "Payment confirmation failed");
          }
        }

        // 3. Inform backend to finalize booking status as paid and confirmed
        await payPublicBookingApi(id, paymentIntentId);
        
        // Direct redirection to success page
        router.push(`/booking-success/${id}`);
      } catch (err: any) {
        console.error("Payment confirmation failed:", err);
        setError(err.message || "Payment verification failed.");
      }
    });
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-sm text-zinc-500 font-medium">Loading invoice details...</p>
      </div>
    );
  }

  if (error && !bookingDetails) {
    return (
      <div className="container mx-auto max-w-md px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Invoice Not Found</h2>
        <p className="text-red-500 text-sm">{error}</p>
        <Button variant="outline" className="w-full text-black bg-white" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </div>
    );
  }

  const booking = bookingDetails.booking || bookingDetails;
  const expert = bookingDetails.expert || booking.expert || null;
  const expertProfile = bookingDetails.expertProfile || booking.expertProfile || null;
  const organization = bookingDetails.organization || booking.organization || null;
  const customerDetails = bookingDetails.customerDetails || {};

  const amount = Number(booking.amount) || 0;
  const isPaid = booking.paymentStatus === "paid";
  
  // Dynamic Services calculation
  const services = bookingDetails.services && bookingDetails.services.length > 0
    ? bookingDetails.services
    : [{ name: booking.service || "Consultation Service", price: amount, quantity: 1 }];

  // Compute subtotal and estimated tax
  const subtotal = services.reduce((acc: number, curr: any) => acc + (Number(curr.price) * (curr.quantity || 1)), 0);
  // Simulating 18% GST/VAT for enterprise compliance look and feel
  const taxRate = 0.18;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const totalAmount = subtotal + taxAmount;

  // Format Dates
  const issueDate = booking.createdAt 
    ? new Date(booking.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
    
  const appointmentDate = booking.scheduledDate
    ? new Date(booking.scheduledDate).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : "N/A";
    
    const appointmentTime = booking.scheduledDate
    ? new Date(booking.scheduledDate).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true })
    : "N/A";

  // Organization Details Formatting
  const orgPhone = organization?.phone || organization?.phoneNumber || "";
  const orgEmail = organization?.officialEmail || organization?.email || "";
  const orgAddress = organization?.location || organization?.addressLine1
    ? [organization.location || organization.addressLine1, organization.city, organization.state, organization.zipCode].filter(Boolean).join(", ")
    : "";

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      
      {/* Stylesheet specifically to format browser-print option into isolating only the Invoice Sheet */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body, html, main {
            background: white !important;
            color: black !important;
            overflow: visible !important;
            height: auto !important;
            min-height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-hide, #back-btn, #checkout-card-col {
            display: none !important;
          }
          /* Reset grid layout constraints so the invoice can take full width */
          .grid {
            display: block !important;
          }
          #invoice-sheet-container {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Remove borders, shadows, and paddings from inside card wrapper when printing */
          #invoice-sheet-container > div {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            background: transparent !important;
          }
        }
      `}} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* --- LEFT & MIDDLE: Invoice Sheet --- */}
        <div id="invoice-sheet-container" className="lg:col-span-2 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm relative overflow-hidden">
            
            {/* Enterprise Top Banner Accent */}
            <div className={`absolute top-0 left-0 right-0 h-2 ${isPaid ? 'bg-emerald-500' : 'bg-indigo-600'}`} />

            {/* Actions & Branding Row */}
            <div className="flex justify-between items-start gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {organization?.name || "Mind Namo"}
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight mt-1">
                  {isPaid ? "PAYMENT RECEIPT" : "INVOICE"}
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Ref: #{String(booking.id).slice(0, 8).toUpperCase()}
                </p>
              </div>

              <div className="flex items-center gap-2 print-hide">
                <Button 
                  onClick={handlePrint}
                  variant="outline" 
                  size="sm"
                  className="gap-1.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 rounded-xl"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </Button>

                {/* Paid Stamp Badge */}
                <div className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                  isPaid 
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50" 
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {isPaid ? "PAID" : "UNPAID"}
                </div>
              </div>
            </div>

            {/* Invoice Meta Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Date Issued</p>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1">{issueDate}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Payment Status</p>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                  {isPaid ? "Completed" : "Pending Client Action"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Invoice Due</p>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1">On Booking Confirm</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Due</p>
                <p className="text-sm font-bold text-zinc-950 dark:text-white mt-1">${totalAmount.toFixed(2)}</p>
              </div>
            </div>

            {/* Billing Address / Contacts details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-zinc-100 dark:border-zinc-800">
              
              {/* Org Details */}
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Provider Details</p>
                <h3 className="font-bold text-zinc-900 dark:text-white">{organization?.name || "Mind Namo"}</h3>
                {orgAddress && (
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{orgAddress}</p>
                )}
                {orgPhone && (
                  <p className="text-xs text-zinc-500 mt-1">Phone: {orgPhone}</p>
                )}
                {orgEmail && (
                  <p className="text-xs text-zinc-500 mt-0.5">Email: {orgEmail}</p>
                )}
              </div>

              {/* Client / Billed to */}
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Billed To (Client)</p>
                <h3 className="font-bold text-zinc-900 dark:text-white">{customerDetails.name || "Valued Customer"}</h3>
                {customerDetails.phone && (
                  <p className="text-xs text-zinc-500 mt-1">Phone: {customerDetails.phone}</p>
                )}
                {customerDetails.email && (
                  <p className="text-xs text-zinc-500 mt-0.5">Email: {customerDetails.email}</p>
                )}
                {customerDetails.notes && (
                  <div className="mt-2 p-2 rounded bg-zinc-50 dark:bg-zinc-800/40 text-[11px] text-zinc-500 border border-zinc-100 dark:border-zinc-800/50">
                    <span className="font-bold">Customer Notes:</span> {customerDetails.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Specialist & Appointment Summary */}
            <div className="py-8 border-b border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-4">Specialist & Appointment slot</p>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                
                {/* Expert profile preview */}
                <div className="flex items-center gap-4">
                  <ProfileImage 
                    src={expert?.avatar || expert?.image} 
                    name={expert?.name || "Specialist"}
                    sizeClass="h-12 w-12"
                    textClass="text-base"
                  />
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white">{expert?.name || "Specialist Assigned"}</h4>
                    <p className="text-xs text-zinc-500">{expertProfile?.specialization || "Specialist"}</p>
                  </div>
                </div>

                {/* Date slot preview */}
                <div className="flex flex-col sm:items-end gap-2 text-left sm:text-right">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    {appointmentDate}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 sm:justify-end">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    {appointmentTime} ({booking.duration || 30} mins)
                  </span>
                  <span className="text-[10px] font-medium text-zinc-400 uppercase">
                    Session Type: {booking.consultationType === "online" ? "Video Call" : "In-Person Consultation"}
                  </span>
                </div>
              </div>
            </div>

            {/* Services Line Items Table */}
            <div className="py-8">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-4">Line Items</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs font-bold">
                      <th className="pb-3 font-semibold">Service Description</th>
                      <th className="pb-3 text-right font-semibold">Rate</th>
                      <th className="pb-3 text-right font-semibold">Quantity</th>
                      <th className="pb-3 text-right font-semibold">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((svc: any, idx: number) => {
                      const svcPrice = Number(svc.price) || 0;
                      const svcQty = svc.quantity || 1;
                      const svcTotal = svcPrice * svcQty;
                      return (
                        <tr key={idx} className="border-b border-zinc-100 dark:border-zinc-800/50 text-zinc-800 dark:text-zinc-200">
                          <td className="py-4 font-medium text-zinc-900 dark:text-white">{svc.name}</td>
                          <td className="py-4 text-right">${svcPrice.toFixed(2)}</td>
                          <td className="py-4 text-right">{svcQty}</td>
                          <td className="py-4 text-right font-semibold text-zinc-900 dark:text-white">${svcTotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Total Calculation Summary */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <div className="w-full sm:w-80 space-y-3">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Simulated GST/VAT (18%)</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Platform Fee</span>
                  <span className="font-semibold text-emerald-600">$0.00</span>
                </div>
                <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800 my-2" />
                <div className="flex justify-between text-base">
                  <span className="font-extrabold text-zinc-950 dark:text-white">Total Amount Due</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- RIGHT COLUMN: Checkout Form (Hidden in Print) --- */}
        <div id="checkout-card-col" className="lg:col-span-1 print-hide">
          <div className="sticky top-24 space-y-6">
            
            {isPaid ? (
              // Paid Success State Card
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Booking Confirmed</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  This invoice has been paid. Your appointment slot has been reserved successfully.
                </p>
                <Link href={`/booking-success/${id}`}>
                  <Button className="w-full mt-2 h-11 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 font-bold rounded-xl shadow-sm">
                    View Success Screen
                  </Button>
                </Link>
              </div>
            ) : (
              // Unpaid Checkout Form Card
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    Payment Details
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">Complete your voice booking transaction</p>
                </div>

                <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                  
                  {/* Cardholder Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Cardholder Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className={`w-full h-11 px-3.5 rounded-xl border ${
                        formErrors.cardholderName 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-zinc-200 dark:border-zinc-800 focus:ring-indigo-600 focus:border-indigo-600'
                      } bg-transparent text-sm focus:outline-none focus:ring-2`}
                    />
                    {formErrors.cardholderName && (
                      <p className="text-[10px] font-bold text-red-500">{formErrors.cardholderName}</p>
                    )}
                  </div>

                  {/* Card Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Card Number</label>
                    <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent">
                      <CardNumberElement options={{ showIcon: true, disableLink: true, style: { base: { fontSize: '14px', color: '#18181b', '::placeholder': { color: '#a1a1aa' } } } }} />
                    </div>
                  </div>

                  {/* Expiry & CVV Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Expiry Date</label>
                      <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent">
                        <CardExpiryElement options={{ style: { base: { fontSize: '14px', color: '#18181b', '::placeholder': { color: '#a1a1aa' } } } }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">CVV / CVC</label>
                      <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent">
                        <CardCvcElement options={{ style: { base: { fontSize: '14px', color: '#18181b', '::placeholder': { color: '#a1a1aa' } } } }} />
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800 my-4" />

                  {/* Submit Button */}
                  <Button 
                    type="submit"
                    size="lg" 
                    className="w-full h-12 text-base font-bold shadow-md bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Processing...</>
                    ) : (
                      <>Pay & Confirm ${totalAmount.toFixed(2)}</>
                    )}
                  </Button>

                  {error && (
                    <p className="text-xs text-red-500 font-semibold text-center bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200/30">
                      {error}
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 mt-4 uppercase font-bold tracking-wider">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" /> Secure SSL Encryption
                  </div>
                </form>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
