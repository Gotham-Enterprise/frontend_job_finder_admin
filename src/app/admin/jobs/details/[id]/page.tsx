import React from 'react';
import JobDetails from '@/components/page/Jobs/ViewDetails';

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;
  
  return (
    <>
      <JobDetails id={id} />
    </>
  );
}
