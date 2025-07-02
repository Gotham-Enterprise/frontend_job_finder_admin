'use client';

import React, { Suspense } from 'react';
import PricingTable from '@/components/page/PricingTable';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

function PricingContent() {
  return <PricingTable />;
}

export default function PricingPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading pricing plans..." />}>
      <PricingContent />
    </Suspense>
  );
}
