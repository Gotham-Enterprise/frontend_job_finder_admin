import React, { Suspense } from "react";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import LandlordListings from "@/components/page/OfficeSpaceLandlords";

function LandlordsContent() {
  return <LandlordListings />;
}

export default function OfficeSpaceLandlordsPage() {
  return (
    <Suspense
      fallback={
        <FullScreenSpinner isVisible={true} message="Loading landlords..." />
      }
    >
      <LandlordsContent />
    </Suspense>
  );
}