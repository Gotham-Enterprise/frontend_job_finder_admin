import React from "react";
import ViewDetails from "@/components/page/Supervisee/ViewDetails/index";

interface SuperviseeDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function SuperviseeDetailsPage({ params }: SuperviseeDetailsProps) {
  const { id } = await params;

  return <ViewDetails id={id} />;
}
