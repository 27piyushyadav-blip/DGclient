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

        // Store tokens in localStorage using client-specific keys
        localStorage.setItem("client_access_token", accessToken);
        localStorage.setItem("client_refresh_token", refreshToken);

        // Extract user info from JWT token and store for AuthContext
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
        
        // Redirect to dashboard after successful authentication
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {status}
        </h2>
        <p className="text-gray-600">
          Please wait while we complete your authentication...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
