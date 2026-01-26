/*
 * File: src/app/support/page.tsx
 */

import type { Metadata } from "next";
import SupportClient from "./SupportClient";

// --- UPDATED METADATA ---
export const metadata: Metadata = {
  title: "Help Center | Mind Namo",
  description: "Find answers to your questions, manage your appointments, or contact our support team.",
  openGraph: {
    title: "Mind Namo Support Center",
    description: "Need help? Find FAQs, manage your bookings, or contact our support team.",
    url: "/support",
    siteName: "Mind Namo",
    images: [
      {
        url: "/og-support.jpg", // Make sure this image exists in /public
        width: 1200,
        height: 630,
        alt: "Mind Namo Help Center",
      },
    ],
    type: "website",
  },
};

export default function SupportPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-zinc-50 dark:bg-zinc-950">
      <SupportClient />
    </div>
  );
}
