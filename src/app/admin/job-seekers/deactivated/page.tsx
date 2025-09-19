import React, { Suspense } from 'react';
import { DeactivatedJobSeekers } from '@/components/page/JobSeekers/components/DeactivatedJobSeekers';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';
import BackToListButton from '@/components/ui/BackToListButton';


function DeactivatedJobSeekersContent() {
  return <DeactivatedJobSeekers />;
}

export default function DeactivatedJobSeekersPage() {
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
      <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading deactivated job seekers..." />}>
        <DeactivatedJobSeekersContent />
      </Suspense>
    </div>
  );
}
