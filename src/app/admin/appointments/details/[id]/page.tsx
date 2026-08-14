import ViewDetails from "@/components/page/Appointments/ViewDetails";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AppointmentDetailsPage({ params }: Props) {
  const { id } = await params;

  return <ViewDetails id={id} />;
}
