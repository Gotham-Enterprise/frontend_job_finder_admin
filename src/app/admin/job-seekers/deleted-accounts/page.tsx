import React, { Suspense } from 'react';
import DeletedJobSeekers from '@/components/page/DeletedJobSeekers';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

function DeletedJobSeekersContent() {
  return <DeletedJobSeekers />;
}

export default function DeletedJobSeekersPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading deleted job seekers..." />}>
      <DeletedJobSeekersContent />
    </Suspense>
  );
}
