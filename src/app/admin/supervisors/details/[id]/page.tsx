import React from "react";
import ViewDetails from "@/components/page/Supervisor/ViewDetails/index";

interface SupervisorDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function SupervisorDetails({ params }: SupervisorDetailsProps) {
  const { id } = await params;

  return (
    <>
      <ViewDetails id={id} />
    </>
  );
}
