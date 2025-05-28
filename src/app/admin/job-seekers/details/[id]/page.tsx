import React from 'react';
import ViewDetails from '@/components/page/JobSeekers/ViewDetails';

interface JobSeekersDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function JobSeekersDetails({ params }: JobSeekersDetailsProps) {
  const { id } = await params;
  
  return (
      <>
      <ViewDetails id={id} />
      </>
  );
}