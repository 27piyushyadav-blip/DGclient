"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDemoAuth } from "@/components/DemoAuthProvider";
import FeedbackClient from "./FeedbackClient";

export default function FeedbackClientGate() {
  const { session } = useDemoAuth();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user) {
      router.push("/login");
    }
  }, [session, router]);

  if (!session?.user) {
    return null;
  }

  return (
    <FeedbackClient
      userId={session.user.id || ""}
      userName={session.user.name || ""}
    />
  );
}
