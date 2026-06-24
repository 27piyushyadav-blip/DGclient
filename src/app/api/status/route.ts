import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  let backendUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!backendUrl && process.env.NEXT_PUBLIC_API_BASE_URL) {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_API_BASE_URL);
      backendUrl = url.origin;
    } catch (e) {
      // ignore parsing error
    }
  }
  
  backendUrl = backendUrl || "http://localhost:3000";

  try {
    const res = await fetch(`${backendUrl}/live`, {
      method: "GET",
      cache: "no-store",
    });

    if (res.status === 200) {
      return NextResponse.json({ status: "OK", backend: "healthy" });
    } else {
      return NextResponse.json(
        { status: "Error", message: `Backend responded with status ${res.status}` },
        { status: 503 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { status: "Error", message: "Cannot connect to backend", error: err.message },
      { status: 503 }
    );
  }
}
