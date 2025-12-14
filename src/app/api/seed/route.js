/*
 * File: src/app/api/seed/route.js
 * FIXED:
 * - Replaced deprecated Expert model
 * - Proper User + ExpertProfile split
 * - Idempotent seeding (safe to re-run)
 * - Maps legacy seed fields to new schema
 */

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import ExpertProfile from "@/models/ExpertProfile";

export const dynamic = "force-dynamic";

/* -----------------------------------------------------
 * Seed Data (normalized later)
 * ----------------------------------------------------- */
const EXPERT_DATA = [
  {
    name: "Dr. Anaya Chatterjee",
    username: "anaya_chatterjee",
    email: "anaya.chatterjee@example.com",
    profilePicture:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop",
    specialization: "Clinical Psychologist",
    bio: "Trauma-informed therapist specializing in EMDR and somatic healing.",
    education: "M.Phil Clinical Psychology, NIMHANS",
    experienceYears: 11,
    location: "Kolkata, India",
    languages: ["English", "Bengali", "Hindi"],
    gender: "Female",
    rating: 4.8,
    reviewCount: 132,
    treatmentTags: ["Trauma", "EMDR", "Anxiety"],
    isOnline: true,

    services: [
      { name: "EMDR Session", duration: 60, videoPrice: 2200, clinicPrice: 2600 },
    ],

    availability: [
      { dayOfWeek: "Monday", startTime: "10:00", endTime: "17:00" },
    ],

    workExperience: [
      {
        role: "Clinical Psychologist",
        hospital: "Apollo Multispeciality Hospital",
        startYear: 2014,
        endYear: 2019,
      },
    ],
  },

  {
    name: "Dr. Kabir Malhotra",
    username: "kabir_malhotra",
    email: "kabir.malhotra@example.com",
    profilePicture:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
    specialization: "Psychiatrist",
    bio: "Specialist in mood disorders and addiction recovery.",
    education: "MD Psychiatry, PGIMER",
    experienceYears: 17,
    location: "Delhi, India",
    languages: ["English", "Hindi", "Punjabi"],
    gender: "Male",
    rating: 4.7,
    reviewCount: 205,
    treatmentTags: ["Addiction", "Depression"],
    isOnline: false,

    services: [
      {
        name: "Psychiatric Evaluation",
        duration: 45,
        videoPrice: 2500,
        clinicPrice: 3000,
      },
    ],

    availability: [
      { dayOfWeek: "Tuesday", startTime: "10:00", endTime: "18:00" },
    ],
  },
];

/* -----------------------------------------------------
 * GET: Seed Experts
 * ----------------------------------------------------- */
export async function GET() {
  try {
    await connectToDatabase();

    const results = [];

    for (const expert of EXPERT_DATA) {
      /* -------------------------------------------
       * 1. USER (Identity Layer)
       * ------------------------------------------- */
      let user = await User.findOne({ email: expert.email });

      if (!user) {
        user = await User.create({
          name: expert.name,
          email: expert.email,
          username: expert.username,
          image: expert.profilePicture,
          role: "expert",
          isVerified: true,
          authProvider: "seed",
        });
      }

      /* -------------------------------------------
       * 2. MAP LEGACY → NEW SCHEMA
       * ------------------------------------------- */
      const workHistory =
        expert.workExperience?.map((w) => ({
          role: w.role,
          company: w.hospital || "Private Practice",
          startDate: new Date(w.startYear, 0, 1),
          endDate: w.endYear ? new Date(w.endYear, 0, 1) : null,
          current: !w.endYear,
          description: "Seeded experience",
        })) || [];

      const education = expert.education
        ? [
            {
              institution: "University",
              degree: expert.education,
              fieldOfStudy: "Psychology",
              startDate: new Date(2008, 0, 1),
              current: false,
            },
          ]
        : [];

      /* -------------------------------------------
       * 3. EXPERT PROFILE (Professional Layer)
       * ------------------------------------------- */
      const profileData = {
        user: user._id,
        bio: expert.bio,
        specialization: expert.specialization,
        gender: expert.gender,
        location: expert.location,
        languages: expert.languages,
        tags: expert.treatmentTags,

        services: expert.services || [],
        availability: expert.availability || [],

        workHistory,
        education,

        rating: expert.rating || 0,
        reviewCount: expert.reviewCount || 0,
        isOnline: expert.isOnline || false,

        isOnboarded: true,
        isVetted: true,
      };

      const profile = await ExpertProfile.findOneAndUpdate(
        { user: user._id },
        { $set: profileData },
        { upsert: true, new: true }
      );

      results.push({
        email: user.email,
        userId: user._id.toString(),
        profileId: profile._id.toString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${results.length} expert(s) successfully.`,
      data: results,
    });
  } catch (error) {
    console.error("[SeedExperts] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Expert seeding failed.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
