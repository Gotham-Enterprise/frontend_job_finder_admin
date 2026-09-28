import AdvertiserDetails from "@/components/page/Spotlight/AdvertiserDetails";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SpotlightAdvertiserPage({ params }: Props) {
  const { id } = await params;
  return <AdvertiserDetails id={id} />;
}
