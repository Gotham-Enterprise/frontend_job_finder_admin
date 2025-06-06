  "use client";

import { useCompanyReviews } from "@/services/hooks/useEmployers";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import ErrorState from "@/components/common/ErrorState";
import BackButton from "@/components/ui/BackButton";
import CompanyInfo from "./CompanyInfo";
import CompanyReviewsList from "./CompanyReviewsList";

interface CompanyReviewsProps {
  id: string;
}

export default function CompanyReviews({ id }: CompanyReviewsProps) {
  const { data, isLoading, error } = useCompanyReviews(id);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState message="Failed to load company reviews" />;
  }

  if (!data?.success || !data?.data) {
    return <ErrorState message="No company reviews found" />;
  }
  const companyData = data.data;

  return (
    <div className="p-6 space-y-6">
      <div className="px-4 pt-4 pb-2">
        <BackButton className="mb-6" />
      </div>      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
     
        <div className="space-y-6">
          <CompanyInfo companyData={companyData} />
        </div>
        <div className="space-y-6">
          <CompanyReviewsList companyData={companyData} />
        </div>
      </div>
    </div>
  );
}