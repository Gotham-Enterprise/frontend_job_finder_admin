import { Suspense } from "react";

import CampaignList from "@/components/page/Spotlight/CampaignList";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

export default function SpotlightCampaignsPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading campaigns..." />}>
      <CampaignList />
    </Suspense>
  );
}
