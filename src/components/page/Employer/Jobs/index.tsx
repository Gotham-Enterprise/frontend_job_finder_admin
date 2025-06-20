"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useJobDetails } from "@/services/hooks/useJobs";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import ErrorState from "@/components/common/ErrorState";
import NotFoundState from "@/components/common/NotFoundState";
import BackButton from '@/components/ui/BackButton';
import { JobHeader, Applicants } from './components';
import { getApplicantStatusVariant, getJobStatusVariant } from '@/services/utils/statusVariants';

interface ViewDetailsProps {
    id: string;
}

export default function ViewDetails({ id }: ViewDetailsProps) {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    
    const { data, isLoading, isError, error } = useJobDetails(id, { page, limit });
      if (isLoading) {
        return <LoadingSkeleton variant="jobDetails" />;
    }    if (isError) {
        return (
            <ErrorState
                variant="jobDetails"
                title="Error loading job details"
                message={error instanceof Error ? error.message : 'Failed to load job details. Please try again.'}
                showRetryButton={false}
            />
        );
    }    if (!data?.success || !data?.data) {
        return <NotFoundState />;
    }

    const { job, applicants } = data.data;
    const { metaData } = data;    const formatSalaryRange = (start: number, end: number, currency: string) => {
        return `${currency}${start.toLocaleString()} - ${currency}${end.toLocaleString()}`;
    };
    
    const viewApplicantDetails = (applicantId: string) => {
        router.push(`/admin/applicant/details/${applicantId}`);
    };
    
    return (
        <>            
            <div className="px-4 pt-4 pb-2">
                <BackButton className="mb-6" />
            </div>            
            <div className="p-6 space-y-6">
                <JobHeader 
                    job={job}
                    getJobStatusVariant={getJobStatusVariant}
                    formatSalaryRange={formatSalaryRange}
                />
                <Applicants
                    applicants={applicants}
                    metaData={metaData}
                    isLoading={isLoading}
                    onViewApplicant={viewApplicantDetails}
                    onPageChange={setPage}
                    getStatusVariant={getApplicantStatusVariant}
                />
            </div>
        </>
    );
}
