"use client";
import React, { Suspense } from 'react';
import JobCreationDashboard from '@/components/page/JobCreation/JobCreationDashboard';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

const Loading = () => <FullScreenSpinner isVisible={true} />;

export default function CreateNewJob() {
  return (
    <Suspense fallback={<Loading />}>
      <JobCreationDashboard />
    </Suspense>
  );
}