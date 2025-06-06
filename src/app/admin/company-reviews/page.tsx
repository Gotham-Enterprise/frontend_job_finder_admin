"use client";

import { useSearchParams } from "next/navigation";
import CompanyReviews from "@/components/page/CompanyReviews";
import NotFoundState from "@/components/common/NotFoundState";

export default function CompanyReviewsPage() {
  const searchParams = useSearchParams();
  const candidateId = searchParams.get('candidateId');

  if (!candidateId) {
    return (      <div className="flex items-center justify-center min-h-screen">
        <NotFoundState 
          title="Access Required"
          message="Unable to access company reviews. Please contact support for assistance."
          className="w-full max-w-md"
        />
      </div>
    );
  }

  return <CompanyReviews candidateId={candidateId} />;
}