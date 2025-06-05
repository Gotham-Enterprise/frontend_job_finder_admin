"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useJobDetails } from "@/services/hooks/useJobs";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import ErrorState from "@/components/common/ErrorState";
import BackButton from '@/components/ui/BackButton';
import JobHeader from './components/JobHeader';
import JobDetailsCard from './components/JobDetailsCard';
import JobDescriptionCard from './components/JobDescriptionCard';
import ApplicantsList from './components/ApplicantsList';

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
    }

    if (!data?.success || !data?.data) {
        return (
            <div className="p-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="text-center">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Job not found
                        </h3>
                        <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                            The requested job could not be found.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const { job, applicants } = data.data;
    const { metaData } = data;

    const formatSalaryRange = (start: number, end: number, currency: string) => {
        return `${currency}${start.toLocaleString()} - ${currency}${end.toLocaleString()}`;
    };

    const parseJobDescription = (htmlDescription: string) => {
       
        return htmlDescription.replace(/<[^>]*>/g, '').trim();
    };    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'under review':
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'interview scheduled':
            case 'interviewing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'shortlisted':
            case 'accepted':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'rejected':
            case 'declined':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'hired':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };    const getJobStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'closed':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'paused':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };    const viewApplicantDetails = (applicantId: string) => {
        router.push(`/admin/applicant/details/${applicantId}`);
    };return (
        <>            
            <div className="px-4 pt-4 pb-2">
                <BackButton className="mb-6" />
            </div>            <div className="p-6 space-y-6">
                
                <JobHeader 
                    job={job}
                    getJobStatusVariant={getJobStatusVariant}
                />

           
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   
                    <div className="lg:col-span-2 space-y-6">
                        <JobDetailsCard 
                            job={job}
                            formatSalaryRange={formatSalaryRange}
                        />
                        
                        <JobDescriptionCard 
                            jobDescription={job.jobDescription}
                        />
                    </div>

                 
                    <div className="lg:col-span-1">
                        <ApplicantsList 
                            applicants={applicants}
                            metaData={metaData}
                            page={page}
                            setPage={setPage}
                            getStatusVariant={getStatusVariant}
                            onViewApplicantDetails={viewApplicantDetails}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
