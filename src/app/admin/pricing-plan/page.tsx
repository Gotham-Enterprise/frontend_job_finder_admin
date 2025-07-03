import React, { Suspense } from 'react';
import PricingPlan from '@/components/page/PricingPlan';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

export default function PricingPlanPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading pricing plans..." />}>
      <PricingPlan />
    </Suspense>
  );
}