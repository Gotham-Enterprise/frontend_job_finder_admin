"use client";
import React from "react";
import { useJobsAdminDetails } from "@/services/hooks/useJobsAdmin";
import { formatDate } from "@/services/utils/dateUtils";
import ErrorState from "../../../common/ErrorState";
import FullScreenSpinner from "../../../ui/FullScreenSpinner";
import ProfileCard from "@/components/ui/ProfileCard";
import { ProfileData, ContactInfo } from "@/services/types/ProfileCard";
import BackToListButton from '@/components/ui/BackToListButton';

interface ViewDetailsProps {
    id: string;
}

export default function ViewDetails({ id }: ViewDetailsProps) {
    const { data, isLoading, error } = useJobsAdminDetails(id);

    if (isLoading) {
        return <FullScreenSpinner isVisible={true} message="Loading job details..." />;
    }

    if (error) {
        return (
            <div className="px-4 pt-4 pb-2">
                <BackToListButton href="/admin/jobs">
                    Back to Jobs
                </BackToListButton>
                <ErrorState 
                    message={`Error loading job details: ${error.message}`}
                />
            </div>
        );
    }

    if (!data?.success || !data?.data) {
        return (
            <div className="px-4 pt-4 pb-2">
                <BackToListButton href="/admin/jobs">
                    Back to Jobs
                </BackToListButton>
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Job not found</p>
                </div>
            </div>
        );
    }
    
    const job = data.data;

    const profileData: ProfileData = {
        name: job.title,
        title: job.occupation,
        status: job.workType || 'Full-time',
    };

    const formatSalaryRange = (start: number, end: number, currency: string) => {
        return `${currency}${start.toLocaleString()} - ${currency}${end.toLocaleString()}`;
    };

    const contactInfo: ContactInfo[] = [
        {
            label: 'Company',
            value: job.companyId,
            className: 'text-gray-900 dark:text-white',
            icon: (
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
            )
        },
        {
            label: 'Location',
            value: job.location,
            className: 'text-gray-900 dark:text-white',
            icon: (
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
            )
        },
        ...(job.isSalaryVisible && job.salaryRangeStart && job.salaryRangeEnd ? [{
            label: 'Salary Range',
            value: formatSalaryRange(job.salaryRangeStart, job.salaryRangeEnd, job.salaryCurrency),
            className: 'text-green-600 dark:text-green-400',
            icon: (
                <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                </div>
            )
        }] : []),
        {
            label: 'Work Setting',
            value: job.workSetting || 'Not specified',
            className: 'text-gray-900 dark:text-white',
            icon: (
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8m0 0v.01M8 6v10a2 2 0 002 2h4a2 2 0 002 2V6M8 6H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-2" />
                    </svg>
                </div>
            )
        },
        {
            label: 'Work Facility',
            value: job.workFacility || 'Not specified',
            className: 'text-gray-900 dark:text-white',
            icon: (
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
            )
        },
        {
            label: 'Date Posted',
            value: formatDate(job.datePosted),
            className: 'text-gray-900 dark:text-white',
            icon: (
                <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            )
        },
        {
            label: 'Applicants',
            value: `${job.applicantCount || 0} applications`,
            className: 'text-blue-600 dark:text-blue-400',
            icon: (
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                </div>
            )
        }
    ];

    return (
        <>
            <div className="px-4 pt-4 pb-2">
                <BackToListButton href="/admin/jobs">
                    Back to Jobs
                </BackToListButton>
            </div>

            <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-6">
                <div className="col-span-full xl:col-auto">
                    <ProfileCard 
                        profileData={profileData} 
                        contactInfo={contactInfo}
                        showStatusIndicator={false}
                        showDocuments={false}
                        showContactInfo={true}
                        className="mb-6"
                        avatarSize="lg"
                        variant="default"
                    />
                </div>

                <div className="col-span-2 space-y-6">
                    <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Job Description</h3>
                        </div>
                        
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                            <div 
                                className="text-gray-700 dark:text-gray-300 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: job.jobDescription || 'No job description provided' }}
                            />
                        </div>
                    </div>

                    {job.applicationId && (
                        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                            <div className="flex items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Application Status</h3>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Application ID: {job.applicationId}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
