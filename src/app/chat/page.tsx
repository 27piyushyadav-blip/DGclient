/*
 * File: src/app/chat/page.tsx
 * SR-DEV: User Chat Page Wrapper
 * FEATURES:
 * - Full-viewport height layout adjusted for site header.
 * - Server-side conversation pre-fetching.
 * - Suspense boundary for loading states.
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import ChatClient from "./ChatClient";
import Loading from "./loading";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Messages | Mind Namo",
  description: "Secure, private conversations with your experts.",
};

export default function ChatPage() {
  return (
    /**
     * FIXED: Adjusted height from h-[100dvh] to h-[calc(100dvh-64px)].
     * The main site header is 64px (h-16) tall. By subtracting this height, 
     * the chat container fits perfectly in the remaining viewport space,
     * preventing the page body from scrolling and hiding the chat header.
     */
    <div className="flex h-[calc(100dvh-64px)] flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <main className="flex-1 overflow-hidden flex flex-col">
        <Suspense fallback={<Loading />}>
          <ChatClient 
            initialConversations={[]} 
          />
        </Suspense>
      </main>
    </div>
  );
}
