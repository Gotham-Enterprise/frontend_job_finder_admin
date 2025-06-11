"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CompanyReviews from "@/components/page/CompanyReviews";
import NotFoundState from "@/components/common/NotFoundState";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

function CompanyReviewsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  if (!id) {
    return (      
    <div className="flex items-center justify-center min-h-screen">
        <NotFoundState 
          title="Access Required"
          message="Unable to access company reviews. Please contact support for assistance."
          className="w-full max-w-md"
        />
      </div>
    );
  }

  return <CompanyReviews id={id} />;
}

export default function CompanyReviewsPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading..." />}>
      <CompanyReviewsContent />
    </Suspense>
  );
}