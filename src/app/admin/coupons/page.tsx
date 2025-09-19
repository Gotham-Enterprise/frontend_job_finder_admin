import React, { Suspense } from 'react';
import CouponsData from '@/components/page/Coupons';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';
import PermissionGuard from '@/components/guards/PermissionGuard';

function CouponsContent() {
  return (
    <PermissionGuard requiredPermission="coupons" requiredAction="view">
      <CouponsData />
    </PermissionGuard>
  );
}

export default function CouponsPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading coupons..." />}>
      <CouponsContent />
    </Suspense>
  );
}