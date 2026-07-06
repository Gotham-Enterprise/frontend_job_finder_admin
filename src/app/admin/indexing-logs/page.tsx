import React, { Suspense } from "react";
import IndexingLogs from "@/components/page/IndexingLogs";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

function IndexingLogsContent() {
  return (
    <IndexingLogs />
  );
}

export default function IndexingLogsPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading indexing logs..." />}>
      <IndexingLogsContent />
    </Suspense>
  );
}
