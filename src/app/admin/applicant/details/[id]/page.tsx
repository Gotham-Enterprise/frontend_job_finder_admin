import React from 'react';
import ApplicantDetails from '@/components/page/Applicant';

interface ApplicantDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicantDetailsPage({ params }: ApplicantDetailsPageProps) {
  const { id } = await params;
  
  return (
     <ApplicantDetails id={id} />
  );
}
