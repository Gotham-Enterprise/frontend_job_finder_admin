import React, { Suspense } from "react";
import CampaignPlans from "@/components/page/CampaignPlans";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

export default function CampaignPlansPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading plans..." />}>
      <CampaignPlans />
    </Suspense>
  );
}
