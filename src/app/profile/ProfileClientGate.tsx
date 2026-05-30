"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useAuthHeader } from "@/contexts/AuthContext";
import UserProfileTabs from "@/components/UserProfileTabs";
import { getUserProfileApi } from "@/lib/userApi";

export default function ProfileClientGate() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const authHeaders = useAuthHeader();
  const router = useRouter();
  
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    } else if (isAuthenticated && authHeaders.Authorization) {
      getUserProfileApi()
        .then((res) => setFullProfile(res.data))
        .catch(console.error)
        .finally(() => setIsFetchingProfile(false));
    } else if (!isLoading) {
      setIsFetchingProfile(false);
    }
  }, [isAuthenticated, isLoading, router, authHeaders.Authorization]);

  if (isLoading || !isAuthenticated || isFetchingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-zinc-500 font-medium animate-pulse">Loading settings...</p>
      </div>
    );
  }

  return <UserProfileTabs user={{ ...user, ...fullProfile }} />;
}
