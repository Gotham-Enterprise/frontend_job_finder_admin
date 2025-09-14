import React, { Suspense } from 'react';
import { DeactivatedJobSeekers } from '@/components/page/JobSeekers/components/DeactivatedJobSeekers';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

function DeactivatedJobSeekersContent() {
  return <DeactivatedJobSeekers />;
}

export default function DeactivatedJobSeekersPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading deactivated job seekers..." />}>
      <DeactivatedJobSeekersContent />
    </Suspense>
  );
}
