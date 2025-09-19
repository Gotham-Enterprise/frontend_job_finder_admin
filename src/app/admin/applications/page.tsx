import React, { Suspense } from 'react';
import JobApplications from '@/components/page/Applications';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';
import PermissionGuard from '@/components/guards/PermissionGuard';

function ApplicationsContent() {
  return (
    <PermissionGuard requiredPermission="applications" requiredAction="view">
      <JobApplications />
    </PermissionGuard>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading applications..." />}>
      <ApplicationsContent />
    </Suspense>
  );
}   