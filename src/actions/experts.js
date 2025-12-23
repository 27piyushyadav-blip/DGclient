/*
 * File: src/actions/experts.js
 * FIXED: Added education and latestEducation to the projection so they show up on cards.
 */

"use server";

import { connectToDatabase } from "@/lib/db";
import ExpertProfile from "@/models/ExpertProfile";
import User from "@/models/User";

export async function getExpertsAction({
  page = 1,
  limit = 10,
  filters = {},
  sort = "recommended",
}) {
  try {
    await connectToDatabase();

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [];

    // 1. Join Profile → User
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userData",
      },
    });

    pipeline.push({ $unwind: "$userData" });

    const matchStage = {
      isOnboarded: true,
      "userData.isVerified": true,
    };

    // 2. Search Logic (Existing)
    if (filters.q) {
      const q = new RegExp(filters.q, "i");
      matchStage.$or = [
        { "userData.name": q },
        { specialization: q },
        { location: q },
        { tags: q },
        { services: { $elemMatch: { name: q } } },
      ];
    }

    // 3. Filter Logic (Existing)
    if (filters.roles?.length) matchStage.specialization = { $in: filters.roles };
    if (filters.langs?.length) matchStage.languages = { $in: filters.langs };
    if (filters.gender?.length) matchStage.gender = { $in: filters.gender };
    if (filters.minRating) matchStage.rating = { $gte: Number(filters.minRating) };

    if (filters.expRange) {
      const [minExp, maxExp] = filters.expRange.split("-").map(Number);
      matchStage.experienceYears = { $gte: minExp };
      if (maxExp < 100) matchStage.experienceYears.$lte = maxExp;
    }

    pipeline.push({ $match: matchStage });

    // 4. Sorting Logic (Existing)
    let sortStage = {};
    if (sort === "price-low") sortStage.startingPrice = 1;
    else if (sort === "price-high") sortStage.startingPrice = -1;
    else if (sort === "rating") sortStage.rating = -1;
    else if (sort === "exp-high") sortStage.experienceYears = -1;
    else sortStage = { rating: -1, reviewCount: -1 };

    pipeline.push({ $sort: sortStage });

    // 5. Paginate + Project (UPDATED SECTION)
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: limitNum },
          {
            $project: {
              _id: 1,
              specialization: 1,
              rating: 1,
              reviewCount: 1,
              startingPrice: 1,
              experienceYears: 1,
              location: 1, // Ensure this is present
              latestEducation: 1, // [!code ++] Added for ExpertCard
              education: 1, // [!code ++] Added as fallback for ExpertCard
              tags: 1,
              languages: 1,
              services: 1,
              videoUrl: "$introVideo",
              name: "$userData.name",
              profilePicture: "$userData.image",
              isVerified: "$userData.isVerified",
              userId: "$userData._id",
            },
          },
        ],
      },
    });

    const result = await ExpertProfile.aggregate(pipeline);
    const data = result[0].data || [];
    const total = result[0].metadata?.[0]?.total || 0;

    // 6. Dynamic Filters Aggregation (Existing)
    const filtersAgg = await ExpertProfile.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: "$userData" },
      { $match: { isOnboarded: true, "userData.isVerified": true } },
      { $unwind: { path: "$languages", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          allSpecializations: { $addToSet: "$specialization" },
          allLanguages: { $addToSet: "$languages" },
          minExperience: { $min: "$experienceYears" },
          maxExperience: { $max: "$experienceYears" },
        },
      },
    ]);

    const df = filtersAgg[0] || {};

    return {
      success: true,
      experts: JSON.parse(JSON.stringify(data)),
      total,
      hasMore: pageNum * limitNum < total,
      dynamicFilters: {
        specializations: df.allSpecializations || [],
        languages: (df.allLanguages || []).filter(Boolean),
        minExp: df.minExperience || 0,
        maxExp: df.maxExperience || 30,
        minPrice: 99,
        maxPrice: 5000,
      },
    };
  } catch (error) {
    console.error("[ExpertsAction] Fatal Error:", error);
    return { success: false, experts: [], total: 0, hasMore: false, message: error.message };
  }
}