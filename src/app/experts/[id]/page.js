/*
 * File: src/app/experts/[id]/page.js
 * FIXED: Uses ExpertProfile instead of Expert
 * - Populates User for identity fields
 * - Merges data so frontend continues to use: expert.name, expert.profilePicture, etc.
 */

import { connectToDatabase } from "@/lib/db";
import ExpertProfile from "@/models/ExpertProfile";
import User from "@/models/User";
import { notFound } from "next/navigation";
import ExpertProfileClient from "@/components/ExpertProfileClient";

export const dynamic = "force-dynamic";

/**
 * Fetch a single expert profile by ID
 * - Validates ObjectId
 * - Populates linked User document
 * - Flattens structure for client compatibility
 */
async function getExpertById(id) {
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) return null;

  try {
    await connectToDatabase();

    const profile = await ExpertProfile.findById(id)
      .populate({
        path: "user",
        model: User,
        select: "name email image isVerified",
      })
      .lean();

    if (!profile || !profile.user) return null;

    // Flatten user identity into profile so frontend code remains unchanged
    const expert = {
      ...profile,
      _id: profile._id.toString(),        // Profile ID (URL ID)
      userId: profile.user._id.toString(), // User ID — used in chat & notifications
      name: profile.user.name,
      profilePicture: profile.user.image,
      email: profile.user.email,
      isVerified: profile.user.isVerified,
      videoUrl: profile.introVideo,
    };

    return JSON.parse(JSON.stringify(expert));
  } catch (error) {
    console.error("[ExpertProfilePage] Fetch Error:", error);
    return null;
  }
}

/**
 * Dynamic SEO Metadata
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  const expert = await getExpertById(id);

  if (!expert) {
    return { title: "Expert Not Found | Mind Namo" };
  }

  return {
    title: `${expert.name} - ${expert.specialization} | Mind Namo`,
    description:
      expert.bio?.slice(0, 160) ||
      `Book a session with ${expert.name}, a certified ${expert.specialization}.`,
    openGraph: {
      title: `Consult ${expert.name}`,
      description: `Expert in ${expert.specialization}`,
      images: [expert.profilePicture || "/og-image.jpg"],
    },
  };
}

/**
 * Page
 */
export default async function ExpertProfilePage({ params }) {
  const { id } = await params;
  const expert = await getExpertById(id);

  if (!expert) notFound();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <ExpertProfileClient expert={expert} />
    </div>
  );
}
