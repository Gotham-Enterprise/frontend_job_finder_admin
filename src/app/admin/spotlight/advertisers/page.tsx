import { Suspense } from "react";

import AdvertiserList from "@/components/page/Spotlight/AdvertiserList";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

export default function SpotlightAdvertisersPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading advertisers..." />}>
      <AdvertiserList />
    </Suspense>
  );
}
