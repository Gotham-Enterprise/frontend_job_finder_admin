import React from "react";
import ViewDetails from "@/components/page/SupervisionPayments/ViewDetails";

interface BillingWeekDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function BillingWeekDetailsPage({ params }: BillingWeekDetailsPageProps) {
  const { id } = await params;

  return <ViewDetails id={id} />;
}
