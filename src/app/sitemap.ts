/*
 * File: src/app/sitemap.ts
 * NOTE: Backend removed; sitemap is static.
 */

import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || "https://mindnamo.com";

  /* -----------------------------------------------------
   * 1. Static Routes
   * ----------------------------------------------------- */
  const routes: MetadataRoute.Sitemap = [
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
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  return routes;
}
