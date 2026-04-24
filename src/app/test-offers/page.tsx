/*
 * File: src/app/test-offers/page.tsx
 * SR-DEV: Test page for offer functionality
 */

import OfferTest from "@/components/chat/OfferTest";

export default function TestOffersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <OfferTest />
    </div>
  );
}

export const metadata = {
  title: "Test Offers - Mind Namo",
  description: "Test page for offer functionality",
};
