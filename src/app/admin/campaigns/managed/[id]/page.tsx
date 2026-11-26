"use client";

import React from "react";
import { useParams } from "next/navigation";
import PrepareCampaign from "@/components/page/CampaignManaged/PrepareCampaign";

export default function PrepareManagedCampaignPage() {
  const { id } = useParams<{ id: string }>();
  return <PrepareCampaign id={id} />;
}
