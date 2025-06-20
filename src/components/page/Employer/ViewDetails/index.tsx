"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEmployerDetails } from "@/services/hooks/useEmployers";
import { formatDate } from "@/services/utils/dateUtils";
import ErrorState from "../../../common/ErrorState";
import FullScreenSpinner from "../../../ui/FullScreenSpinner";
import {
    CompanyProfile,
    JobPosts
} from "./components";
import BackToListButton from '@/components/ui/BackToListButton';

interface ViewDetailsProps {
    id: string;
}

export default function ViewDetails({ id }: ViewDetailsProps) {
    const router = useRouter();
    const { data, isLoading, error } = useEmployerDetails(id);

    const seeReviews = () => {
        router.push(`/admin/company-reviews?id=${id}`);
    };

    if (isLoading) {
        return <FullScreenSpinner isVisible={true} message="Loading employer details..." />;
    }

    if (error) {
        return (
            <div className="px-4 pt-4 pb-2">
                <BackToListButton href="/admin/employers" className="mb-6">
                Back to Employers
                </BackToListButton>

                <ErrorState 
                    message={`Error loading employer details: ${error.message}`}
                />
            </div>
        );
    }

    if (!data?.success || !data?.data) {
        return (
            <div className="px-4 pt-4 pb-2">
                 <BackToListButton href="/admin/employers" className="mb-6">
                Back to Employers
                </BackToListButton>
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Employer not found</p>
                </div>
            </div>
        );
    }    const employer = data.data;

    const contactInfo = [
        {
            label: 'Job Posts',
            value: `${employer.jobPostCount} ${employer.jobPostCount === 1 ? 'Post' : 'Posts'}`,
            className: 'text-gray-900 dark:text-white'
        },
        {
            label: 'Employees',
            value: `${employer.employeeCount}`,
            className: 'text-gray-900 dark:text-white'
        },
        {
            label: 'Total Applications',
            value: `${employer.totalApplicants}`,
            className: 'text-gray-900 dark:text-white'
        },
        {
            label: 'Email',
            value: employer.email,
            className: 'text-gray-900 dark:text-white break-all'
        },        {
            label: 'Phone',
            value: employer.phoneNumber || 'Not specified',
            className: 'text-gray-900 dark:text-white'
        },
        {
            label: 'Location',
            value: [employer.city, employer.state].filter(Boolean).join(', ') || employer.state || 'Not specified',
            className: 'text-gray-900 dark:text-white text-right'
        },
        {
            label: 'Joined',
            value: formatDate(employer.dateJoined),
            className: 'text-gray-900 dark:text-white'
        },
        {
            label: 'Last Active',
            value: formatDate(employer.lastActivity),
            className: 'text-gray-900 dark:text-white'
        }
    ];

    return (
        <>
        <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/employers" className="mb-6">
                Back to Employers
                </BackToListButton>
        </div>        <div className="p-4 grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="col-span-full xl:col-auto">
                <CompanyProfile 
                    employer={employer} 
                    contactInfo={contactInfo} 
                    onSeeReviews={seeReviews}
                    overview={employer.overview}
                />
            </div><div className="col-span-2 space-y-6">
                <JobPosts 
                    jobPosts={employer.jobPost || []}
                    formatDate={formatDate}
                />
            </div>
        </div>
        </>
    )
}
