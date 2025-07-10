import React, { Suspense } from 'react';
import CouponsData from '@/components/page/Coupons';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

function CouponsContent() {
  return <CouponsData />;
}

export default function CouponsPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading coupons..." />}>
      <CouponsContent />
    </Suspense>
  );
}