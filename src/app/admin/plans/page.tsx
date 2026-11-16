import React, { Suspense } from 'react';
import PlansPage from '@/components/page/Plans';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

export default function AdminPlansPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading plans..." />}>
      <PlansPage />
    </Suspense>
  );
}
