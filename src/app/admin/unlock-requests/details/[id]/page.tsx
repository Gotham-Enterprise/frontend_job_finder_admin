import ViewDetails from "@/components/page/IDApproval/ViewDetails";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UnlockRequestsDetails({ params }: Props) {
  const { id } = await params;

  return <ViewDetails id={id} />;
}
