import React, { Suspense } from 'react';
import JobSeekers from '@/components/page/JobSeekers';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

function JobSeekersContent() {
  return <JobSeekers />;
}

export default function JobSeekersPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading job seekers..." />}>
      <JobSeekersContent />
    </Suspense>
  );
}