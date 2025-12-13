/*
 * File: src/actions/user.js
 * SR-DEV: User Profile Actions
 * Securely fetch and update user settings.
 */

"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import UserProfile from "@/models/UserProfile";

// --- Validation Schemas ---

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60).optional(),
  profilePicture: z.string().url().optional().or(z.literal("")),
  marketing: z.boolean().optional(),
  security: z.boolean().optional(),
  transactional: z.boolean().optional(),
});

/**
 * @name getUser
 * @description Fetches the current authenticated user's full profile.
 * Used for populating the Settings/Profile page form.
 */
export async function getUser() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await connectToDatabase();

    // 1. Fetch identity from User
    const user = await User.findById(session.user.id)
      .select("name email image isVerified role")
      .lean();

    if (!user) {
      return { success: false, message: "User not found." };
    }

    // 2. Fetch preferences from UserProfile
    const profile = await UserProfile.findOne({ user: session.user.id })
      .select("notificationPreferences isOnline")
      .lean();

    // 3. Merge User + UserProfile into frontend-friendly shape
    const merged = {
      ...user,
      _id: user._id.toString(),
      profilePicture: user.image, // Normalize for frontend consistency
      notificationPreferences: profile?.notificationPreferences || {
        marketing: false,
        transactional: true,
        security: true,
      },
      isOnline: profile?.isOnline || false,
    };

    return {
      success: true,
      user: JSON.parse(JSON.stringify(merged)),
    };
  } catch (error) {
    console.error("[UserAction] GetUser Error:", error);
    return {
      success: false,
      message: "Failed to fetch profile.",
    };
  }
}


/**
 * @name updateUserAction
 * @description Updates user profile details.
 * Prevents updating sensitive fields like email (which requires re-verification) or role.
 */
export async function updateUserAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return { success: false, message: "Unauthorized" };
  }

  // Extract form data
  const rawData = {
    name: formData.get("name"),
    profilePicture: formData.get("profilePicture"),
    marketing: formData.get("marketing") === "true",
    security: formData.get("security") === "true",
    transactional: formData.get("transactional") === "true",
  };

  // Validate
  const validation = updateProfileSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0].message,
    };
  }

  const { name, profilePicture, marketing, security, transactional } =
    validation.data;

  try {
    await connectToDatabase();

    // 1. Update identity
    await User.findByIdAndUpdate(
      session.user.id,
      {
        name,
        image: profilePicture, // mapped to schema field
      },
      { new: true }
    );

    // 2. Update preferences
    await UserProfile.findOneAndUpdate(
      { user: session.user.id },
      {
        "notificationPreferences.marketing": marketing,
        "notificationPreferences.security": security,
        "notificationPreferences.transactional": transactional,
      },
      { upsert: true, new: true }
    );

    // Revalidate relevant pages/layouts
    revalidatePath("/profile");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Profile updated successfully.",
    };
  } catch (error) {
    console.error("[UserAction] Update Error:", error);
    return { success: false, message: "Failed to update profile." };
  }
}
