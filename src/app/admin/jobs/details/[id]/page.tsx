import React from 'react';
import JobsAdminViewDetails from '@/components/page/JobsAdmin/ViewDetails';

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;
  
  return (
    <>
      <JobsAdminViewDetails id={id} />
    </>
  );
}
