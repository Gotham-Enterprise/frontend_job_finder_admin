import CampaignDetails from "@/components/page/Spotlight/CampaignDetails";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SpotlightCampaignPage({ params }: Props) {
  const { id } = await params;
  return <CampaignDetails id={id} />;
}
