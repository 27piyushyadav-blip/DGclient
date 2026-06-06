import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Proxy the organizations list to the backend.
// The client-side suggestions fetch hits this endpoint so it can use browser
// caching headers – the response is cached for 30 seconds on the CDN/browser
// so repeated visits within a session don't re-hit the backend at all.
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/directory/organizations`, {
      next: { revalidate: 30 }, // ISR: stale-while-revalidate for 30 s
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch organizations" },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        // Allow browsers / CDN to cache for 30 seconds
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
