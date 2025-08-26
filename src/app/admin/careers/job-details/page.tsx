'use client';

import React from 'react';
import { Suspense } from 'react';
import JobDetailsView from '@/components/page/Careers/JobDetails';

export default function JobDetailsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    }>
      <JobDetailsView />
    </Suspense>
  );
}
