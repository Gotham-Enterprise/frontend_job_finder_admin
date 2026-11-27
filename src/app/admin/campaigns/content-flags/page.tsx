import React, { Suspense } from "react";
import CampaignContentFlags from "@/components/page/CampaignContentFlags";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

export default function CampaignContentFlagsPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading flagged content..." />}>
      <CampaignContentFlags />
    </Suspense>
  );
}
