import React, { Suspense } from "react";

import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import EmailCampaignSettings from "@/components/page/EmailCampaignSettings";

function EmailCampaignSettingsContent() {
  return <EmailCampaignSettings />;
}

export default function EmailCampaignSettingsPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading email campaign settings..." />}>
      <EmailCampaignSettingsContent />
    </Suspense>
  );
}
