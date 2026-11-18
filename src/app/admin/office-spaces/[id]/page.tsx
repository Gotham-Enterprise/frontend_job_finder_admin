import React from "react";
import OfficeSpaceViewDetails from "@/components/page/OfficeSpaceAdmin/ViewDetails";

interface OfficeSpaceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OfficeSpaceDetailPage({
  params,
}: OfficeSpaceDetailPageProps) {
  const { id } = await params;
  return <OfficeSpaceViewDetails id={id} />;
}
