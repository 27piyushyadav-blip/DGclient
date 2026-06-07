import { loadSpecificVenuePageData } from "@/app/main/specific/[id]/specificVenuePageData";
import MobileSpecificVenueClient from "./MobileSpecificVenueClient";

export const dynamic = "force-dynamic";

type MobileSpecificPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MobileSpecificVenuePage({ params }: MobileSpecificPageProps) {
  const { id } = await params;
  const data = await loadSpecificVenuePageData(id);

  return <MobileSpecificVenueClient {...data} />;
}
