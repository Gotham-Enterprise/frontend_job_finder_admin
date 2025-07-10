import React, { Suspense } from 'react';
import JobsAdmin from '@/components/page/JobsAdmin';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

function JobsContent() {
  return <JobsAdmin />;
}

export default function Jobs() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading jobs..." />}>
      <JobsContent />
    </Suspense>
  );
}