"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "@/services/utils/dateUtils";
import { useJobDetails } from "@/services/hooks/useJobs";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import ErrorState from "@/components/common/ErrorState";
import Button from "@/components/ui/button/Button";

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
    };

    const viewApplicantDetails = (candidateId: string) => {
        router.push(`/admin/applicant/${candidateId}`);
    };return (
        <>            
            <div className="px-4 pt-4 pb-2">
                <Link 
                    href="/admin/jobs"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Jobs
                </Link>
            </div>

            <div className="p-6 space-y-6">
                {/* Job Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {job.title}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                                {job.occupation || 'Company Name'}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getJobStatusVariant('active')}`}>
                                Active
                            </span>
                            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                {job.workType}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Job Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Job Details */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Details</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Work Type</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{job.workType}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Salary Range</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {job.isSalaryVisible 
                                                ? formatSalaryRange(job.salaryRangeStart, job.salaryRangeEnd, job.salaryCurrency)
                                                : 'Not disclosed'
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{job.location}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Work Setting</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{job.workSetting}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Description</h3>
                            <div 
                                className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: job.jobDescription }}
                            />
                        </div>
                    </div>

                    {/* Right Column - Applicants Table */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Applicants ({applicants.length})
                                </h3>
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                    </svg>
                                </div>
                            </div>                            <div className="space-y-4">
                                {applicants.map((applicant) => (
                                    <div key={applicant.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                                    {applicant.name}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                                                    {applicant.email}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
                                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusVariant(applicant.status)}`}>
                                                    {applicant.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-end mt-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => viewApplicantDetails(applicant.candidateId)}
                                                    className="text-xs h-8 px-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                                    startIcon={
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    }
                                                >
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {metaData.totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Page {metaData.page} of {metaData.totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                            disabled={!metaData.hasPreviousPage}
                                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setPage(prev => prev + 1)}
                                            disabled={!metaData.hasNextPage}
                                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}

                            {applicants.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400">No applications yet</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Applications will appear here when received</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
