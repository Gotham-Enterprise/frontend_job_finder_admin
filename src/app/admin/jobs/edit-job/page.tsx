"use client";
import React, { Suspense } from 'react';
import JobEditDashboard from '@/components/page/JobEdit/JobEditDashboard';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

const Loading = () => <FullScreenSpinner isVisible={true} />;

export default function EditJob() {
  return (
    <Suspense fallback={<Loading />}>
      <JobEditDashboard />
    </Suspense>
  );
}
