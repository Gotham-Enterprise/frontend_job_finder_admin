import ViewDetails from "@/components/page/DocumentVerification/ViewDetails";

interface Props {
  params: Promise<{ kind: string; id: string }>;
}

export default async function DocumentVerificationDetails({ params }: Props) {
  const { kind, id } = await params;

  return <ViewDetails kind={kind} id={id} />;
}
