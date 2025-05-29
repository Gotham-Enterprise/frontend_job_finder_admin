import React from 'react';
import ViewDetails from '@/components/page/Employer/ViewDetails/index';

interface EmployerDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function EmployerDetails({ params }: EmployerDetailsProps) {
  const { id } = await params;
  
  return (
      <>
      <ViewDetails id={id} />
      </>
  );
}