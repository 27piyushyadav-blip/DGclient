/*
 * File: src/components/FooterWrapper.tsx
 * SR-DEV: Conditional Footer Renderer
 * ACTION: Hides footer on '/experts' (search) but keeps it on '/experts/[id]' (profile).
 */

"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

export default function FooterWrapper() {
  const pathname = usePathname();

  // 1. Prefix Matches: Hide footer on these paths AND their sub-paths
  // (e.g. /video-call/123, /chat/abc)
  const hideFooterPrefixes: string[] = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/otp",
    "/chat",
    "/video-call", 
  ];

  // 2. Exact Matches: Hide footer ONLY on these specific paths
  // (e.g. Hide on the search list '/experts', but SHOW on profile '/experts/123')
  const hideFooterExact: string[] = [
    "/experts",
  ];

  // Check both conditions
  const shouldHide = 
    hideFooterPrefixes.some((route) => pathname?.startsWith(route)) ||
    hideFooterExact.includes(pathname || "");

  if (shouldHide) return null;

  return <Footer />;
}
