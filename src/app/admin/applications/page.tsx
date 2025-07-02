import React, { Suspense } from 'react';
import JobApplications from '@/components/page/Applications';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

function ApplicationsContent() {
  return <JobApplications />;
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading applications..." />}>
      <ApplicationsContent />
    </Suspense>
  );
}   