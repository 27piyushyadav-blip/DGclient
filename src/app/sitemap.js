/*
 * File: src/app/sitemap.js
 * FIXED:
 * - Replaced deprecated Expert model with ExpertProfile
 * - Uses `isOnboarded: true` to determine active expert profiles
 * - Safe for Next.js App Router sitemap generation
 */

import { connectToDatabase } from "@/lib/db";
import ExpertProfile from "@/models/ExpertProfile";
import Organization from "@/models/Organization";

export default async function sitemap() {
  const baseUrl = process.env.APP_URL || "https://mindnamo.com";

  /* -----------------------------------------------------
   * 1. Static Routes
   * ----------------------------------------------------- */
  const routes = [
    "",
    "/experts",
    "/organizations",
    "/support",
    "/terms",
    "/privacy",
    "/login",
    "/register",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  /* -----------------------------------------------------
   * 2. Dynamic Routes
   * ----------------------------------------------------- */
  let expertUrls = [];
  let orgUrls = [];

  try {
    await connectToDatabase();

    // ✅ Expert Profiles (new schema)
    const experts = await ExpertProfile.find({ isOnboarded: true })
      .select("_id updatedAt")
      .lean();

    expertUrls = experts.map((expert) => ({
      url: `${baseUrl}/experts/${expert._id.toString()}`,
      lastModified: expert.updatedAt || new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    }));

    // ✅ Organizations
    const organizations = await Organization.find({ isActive: true })
      .select("slug updatedAt")
      .lean();

    orgUrls = organizations.map((org) => ({
      url: `${baseUrl}/organizations/${org.slug}`,
      lastModified: org.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (error) {
    console.error("[Sitemap] Error generating sitemap:", error);
  }

  /* -----------------------------------------------------
   * 3. Combine & Return
   * ----------------------------------------------------- */
  return [...routes, ...expertUrls, ...orgUrls];
}
