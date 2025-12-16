/*
 * File: src/middleware.js
 * PURPOSE: Auth Guard + Rate Limiting
 * FIX: Exclude _next paths (HMR, assets) properly
 */

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/* ---------------------------------------------------------
 * SAFE RATE LIMIT INIT (Does NOT crash dev server)
 * --------------------------------------------------------- */
let ratelimit;

try {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "10 s"),
      analytics: true,
    });
  }
} catch (err) {
  console.warn("⚠️ Rate limiting disabled:", err.message);
}

/* ---------------------------------------------------------
 * MIDDLEWARE
 * --------------------------------------------------------- */
export default async function middleware(req) {
  const { pathname } = req.nextUrl;

  /* -------------------------------
   * 1. RATE LIMIT (AUTH ONLY)
   * ------------------------------- */
  const rateLimitRoutes = [
    "/api/auth",
    "/login",
    "/register",
    "/otp",
    "/forgot-password",
  ];
  

  if (
    ratelimit &&
    rateLimitRoutes.some((route) => pathname.startsWith(route))
  ) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";

    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  /* -------------------------------
   * 2. AUTH PROTECTION
   * ------------------------------- */
  const authRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/otp",
  ];

  const protectedRoutes = [
    "/profile",
    "/appointments",
    "/chat",
    "/checkout",
    "/video-call",
  ];

  const isAuthRoute = authRoutes.some((r) =>
    pathname.startsWith(r)
  );

  const isProtectedRoute = protectedRoutes.some((r) =>
    pathname.startsWith(r)
  );

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Guest → Protected page → Login
  if (!token && isProtectedRoute) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Logged in → Auth pages → Home
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

/* ---------------------------------------------------------
 * 🚨 CRITICAL FIX: EXCLUDE _next (HMR, assets)
 * --------------------------------------------------------- */
export const config = {
  matcher: [
    /*
     * Match everything EXCEPT:
     * - _next (HMR, static chunks, images)
     * - static assets
     * - favicon
     */
    "/((?!_next|static|favicon.ico).*)",
  ],
};
