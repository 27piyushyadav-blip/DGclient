/*
 * File: src/app/chat/ChatClient.js
 * NOTE: Backend/socket/actions removed. This component is now presentational.
 */

"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export default function ChatClient({ initialConversations }) {
  const conversations = useMemo(() => initialConversations || [], [initialConversations]);

  return (
    <div className="flex h-full bg-background relative">
      <div className={cn("w-full md:max-w-sm flex flex-col border-r border-border bg-card")}>
        <div className="p-4 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground px-2">Messages</h2>
          <p className="text-sm text-muted-foreground mt-1 px-2">Your conversations</p>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {conversations.length > 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Conversations are currently unavailable.</p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No conversations yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:flex flex-1 flex-col h-full bg-background relative overflow-hidden">
        <div className="flex flex-col h-full items-center justify-center text-muted-foreground p-8 text-center">
          <div className="max-w-md">
            <h3 className="text-2xl font-semibold text-foreground mb-2">Welcome to Messages</h3>
            <p className="text-muted-foreground">Messaging is currently unavailable.</p>
          </div>
        </div>
      </div>
    </div>
  );
}