/*
 * File: src/middleware.js
 * Logic adapted from project-admin/src/proxy.js
 */
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 1. SAFE INITIALIZATION
let ratelimit;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(20, "10 s"), // Slightly higher limit for user app
      analytics: true,
    });
  }
} catch (error) {
  console.warn("Rate Limiting disabled:", error.message);
}

export default async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1. RATE LIMITING
  // Protect auth routes and sensitive apis
  const rateLimitRoutes = ["/api/auth", "/login", "/register", "/otp"];
  
  if (ratelimit && rateLimitRoutes.some(p => pathname.startsWith(p))) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  // 2. ROUTE PROTECTION LOGIC
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/otp"];
  const protectedRoutes = ["/profile", "/appointments", "/chat", "/checkout", "/video-call"];
  
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Guest trying to access protected route -> Login
  if (!token && isProtectedRoute) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Logged in user trying to access auth pages -> Home
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};