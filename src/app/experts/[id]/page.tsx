import { notFound } from "next/navigation";
import ExpertProfileClient from "@/components/ExpertProfileClient";

export const dynamic = "force-dynamic";

/**
 * Dynamic SEO Metadata
 */
export async function generateMetadata({ params }) {
  return { title: "Expert Not Found | Mind Namo" };
}

/**
 * Page
 */
export default async function ExpertProfilePage({ params }) {
  notFound();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <ExpertProfileClient expert={{}} />
    </div>
  );
}
