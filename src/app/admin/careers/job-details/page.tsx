"use client";

import React from 'react';
import { Suspense } from 'react';
import JobDetailsView from '@/components/page/Careers/JobDetails';

// Next.js 15 Page component: loosen typing to satisfy framework's PageProps inference
export default function JobDetailsPage(props: { params: { id: string } } | any) {
  const resolvedParams = (props as any).params || { id: '' };
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    }>
  <JobDetailsView jobId={resolvedParams.id} />
    </Suspense>
  );
}
