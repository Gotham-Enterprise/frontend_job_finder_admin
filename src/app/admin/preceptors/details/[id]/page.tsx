import React from "react";
import ViewDetails from "@/components/page/Supervisor/ViewDetails/index";

interface PreceptorDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function PreceptorDetails({ params }: PreceptorDetailsProps) {
  const { id } = await params;

  return <ViewDetails id={id} listPath="/admin/preceptors" />;
}
