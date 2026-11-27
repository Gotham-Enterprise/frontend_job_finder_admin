import React, { Suspense } from "react";
import CampaignInquiries from "@/components/page/CampaignInquiries";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

export default function CampaignInquiriesPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading campaign inquiries..." />}>
      <CampaignInquiries />
    </Suspense>
  );
}
