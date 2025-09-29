import React, { Suspense } from 'react';
import JobsAdmin from '@/components/page/JobsAdmin';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';
import PermissionGuard from '@/components/guards/PermissionGuard';

function JobsContent() {
  return (
    <PermissionGuard requiredPermission="jobs" requiredAction="view">
      <JobsAdmin />
    </PermissionGuard>
  );
}

export default function Jobs() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading jobs..." />}>
      <JobsContent />
    </Suspense>
  );
}