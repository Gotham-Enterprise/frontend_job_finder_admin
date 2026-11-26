import React, { Suspense } from "react";
import CampaignManaged from "@/components/page/CampaignManaged";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

export default function ManagedCampaignsPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading managed campaigns..." />}>
      <CampaignManaged />
    </Suspense>
  );
}
