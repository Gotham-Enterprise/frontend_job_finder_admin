import React, { Suspense } from "react";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import OpenaiBatchesData from "@/components/page/OpenaiBatches";

export default function OpenaiBatchesPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading AI batch monitoring..." />}>
      <OpenaiBatchesData />
    </Suspense>
  );
}
