import React, { Suspense } from 'react';
import SubscriptionsPage from '@/components/page/Subscriptions';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

export default function Subscriptions() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading..." />}>
      <SubscriptionsPage />
    </Suspense>
  );
}