import React, { Suspense } from 'react';
import OccupationsData from '@/components/page/Occupations';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';
import PermissionGuard from '@/components/guards/PermissionGuard';

function OccupationsContent() {
  return (
    <PermissionGuard requiredPermission="jobs" requiredAction="view">
      <OccupationsData />
    </PermissionGuard>
  );
}

export default function OccupationsPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading occupations..." />}>
      <OccupationsContent />
    </Suspense>
  );
}

