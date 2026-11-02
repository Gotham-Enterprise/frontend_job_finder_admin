import React from "react";
import MonthlyPeriodDetails from "@/components/page/SupervisionMonthlyPayments/ViewDetails";

interface MonthlyPeriodDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function MonthlyPeriodDetailsPage({ params }: MonthlyPeriodDetailsPageProps) {
  const { id } = await params;

  return <MonthlyPeriodDetails id={id} />;
}
