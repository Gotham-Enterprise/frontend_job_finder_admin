import React, { Suspense } from "react";
import CampaignEnquiries from "@/components/page/CampaignEnquiries";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

export default function CampaignEnquiriesPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading campaign enquiries..." />}>
      <CampaignEnquiries />
    </Suspense>
  );
}
