import React from "react";
import ViewDetails from "@/components/page/Supervisor/ViewDetails/index";

interface MedicalDirectorDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function MedicalDirectorDetails({ params }: MedicalDirectorDetailsProps) {
  const { id } = await params;

  return <ViewDetails id={id} listPath="/admin/medical-directors" listLabel="Medical Directors" />;
}
