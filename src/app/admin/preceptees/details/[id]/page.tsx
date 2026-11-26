import React from "react";
import ViewDetails from "@/components/page/Supervisee/ViewDetails/index";

interface PrecepteeDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function PrecepteeDetailsPage({ params }: PrecepteeDetailsProps) {
  const { id } = await params;

  return <ViewDetails id={id} listPath="/admin/preceptees" />;
}
