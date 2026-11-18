import React, { Suspense } from "react";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import OfficeSpaceListings from "@/components/page/OfficeSpaceAdmin";

function OfficeSpaceListingsContent() {
  return <OfficeSpaceListings />;
}

export default function OfficeSpacesPage() {
  return (
    <Suspense
      fallback={
        <FullScreenSpinner isVisible={true} message="Loading office spaces..." />
      }
    >
      <OfficeSpaceListingsContent />
    </Suspense>
  );
}
