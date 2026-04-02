"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get("at");
        const refreshToken = searchParams.get("rt");

        if (!accessToken || !refreshToken) {
          setStatus("Authentication failed: Missing tokens");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
          return;
        }

        localStorage.setItem("client_access_token", accessToken);
        localStorage.setItem("client_refresh_token", refreshToken);

        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const userData = {
            id: payload.sub || '',
            name: payload.name || 'User',
            email: payload.email || '',
            image: payload.picture || null,
          };
          localStorage.setItem("client_user", JSON.stringify(userData));
        } catch (e) {
          console.error("Failed to parse JWT:", e);
        }

        setStatus("Authentication successful! Redirecting...");
        
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("Authentication failed. Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {status}
      </h2>
      <p className="text-gray-600">
        Please wait while we complete your authentication...
      </p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense fallback={
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      }>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
