import React from 'react';
import JobDetails from '@/components/page/Employer/Jobs/';

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
