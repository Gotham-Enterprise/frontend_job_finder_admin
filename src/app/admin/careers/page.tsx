import React, { Suspense } from 'react';
import Careers from '@/components/page/Careers';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

function CareersContent() {
  return <Careers />;
}

export default function CareersPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading careers..." />}>
      <CareersContent />
    </Suspense>
  );
}