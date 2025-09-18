import React, { Suspense } from 'react';
import DeletedJobSeekers from '@/components/page/DeletedJobSeekers';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';
import BackToListButton from '@/components/ui/BackToListButton';

function DeletedJobSeekersContent() {
  return <DeletedJobSeekers />;
}

export default function DeletedJobSeekersPage() {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center">
        <BackToListButton 
          href="/admin/job-seekers" 
          preserveState={true}
          className="mb-0"
        >
          Back to Job Seekers
        </BackToListButton>
      </div>

      {/* Main Content */}
      <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading deleted job seekers..." />}>
        <DeletedJobSeekersContent />
      </Suspense>
    </div>
  );
}
