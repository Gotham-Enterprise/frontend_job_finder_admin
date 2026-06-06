import React, { Suspense } from "react";
import SupervisionReviews from "@/components/page/SupervisionReviews";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

function SupervisionReviewsContent() {
  return <SupervisionReviews />;
}

const SupervisionReviewsPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <FullScreenSpinner isVisible={true} message="Loading reviews..." />
      }
    >
      <SupervisionReviewsContent />
    </Suspense>
  );
};

export default SupervisionReviewsPage;
