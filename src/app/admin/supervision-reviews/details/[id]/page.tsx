import React from "react";
import ViewDetails from "@/components/page/SupervisionReviews/ViewDetails";

interface ReviewDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewDetailsPage({
  params,
}: ReviewDetailsPageProps) {
  const { id } = await params;

  return <ViewDetails id={id} />;
}
