import React, { Suspense } from "react";

import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import JobSeekerNewsletter from "@/components/page/JobSeekerNewsletter";

function JobSeekerNewsletterContent() {
  return <JobSeekerNewsletter />;
}

export default function JobSeekerNewsletterPage() {
  return (
    <Suspense
      fallback={
        <FullScreenSpinner isVisible={true} message="Loading newsletter..." />
      }
    >
      <JobSeekerNewsletterContent />
    </Suspense>
  );
}
