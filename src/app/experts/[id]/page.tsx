import { notFound } from "next/navigation";
import ExpertProfileClient from "@/components/ExpertProfileClient";
import { getExpertProfileByIdApi } from "@/lib/directoryApi";

export const dynamic = "force-dynamic";

/**
 * Dynamic SEO Metadata
 */
export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const response = await getExpertProfileByIdApi(resolvedParams.id);
    if (response?.data) {
      const expert = response.data;
      return { 
        title: `${expert.name} - ${expert.specialization} | Mind Namo`,
        description: expert.bio?.substring(0, 160) || `Consult with ${expert.name} on Mind Namo.`,
      };
    }
  } catch (err) {}
  return { title: "Expert Not Found | Mind Namo" };
}

/**
 * Page
 */
export default async function ExpertProfilePage({ params }) {
  const resolvedParams = await Promise.resolve(params);
  let expert = null;

  try {
    const response = await getExpertProfileByIdApi(resolvedParams.id);
    if (response?.data) {
      expert = response.data;
    }
  } catch (err) {
    console.error("Failed to fetch expert profile:", err);
  }

  if (!expert) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <ExpertProfileClient expert={expert} />
    </div>
  );
}
