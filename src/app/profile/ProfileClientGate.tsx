"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDemoAuth } from "@/components/DemoAuthProvider";
import UserProfileTabs from "@/components/UserProfileTabs";

export default function ProfileClientGate() {
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

  return <UserProfileTabs user={session.user} />;
}
