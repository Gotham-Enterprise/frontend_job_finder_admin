import React, { Suspense } from "react";
import BatchApiJobs from "@/components/page/BatchApiJobs";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import PermissionGuard from "@/components/guards/PermissionGuard";

function BatchApiJobsContent() {
  return (
    <PermissionGuard requiredPermission="jobs" requiredAction="view">
      <BatchApiJobs />
    </PermissionGuard>
  );
}

export default function BatchApiJobsPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading batch API jobs..." />}>
      <BatchApiJobsContent />
    </Suspense>
  );
}
