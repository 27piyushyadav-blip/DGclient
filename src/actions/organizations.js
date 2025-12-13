/*
 * File: src/actions/organizations.js
 * SR-DEV: Server Actions for Organization Data Fetching.
 * UPDATED for ExpertProfile + User architecture.
 */

"use server";

import { connectToDatabase } from "@/lib/db";
import Organization from "@/models/Organization";
import ExpertProfile from "@/models/ExpertProfile";  // NEW
import User from "@/models/User";                    // NEW
import { revalidatePath } from "next/cache";

/**
 * @name getOrganizationsAction
 * @description Fetches all active partner organizations for the listing page.
 */
export async function getOrganizationsAction() {
    try {
        await connectToDatabase();
        
        const organizations = await Organization.find({ isActive: true })
            .select("name slug logoUrl mission focusTags affiliatedExperts")
            .populate({
                path: "affiliatedExperts",
                select: "_id",
                model: ExpertProfile,   // FIX: Profile instead of Expert
            })
            .lean();

        const cleaned = organizations.map(org => ({
            ...org,
            _id: org._id.toString(),
            expertCount: org.affiliatedExperts?.length || 0,
            affiliatedExperts: undefined,
        }));

        return { success: true, organizations: JSON.parse(JSON.stringify(cleaned)) };
    } catch (error) {
        console.error("[OrganizationsAction] getOrganizationsAction Error:", error);
        return { success: false, organizations: [], message: "Failed to fetch organizations." };
    }
}

/**
 * @name getOrganizationBySlugAction
 * @description Fetches a single organization's details and its affiliated experts.
 */
export async function getOrganizationBySlugAction(slug) {
    if (!slug) {
        return { success: false, organization: null, experts: [], message: "Slug is required." };
    }

    try {
        await connectToDatabase();

        const organization = await Organization.findOne({ slug, isActive: true }).lean();

        if (!organization) {
            return { success: false, organization: null, experts: [], message: "Organization not found." };
        }

        // Fetch expert profiles
        const profiles = await ExpertProfile.find({
            _id: { $in: organization.affiliatedExperts },
            isVetted: true,                       // FIX: Profiles use isVetted, not isVerified
        })
            .select("-leaves -availability -workHistory -education")
            .sort({ rating: -1, reviewCount: -1 })
            .populate({
                path: "user",
                select: "name image isVerified",
                model: User,
            })
            .lean();

        // Flatten User into Profile structure for frontend card display
        const experts = profiles
            .map(profile => {
                if (!profile.user) return null;

                return {
                    ...profile,
                    _id: profile._id.toString(),
                    name: profile.user.name,
                    profilePicture: profile.user.image,
                    isVerified: profile.user.isVerified,
                };
            })
            .filter(Boolean);

        return {
            success: true,
            organization: JSON.parse(JSON.stringify(organization)),
            experts: JSON.parse(JSON.stringify(experts)),
        };
    } catch (error) {
        console.error(`[OrganizationsAction] getOrganizationBySlugAction (${slug}) Error:`, error);
        return {
            success: false,
            organization: null,
            experts: [],
            message: "Failed to fetch organization details.",
        };
    }
}
