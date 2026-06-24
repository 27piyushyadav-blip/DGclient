/*
 * File: src/components/chat/OfferTest.tsx
 * SR-DEV: Test component for offer functionality
 */

"use client";

import { useState } from "react";
import OfferCard from "./OfferCard";

const mockOfferPayload = {
  id: "test-offer-123",
  status: "sent" as const,
  currency: 'AUD',
  items: [
    {
      id: "item-1",
      nameSnapshot: "Consultation Service",
      priceSnapshot: 1000,
      discountSnapshot: {
        type: "percent" as const,
        value: 10
      },
      finalPriceSnapshot: 900,
      quantity: 1
    },
    {
      id: "item-2",
      nameSnapshot: "Follow-up Session",
      priceSnapshot: 500,
      discountSnapshot: {
        type: "fixed" as const,
        value: 50
      },
      finalPriceSnapshot: 450,
      quantity: 2
    }
  ],
  totals: {
    subtotal: 2000,
    discountAmount: 250,
    total: 1850
  },
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
};

export default function OfferTest() {
  const [offerStatus, setOfferStatus] = useState<"sent" | "accepted" | "paid" | "expired" | "cancelled">(mockOfferPayload.status);
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async (offerId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setOfferStatus("accepted");
      setIsLoading(false);
      console.log("Offer accepted:", offerId);
    }, 1000);
  };

  const handleDecline = async (offerId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setOfferStatus("cancelled");
      setIsLoading(false);
      console.log("Offer declined:", offerId);
    }, 1000);
  };

  const handlePay = async (offerId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setOfferStatus("paid");
      setIsLoading(false);
      console.log("Payment initiated for offer:", offerId);
    }, 1000);
  };

  const testPayload = { ...mockOfferPayload, status: offerStatus };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Offer Card Test</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={() => setOfferStatus("sent")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reset to Sent
        </button>
        <button
          onClick={() => setOfferStatus("accepted")}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Simulate Accepted
        </button>
        <button
          onClick={() => setOfferStatus("paid")}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Simulate Paid
        </button>
        <button
          onClick={() => setOfferStatus("expired")}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Simulate Expired
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Client View (isOwn=false)</h2>
          <OfferCard
            payload={testPayload}
            isOwn={false}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onPay={handlePay}
            isLoading={isLoading}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Organization View (isOwn=true)</h2>
          <OfferCard
            payload={testPayload}
            isOwn={true}
          />
        </div>
      </div>
    </div>
  );
}
