import React, { Suspense } from "react";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import OfficeSpaceIngest from "@/components/page/OfficeSpaceIngest";

function OfficeSpaceIngestContent() {
  return <OfficeSpaceIngest />;
}

export default function OfficeSpaceIngestPage() {
  return (
    <Suspense
      fallback={
        <FullScreenSpinner isVisible={true} message="Loading office space ingest..." />
      }
    >
      <OfficeSpaceIngestContent />
    </Suspense>
  );
}